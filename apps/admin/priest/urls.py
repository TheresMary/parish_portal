from . import views
from django.urls import path,re_path,include

app_name = 'priest'

urlpatterns =[
    re_path(r'^v1/', include([
        re_path(r'^priest/', include([
            path('', views.PriestView.as_view(), name='priest.index'),
            path('create', views.PriestCreateOrUpdateView.as_view(), name='priest.create'),
            path('<str:id>/update/', views.PriestCreateOrUpdateView.as_view(), name='priest.update'),
            path('load_priest_datatable', views.LoadPriestDatatable.as_view(), name='load.priest.datatable'),
            path('destroy_records/', views.DestroyPriestRecordsView.as_view(), name='priest.records.destroy'),
            path('<str:id>/priest_profile/', views.PriestProfileView.as_view(), name='priest.profile'),
            path('priest_status_change/', views.PriestStatusUpdateView.as_view(), name='priest.status.change'),
        ])),
    ])),
]

