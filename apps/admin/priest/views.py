from re import sub
from django.http import  JsonResponse
from django.shortcuts import  render
from django.urls import reverse
from django.views import View
from django_datatables_view.base_datatable_view import BaseDatatableView # type: ignore
from .models import Priest
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from helpers.signer import URLEncryptionDecryption
from django.db import transaction,IntegrityError
from helpers.helper import get_object_or_none
from services.common_services import BreadcrumbMixin
from helpers.enums import CREATETITLE
from services.common_services import BasicView,DatatableServices, common_status_change,BreadcrumbMixin, delete_handler
from services.priest.priest_services import PriestServices


class PriestView(View,BreadcrumbMixin):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.context = {"breadcrumbs" : []}
        self.template = 'admin/priest/priest.html'
        self.context['title'] = 'Priest'

    def get(self, request, *args, **kwargs):
        self.generate_breadcrumbs([
            {"name": "Priest","route": '#', 'active': True}
        ])
        return render(request, self.template, context=self.context)


class LoadPriestDatatable(BaseDatatableView):
    model = Priest.objects.all()
    order_columns = ['id','name','email','contact_number','status','created_date']

    def filter_queryset(self, qs):
        search = self.request.POST.get('search[value]', None)
        return PriestServices.filter_by_search(qs, search)

    def get_initial_queryset(self):
        filter_value = self.request.POST.get('columns[3][search][value]', None)
        return DatatableServices.filter_by_status(self.model, filter_value)

    def prepare_results(self, qs):
        return PriestServices.prepare_json_results(qs)
 

@method_decorator(login_required, name='dispatch')
class DestroyPriestRecordsView(BasicView):
    handler_function    = delete_handler
    model               = Priest
    
    
class PriestCreateOrUpdateView(View,BreadcrumbMixin):
    def __init__(self, **kwargs):
        self.response_format                = {"status": 200, "message": "", "error": ""}
        self.context                        = {"breadcrumbs": []}
        self.context['title']               = 'Priest'
        self.action                         = "Create"
        self.template                       = 'admin/priest/create_or_update.html'

    def get(self, request, *args, **kwargs):
        id = URLEncryptionDecryption.dec(kwargs.pop('id', None))
        title = CREATETITLE.ADD.value
        if id:
            title = CREATETITLE.EDIT.value
            self.context['priest'] = get_object_or_none(Priest, id=id)

        self.generate_breadcrumbs([
            {"name": "Priest", "route": reverse('priest:priest.index'), 'active': False},
            {"name":f'{title} Priest', "route": '#', 'active': True}
        ])
        return render(request, self.template, context=self.context)

    def post(self, request, *args, **kwargs):

        try:
            priest_id               = request.POST.get('priest_id', None)
            if priest_id:
                self.action = 'Updated'
                instance = get_object_or_none(Priest, id=priest_id)
            else:
                self.action = 'Created'
                instance = Priest()

            with transaction.atomic():
                instance.priest_name    = request.POST.get('priest_name', None)
                instance.email          = request.POST.get('priest_email',None)
                instance.contact_number = request.POST.get('priest_contact_number',None)
                instance.is_active      = request.POST.get('status',None)
                instance.save()

            self.response_format['status'] = 200
            self.response_format['message'] = f"Data Successfully {self.action}"
            messages.success(request, self.response_format['message'])

        except IntegrityError as e:
            self.response_format['status'] = 500
            self.response_format['message'] = "An error occurred while saving the Observation Category."
            self.response_format['error'] = str(e)
            messages.error(request, self.response_format['message'])
            return JsonResponse(self.response_format, status=500)

        return JsonResponse(self.response_format, status=200)


class PriestProfileView(View,BreadcrumbMixin):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.context = {"breadcrumbs" : []}
        self.template = 'superadmin/observations/observation_category/view.html'
        self.context['title'] = 'Office Location'

    def get(self, request, *args, **kwargs):
        office_id = URLEncryptionDecryption.dec(kwargs.pop('id', None))

        if office_id:
            self.context['encyption']   = {'encrypt_id': URLEncryptionDecryption.enc(office_id)}
            self.context['observationcategory'] = get_object_or_none(Priest,id=office_id)

        self.generate_breadcrumbs([
            {"name": "Observation Category", "route": reverse('observations:observation_category:observation_category.index'), 'active': False},
            {"name": "View Observation Category", "route": '#', 'active': True}
        ])
        return render(request, self.template, context=self.context)


@method_decorator(login_required, name='dispatch')
class PriestStatusUpdateView(BasicView):
    handler_function    = common_status_change
    model               = Priest
