from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def create_priest(request):
    return render(request, 'admin/priest/create_or_update.html')

def list_priest(request):
    return render(request, 'admin/priest/priest.html')
