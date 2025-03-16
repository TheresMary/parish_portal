from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def create_parish(request):
    return render(request, 'admin/parish/create_or_update.html')

def list_parish(request):
    return render(request, 'admin/parish/parish.html')