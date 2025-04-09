from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Priest(models.Model):
    priest_name=models.CharField(max_length=250)
    contact_number=models.CharField(max_length=250)
    email=models.EmailField(max_length=250)