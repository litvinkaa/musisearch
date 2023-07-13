from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Profile, ProfileBlockedMap, Chat, Message, ProfilePicture, ProfileTrack
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    instruments = serializers.ListField(child=serializers.CharField(), allow_empty=True, required=False)
    genres = serializers.ListField(child=serializers.CharField(), allow_empty=True, required=False)
    distance = serializers.SerializerMethodField()

    def get_distance(self, obj):
        try:
            return obj.distance
        except AttributeError:
            return None

    class Meta:
        model = Profile
        fields = ['id', 'user', 'latitude', 'longitude', 'proficiency', 'instruments', 'genres', 'birth_date',
                  'username', 'distance']
        extra_kwargs = {
            'latitude': {'required': False, 'allow_null': True},
            'longitude': {'required': False, 'allow_null': True},
            'proficiency': {'required': False, 'allow_blank': True},
            'instruments': {'required': False},
            'genres': {'required': False},
            'birth_date': {'required': False, 'allow_null': True},
            'distance': {'required': False}

        }
        read_only_fields = ['id', 'username', 'distance']


class PictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePicture
        fields = ['id', 'profile', 'url', 'is_active', 'change_date_time']
        extra_kwargs = {
            'url': {'required': False},
            'is_active': {'required': False},
            'change_date_time': {'required': False},
        }
        read_only_fields = ['id']


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileTrack
        fields = ['id', 'profile', 'url', 'is_active', 'added_date_time']
        extra_kwargs = {
            'url': {'required': False},
            'is_active': {'required': False},
            'added_date_time': {'required': False},
        }
        read_only_fields = ['id']


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'is_active', 'starter', 'recipient', 'started_date_time']
        extra_kwargs = {
            'is_active': {'required': False},
            'started_date_time': {'required': False},
        }
        read_only_fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'text', 'is_deleted', 'is_edited', 'sent_date_time']
        extra_kwargs = {
            'is_deleted': {'required': False},
            'is_edited': {'required': False},
            'sent_date_time': {'required': False},
        }
        read_only_fields = ['id']


class ProfileBlockedMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileBlockedMap
        fields = ['id', 'blocker', 'blocked', 'is_blocked', 'change_date_time']
        extra_kwargs = {
            'change_date_time': {'required': False},
        }
        read_only_fields = ['id']
