from django.db.models import Q
from django.utils.html import escape
from helpers.signer import URLEncryptionDecryption
from apps.admin.priest.models import Priest

class PriestServices:

    @staticmethod
    def filter_by_search(queryset, search_term):
        if search_term:
            return queryset.filter(
                Q(priest_name__icontains=search_term)
            )
        return queryset

    @staticmethod
    def prepare_json_results(qs):
        return [
            {
               'id'                 : escape(item.id),
                'encrypt_id'        : escape(URLEncryptionDecryption.enc(item.id)),
                'priest_name'       : escape(item.priest_name),
                'email'             : escape(item.email),
                'contact_number'    : escape(item.contact_number),
                'status'            : escape(item.status),
            }
            for item in qs
        ]
    
