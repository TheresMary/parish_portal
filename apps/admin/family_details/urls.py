from . import views
from django.urls import path

app_name = 'family_details'

urlpatterns =[
    path('create/', views.create_family_details, name='family_details.create'),
    path('list/', views.list_family_details, name='family_details.list'),
]