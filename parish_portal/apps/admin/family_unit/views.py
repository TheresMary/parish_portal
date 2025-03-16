from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def create_family_unit(request):
    return render(request, 'admin/family_unit/create_or_update.html')

def list_family_unit(request):
    return render(request, 'admin/family_unit/family_unit.html')