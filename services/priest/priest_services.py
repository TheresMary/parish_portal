from django.db.models import Q
from django.utils.html import escape
from helpers.signer import URLEncryptionDecryption
from apps.admin.priest.models import Priest

class PriestServices:
    @staticmethod
    def reassign_learning_materials(reassign_to, lm_category) :
        learning_materials = lm_category.learning_material_category.all()
        for learning_material in learning_materials :
            learning_material.material_category.remove(lm_category)
            learning_material.material_category.add(*reassign_to)


    @staticmethod
    def filter_by_search(queryset, search_term):
        if search_term:
            return queryset.filter(
                Q(name__icontains=search_term) | Q(description__icontains=search_term) 
            )
        return queryset

    @staticmethod
    def prepare_json_results(qs):
        return [
            {
               'id'                       : escape(item.id),
                'encrypt_id'              : escape(URLEncryptionDecryption.enc(item.id)),
                'name'                    : escape(item.name),
                'description'             : escape(item.description),
                'status'                  : escape(item.status),
                'created_date'            : escape(item.created_date),
                'has_learning_material'   : len(item.learning_material_category.all())>0
            }
            for item in qs
        ]
    
    @staticmethod
    def category_status_change(self,request,model):
        ids            = request.POST.getlist('ids[]')
        statusvalue    = request.POST.get('statusvalue')
        if statusvalue != "deleteRows":
            status      = 'Active' if request.POST.get('status') =='true' else 'Inactive'
            model.objects.filter(id__in=ids).update(status=status)
        else:
            related_items = Priest.objects.filter(material_category__id__in=ids).exists()
            if related_items:
                return {
                    'success': False,
                    'status_code':200,
                    'message': "Cannot delete categories as they are associated with Learning Materials."
                }
            model.objects.filter(id__in=ids).delete()
            return False