# Generated by Django 4.2.3 on 2024-10-23 09:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_alter_user_profilepicture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profilePicture',
            field=models.CharField(default='default.jpg', max_length=250),
        ),
    ]
