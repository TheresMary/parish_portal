from . import views
from django.urls import path

app_name = 'family_unit'

urlpatterns =[
    path('create/', views.create_family_unit, name='family_unit.create'),
    path('list/', views.list_family_unit, name='family_unit.list'),
]