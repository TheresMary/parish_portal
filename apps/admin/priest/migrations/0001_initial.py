# Generated by Django 4.2 on 2025-03-16 14:12

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Priest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('priest_name', models.CharField(max_length=250)),
                ('contact_number', models.CharField(max_length=250)),
                ('email', models.EmailField(max_length=250)),
            ],
        ),
    ]
