import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from botocore.exceptions import NoCredentialsError
from .s3 import upload_file
from .serializers import UserSerializer, ProfileSerializer, ChatSerializer, MessageSerializer, \
    ProfileBlockedMapSerializer, PictureSerializer, TrackSerializer
from .models import Profile, ProfileBlockedMap, Chat, Message, ProfilePicture, ProfileTrack
from knox.views import LoginView as KnoxLoginView
from .permissions import ChatPermission, MessagePermission, UserPermission, ProfilePermission, BlockPermission, \
    PicturePermission, TrackPermission
from datetime import datetime
from .cryptography import decrypt
from rest_framework import permissions
from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.contrib.auth import login


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        user = request.data.copy()
        user['password'] = decrypt(user['password'])
        serializer = AuthTokenSerializer(data=user)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [ProfilePermission]
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['patch'])
    def search(self, request):
        search_prompt = request.data.copy()
        is_empty = True
        query = "select * "
        params = []
        location_search = False

        latitude_float = 0
        longitude_float = 0
        distance_int = 0

        if 'latitude' in search_prompt and 'longitude' in search_prompt and 'distance' in search_prompt:
            location_search = True
            is_empty = False
            try:
                latitude_float = float(search_prompt['latitude'])
                longitude_float = float(search_prompt['longitude'])
                distance_int = int(search_prompt['distance'])
            except ValueError:
                return Response("Coordinates and distance should be a number.", status=status.HTTP_400_BAD_REQUEST)

            if latitude_float > 90 or latitude_float < -90:
                return Response("Latitude not in correct range.", status=status.HTTP_400_BAD_REQUEST)

            if longitude_float > 180 or longitude_float < -180:
                return Response("Longitude not in correct range.", status=status.HTTP_400_BAD_REQUEST)

            if distance_int > 20000 or distance_int < 1:
                return Response("Distance not in correct range.", status=status.HTTP_400_BAD_REQUEST)

            query += ", calculate_distance(latitude, longitude, %s, %s) distance "
            params.append(latitude_float)
            params.append(longitude_float)

        query += "from backend_profile where True and id != %s "
        params.append(request.user.profile.id)
        if 'lower_age' in search_prompt and 'higher_age' in search_prompt:
            try:
                lower_age_int = int(search_prompt['lower_age'])
                higher_age_int = int(search_prompt['higher_age'])
            except ValueError:
                return Response("Age should be a number.", status=status.HTTP_400_BAD_REQUEST)

            if lower_age_int > higher_age_int:
                return Response("Incorrect age range.", status=status.HTTP_400_BAD_REQUEST)

            if lower_age_int < 13 or higher_age_int < 13 or lower_age_int > 100 or higher_age_int > 100:
                return Response("Age out of range.", status=status.HTTP_400_BAD_REQUEST)

            is_empty = False
            query += "and Age(CURRENT_TIMESTAMP, birth_date) between interval '%s years' and interval '%s years' "
            params.append(lower_age_int)
            params.append(higher_age_int)

        if 'proficiency' in search_prompt:
            proficiency = search_prompt['proficiency']
            if proficiency not in ['novice', 'medium', 'expert']:
                return Response("Incorrect proficiency.", status=status.HTTP_400_BAD_REQUEST)

            is_empty = False
            query += "and proficiency = %s "
            params.append(proficiency)

        if 'instruments' in search_prompt:
            instruments = search_prompt['instruments']
            if not isinstance(instruments, list) or len(instruments) == 0:
                return Response("Instruments should be a non-empty list.", status=status.HTTP_400_BAD_REQUEST)

            is_empty = False
            query += "and %s ::varchar[] && instruments "
            params.append(instruments)

        if 'genres' in search_prompt:
            genres = search_prompt['genres']
            if not isinstance(genres, list) or len(genres) == 0:
                return Response("Genres should be a non-empty list.", status=status.HTTP_400_BAD_REQUEST)

            is_empty = False
            query += "and %s ::varchar[] && genres "
            params.append(genres)

        if location_search:
            query += "and calculate_distance(latitude, longitude, %s, %s) <= %s order by distance"

            params.append(latitude_float)
            params.append(longitude_float)
            params.append(distance_int)

        if is_empty:
            return Response("Provided search request is empty.", status=status.HTTP_400_BAD_REQUEST)

        profiles = Profile.objects.raw(query, params)
        page = self.paginate_queryset(profiles)
        if page is not None:
            serializer = ProfileSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ProfileSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True)
    def chats(self, request, pk=None):
        queryset = Profile.objects.all()
        profile = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, profile)
        active_chats = profile.recipient.filter(is_active=True).order_by('started_date_time') | profile.starter.filter(
            is_active=True).order_by('started_date_time')

        page = self.paginate_queryset(active_chats)
        try:
            request.query_params['page']
            if page is not None:
                serializer = ChatSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        except KeyError:
            serializer = ChatSerializer(active_chats, many=True, context={'request': request})
            return Response(serializer.data)

    @action(detail=True)
    def picture(self, request, pk=None):
        queryset = Profile.objects.all()
        profile = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, profile)
        active_picture = profile.pictures.filter(is_active=True).order_by('-change_date_time').first()
        if not active_picture:
            return Response({})

        serializer = PictureSerializer(active_picture)
        return Response(serializer.data)

    @action(detail=True)
    def tracks(self, request, pk=None):
        queryset = Profile.objects.all()
        profile = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, profile)
        active_tracks = profile.tracks.filter(is_active=True).order_by('added_date_time')

        page = self.paginate_queryset(active_tracks)
        if page is not None:
            serializer = TrackSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TrackSerializer(active_tracks, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True)
    def blocker(self, request, pk=None):
        queryset = Profile.objects.all()
        profile = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, profile)
        blocker_profile_maps = ProfileBlockedMap.objects.raw(
            """select * from (SELECT
               DISTINCT ON (blocker_id, blocked_id) *
            FROM
               backend_profileblockedmap
               where blocker_id = %s 
            ORDER BY
               blocker_id,
               blocked_id,
               change_date_time desc) as query where is_blocked = True""", [pk])

        blocker_profiles = Profile.objects.filter(blocked__in=blocker_profile_maps)

        page = self.paginate_queryset(blocker_profiles)
        try:
            request.query_params['page']
            if page is not None:
                serializer = ProfileSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        except KeyError:
            serializer = ProfileSerializer(blocker_profiles, many=True, context={'request': request})
            return Response(serializer.data)

    @action(detail=True)
    def blocked(self, request, pk=None):
        queryset = Profile.objects.all()
        profile = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, profile)
        blocked_profile_maps = ProfileBlockedMap.objects.raw(
            """select * from (SELECT
               DISTINCT ON (blocked_id, blocker_id) *
            FROM
               backend_profileblockedmap
               where blocked_id = %s 
            ORDER BY
               blocked_id,
               blocker_id,
               change_date_time desc) as query where is_blocked = True""", [pk])

        blocked_profiles = Profile.objects.filter(blocker__in=blocked_profile_maps)

        page = self.paginate_queryset(blocked_profiles)
        try:
            request.query_params['page']
            if page is not None:
                serializer = ProfileSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        except KeyError:
            serializer = ProfileSerializer(blocked_profiles, many=True, context={'request': request})
            return Response(serializer.data)


