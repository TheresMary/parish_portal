"use strict";

// Class definition
var deleteFromViewPages = function() {

    var handleDeleteEntries = () => {
        const deleteButtons = document.querySelectorAll('[data-groups-function="delete_entry"]');
        deleteButtons.forEach(d => {
            d.addEventListener('click', function(e) {
                e.preventDefault();
                Modal.showDeleteModal(
                    "Delete Group",
                    "Are you sure you want to delete the Group? This process cannot be undone."
                ).then(function(result) {
                    if (result.value) {
                        $.ajax({
                            url: `${api_config.delete_records}`,
                            type: 'POST',
                            data: { ids: api_config.record_id },
                            headers: {
                                'X-CSRFToken': api_config.csrfmiddlewaretoken
                            },
                            dataType: 'json',
                            success: function(data) {
                                if (data.status_code === 200) {
                                    Toast.showSuccessToast(
                                        'The group was successfully deleted!'
                                    )
                                    setTimeout(() => {
                                        location.href = api_config.redirection_url;
                                    }, 2000);
                                }
                                else {
                                    Toast.showErrorToast(
                                        `${data.message || "Please try again."}`
                                    );
                                }
                            },
                            error: function() {
                                Toast.showErrorToast(
                                    'An error occurred while deleting the group. Please try again.'
                                )
                            }
                        });
                    } else if (result.dismiss === 'cancel') {
                        $('.swal2-container').addClass('!hidden');
                    }
                });
            });
        });
    };

    // Public methods
    return {
        init: function() {
          handleDeleteEntries()
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    deleteFromViewPages.init();
});

document.addEventListener("DOMContentLoaded", function() {
    const editOrganizationLink    = document.getElementById("edit-groups-link");
    let encryptId                 = api_config.encrypt_id;
    let groups_edit_url           = api_config.edit_url
    let organization_id           = api_config.organization_id
    let view_url=""

    if (organization_id){
      view_url = groups_edit_url.replace('0', encryptId) + '?organization_id=' + organization_id;
    }
    else{
       view_url = groups_edit_url.replace('0', encryptId);
    }
    if (editOrganizationLink && view_url) {
        editOrganizationLink.href = view_url;
    }
});



