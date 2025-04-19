from django.db import models
from django.utils.translation import gettext_lazy as _


class Priest(models.Model):
    priest_name       = models.CharField(_('Priest Name'), max_length=255,null=True, blank=True,db_index=True)
    contact_number    = models.CharField(_('Contact Number'), max_length=255,null=True, blank=True)
    email             = models.EmailField(_('Email'), max_length=255,null=True, blank=True)

    def __str__(self):
        return self.priest_name

    class Meta:
        verbose_name = 'Priest'
        verbose_name_plural = 'Priest'
        db_table = 'Priest'