class PictureViewSet(viewsets.ModelViewSet):
    permission_classes = [PicturePermission]
    queryset = ProfilePicture.objects.all()
    serializer_class = PictureSerializer

    def create(self, request):
        new_picture = {'profile': request.data['profile'], 'change_date_time': datetime.now(), 'is_active': True,
                       'url': 'placeholder'}
        serializer = PictureSerializer(data=new_picture)
        serializer.is_valid(raise_exception=True)
        saved_picture = serializer.save()
        file_path = f'pictures/{serializer.data["id"]}'
        new_picture['id'] = serializer.data["id"]
        try:
            url = upload_file(request.data['file'], file_path)
        except FileNotFoundError as e:
            ProfilePicture.objects.filter(id=new_picture['id']).delete()
            return Response("File not found.", status=status.HTTP_400_BAD_REQUEST)
        except NoCredentialsError as e:
            ProfilePicture.objects.filter(id=new_picture['id']).delete()
            return Response("Incorrect credentials.", status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            ProfilePicture.objects.filter(id=new_picture['id']).delete()
            return Response("Error.", status=status.HTTP_400_BAD_REQUEST)

        new_picture['url'] = url
        serializer = PictureSerializer(saved_picture, data=new_picture)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class TrackViewSet(viewsets.ModelViewSet):
    permission_classes = [TrackPermission]
    queryset = ProfileTrack.objects.all()
    serializer_class = TrackSerializer

    def create(self, request):
        new_track = {'profile': request.data['profile'], 'added_date_time': datetime.now(), 'is_active': True,
                     'url': 'placeholder'}
        serializer = TrackSerializer(data=new_track)
        serializer.is_valid(raise_exception=True)
        saved_track = serializer.save()
        file_path = f'tracks/{serializer.data["id"]}'
        new_track['id'] = serializer.data["id"]
        try:
            url = upload_file(request.data['file'], file_path)
        except FileNotFoundError as e:
            ProfilePicture.objects.filter(id=serializer.data["id"]).delete()
            return Response("File not found.", status=status.HTTP_400_BAD_REQUEST)
        except NoCredentialsError as e:
            ProfilePicture.objects.filter(id=serializer.data["id"]).delete()
            return Response("Incorrect credentials.", status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            ProfilePicture.objects.filter(id=serializer.data["id"]).delete()
            return Response("Error.", status=status.HTTP_400_BAD_REQUEST)
        new_track['url'] = url
        serializer = TrackSerializer(saved_track, data=new_track)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [UserPermission]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request):
        if User.objects.filter(username=request.data['username']).exists():
            return Response(["Username already taken."], status=status.HTTP_400_BAD_REQUEST)
        password = decrypt(request.data['password'])
        try:
            validate_password(password)
        except ValidationError as e:
            return Response(e, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_user = User.objects.create_user(
                username=request.data['username'],
                password=password,
            )
        except IntegrityError:
            return Response(["Username already taken."], status=status.HTTP_400_BAD_REQUEST)
        queryset = User.objects.all()
        user = get_object_or_404(queryset, pk=new_user.id)
        serializer = UserSerializer(user, many=False, context={'request': request})
        return Response(serializer.data)

    @action(detail=True)
    def profile(self, request, pk=None):
        queryset = User.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, user)
        profile = user.profile
        if not profile:
            return Response({})

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=False)
    def username(self, request):
        queryset = User.objects.all()
        username = request.query_params['username']
        user = get_object_or_404(queryset, username=username)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=False)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [ChatPermission]
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def create(self, request):
        new_chat = request.data.copy()
        new_chat['started_date_time'] = datetime.now()
        new_chat['is_active'] = True
        serializer = ChatSerializer(data=new_chat)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True)
    def messages(self, request, pk=None):
        queryset = Chat.objects.all()
        chat = get_object_or_404(queryset, pk=pk)
        self.check_object_permissions(request, chat)
        messages = chat.message_set.all().order_by('sent_date_time')
        page = self.paginate_queryset(messages)

        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [MessagePermission]
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def create(self, request):
        new_message = request.data.copy()
        new_message['sent_date_time'] = datetime.now()
        new_message['is_edited'] = False
        new_message['is_deleted'] = False
        serializer = MessageSerializer(data=new_message)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProfileBlockedMapViewSet(viewsets.ModelViewSet):
    permission_classes = [BlockPermission]
    queryset = ProfileBlockedMap.objects.all()
    serializer_class = ProfileBlockedMapSerializer

    def create(self, request):
        new_block = request.data.copy()
        new_block['change_date_time'] = datetime.now()
        serializer = ProfileBlockedMapSerializer(data=new_block)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
