# Generated by Django 4.2.3 on 2024-08-29 17:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_remove_user_date_lastvisit_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='friendsList',
        ),
    ]
