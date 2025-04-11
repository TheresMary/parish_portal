from . import views
from django.urls import path

app_name = 'priest'

urlpatterns =[
    path('create/', views.create_priest, name='priest.create'),
    path('list/', views.list_priest, name='priest.list'),
]