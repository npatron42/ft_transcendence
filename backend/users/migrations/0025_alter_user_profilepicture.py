# Generated by Django 4.2.3 on 2024-10-19 17:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0024_user_langue'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profilePicture',
            field=models.CharField(default='default.jpg', max_length=250),
        ),
    ]