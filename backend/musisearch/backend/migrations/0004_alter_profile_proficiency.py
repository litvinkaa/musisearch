# Generated by Django 4.2.1 on 2023-05-23 08:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_alter_profile_genres_alter_profile_instruments'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='proficiency',
            field=models.CharField(default=str, max_length=6),
        ),
    ]
