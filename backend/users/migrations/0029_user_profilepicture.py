# Generated by Django 4.2.3 on 2024-10-23 13:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0028_remove_user_profilepicture'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='profilePicture',
            field=models.CharField(default='default.jpg', max_length=250),
        ),
    ]
