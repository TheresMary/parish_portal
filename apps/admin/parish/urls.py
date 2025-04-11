from . import views
from django.urls import path

app_name = 'parish'

urlpatterns =[
    path('create/', views.create_parish, name='parish.create'),
    path('list/', views.list_parish, name='parish.list'),
]