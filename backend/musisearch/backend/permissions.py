from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_authenticated and request.user.is_staff
        elif view.action == 'create':
            return True
        elif view.action == 'username':
            return request.user.is_authenticated
        elif view.action == 'get':
            return request.user.is_authenticated
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy', 'profile']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        # Deny actions on objects if the user is not authenticated
        if not request.user.is_authenticated:
            return False

        if view.action == 'retrieve':
            return obj == request.user or request.user.is_staff
        elif view.action in ['update', 'partial_update']:
            return obj == request.user or request.user.is_staff
        elif view.action == 'destroy':
            return request.user.is_staff
        elif view.action == 'profile':
            return request.user.is_authenticated
        else:
            return False


class ProfilePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_authenticated and request.user.is_staff
        elif view.action == 'create':
            return int(request.data['user']) == request.user.id
        elif view.action == 'search':
            return request.user.is_authenticated or request.user.is_staff
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy', 'blocker', 'blocked', 'chats', 'tracks', 'picture']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        # Deny actions on objects if the user is not authenticated
        if not request.user.is_authenticated:
            return False

        if view.action == 'retrieve':
            return request.user.is_authenticated
        elif view.action in ['update', 'partial_update']:
            return obj == request.user.profile or request.user.is_staff
        elif view.action == 'destroy':
            return request.user.is_staff
        elif view.action == 'blocker':
            return obj == request.user.profile or request.user.is_staff
        elif view.action == 'blocked':
            return obj == request.user.profile or request.user.is_staff
        elif view.action == 'chats':
            return obj == request.user.profile or request.user.is_staff
        elif view.action == 'tracks':
            return request.user.is_authenticated
        elif view.action == 'picture':
            return request.user.is_authenticated

        else:
            return False


class PicturePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_authenticated and request.user.is_staff
        elif view.action == 'create':
            return int(request.data['profile']) == request.user.profile.id
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        # Deny actions on objects if the user is not authenticated
        if not request.user.is_authenticated:
            return False
        if view.action == 'retrieve':
            return request.user.is_authenticated
        elif view.action in ['update', 'partial_update']:
            return obj.profile.id == request.user.profile.id or request.user.is_staff
        elif view.action == 'destroy':
            return request.user.is_staff
        else:
            return False


class TrackPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_authenticated and request.user.is_staff
        elif view.action == 'create':
            return int(request.data['profile']) == request.user.profile.id
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        # Deny actions on objects if the user is not authenticated
        if not request.user.is_authenticated:
            return False
        if view.action == 'retrieve':
            return request.user.is_authenticated
        elif view.action in ['update', 'partial_update']:
            return obj.profile.id == request.user.profile.id or request.user.is_staff
        elif view.action == 'destroy':
            return request.user.is_staff
        else:
            return False




class ChatPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_staff
        elif view.action == 'create':
            return int(request.data['starter']) == request.user.profile.id
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy', 'messages']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if view.action == 'retrieve':
            return obj.starter.id == request.user.profile.id or obj.recipient.id == request.user.profile.id or request.user.is_staff
        elif view.action in ['update', 'partial_update']:
            return obj.starter.id == request.user.profile.id or obj.recipient.id == request.user.profile.id
        elif view.action == 'destroy':
            return request.user.is_staff
        elif view.action == 'messages':
            return obj.starter.id == request.user.profile.id or obj.recipient.id == request.user.profile.id
        else:
            return False


class MessagePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_staff
        elif view.action == 'create':
            return int(request.data['sender']) == request.user.profile.id
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if view.action == 'retrieve':
            return obj.sender.id == request.user.profile.id or request.user.is_staff
        elif view.action in ['update', 'partial_update']:
            return obj.sender.id == request.user.profile.id
        elif view.action == 'destroy':
            return request.user.is_staff
        elif view.action == 'messages':
            return obj.starter.id == request.user.profile.id or obj.recipient.id == request.user.profile.id
        else:
            return False


class BlockPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.is_staff
        elif view.action == 'create':
            return int(request.data['blocker']) == request.user.profile.id
        elif view.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if view.action == 'retrieve':
            return obj.blocker.id == request.user.profile.id or obj.blocked.id == request.user.profile.id or request.user.is_staff
        elif view.action in ['update', 'partial_update']:
            return obj.blocker.id == request.user.profile.id
        elif view.action == 'destroy':
            return request.user.is_staff
        else:
            return False
