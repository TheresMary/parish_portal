from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def dashboard(request):
    return render(request, 'admin/dashboard/dashboard.html')
