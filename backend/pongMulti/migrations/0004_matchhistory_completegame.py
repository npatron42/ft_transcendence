# Generated by Django 4.2.3 on 2024-10-11 15:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pongMulti', '0003_remove_matchhistory_score'),
    ]

    operations = [
        migrations.AddField(
            model_name='matchhistory',
            name='completeGame',
            field=models.BooleanField(default=False),
        ),
    ]
