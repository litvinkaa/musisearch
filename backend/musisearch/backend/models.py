from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    birth_date = models.DateField(null=True)
    proficiency = models.CharField(max_length=6, default=str)
    instruments = ArrayField(models.CharField(max_length=30), default=list)
    genres = ArrayField(models.CharField(max_length=20), default=list)


class ProfilePicture(models.Model):
    is_active = models.BooleanField(default=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='pictures')
    change_date_time = models.DateTimeField()
    url = models.CharField(max_length=100)


class ProfileTrack(models.Model):
    is_active = models.BooleanField(default=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='tracks')
    added_date_time = models.DateTimeField()
    url = models.CharField(max_length=100)


class Chat(models.Model):
    is_active = models.BooleanField(default=True)
    starter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='starter')
    recipient = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='recipient')
    started_date_time = models.DateTimeField()


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE)
    text = models.CharField(max_length=4096)
    is_deleted = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    sent_date_time = models.DateTimeField()


class ProfileBlockedMap(models.Model):
    blocker = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='blocker')
    blocked = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='blocked')
    is_blocked = models.BooleanField()
    change_date_time = models.DateTimeField()
