from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from backend.models import Profile, ProfileBlockedMap, Chat, Message


# Define an inline admin descriptor for Profile model
# which acts a bit like a singleton
class ProfilesInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'profiles'


# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfilesInline,)


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


admin.site.register(Chat)
admin.site.register(Message)
admin.site.register(ProfileBlockedMap)
admin.site.register(Profile)