# Generated by Django 4.2.3 on 2024-11-25 21:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0042_gamesettings_ballskin_gamesettings_boardskin'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='tournamentsWin',
            field=models.IntegerField(default=0),
        ),
    ]
