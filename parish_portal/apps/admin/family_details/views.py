from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def create_family_details(request):
    return render(request, 'admin/family_details/create_or_update.html')

def list_family_details(request):
    return render(request, 'admin/family_details/family_details.html')