"use strict";

// Class definition
var deleteFromViewPages = function() {

    var handleDeleteEntries = () => {
        const deleteButtons = document.querySelectorAll('[data-view-function="delete_entry"]');
        deleteButtons.forEach(d => {
            d.addEventListener('click', function(e) {
                e.preventDefault();
                Modal.showDeleteModal(
                    `Delete ${api_config.item}`,
                    `Are you sure you want to delete ${api_config.item}? This process cannot be undone.`
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
                                        `The ${api_config.item} was successfully deleted!`
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
                                    `An error occurred while deleting the ${api_config.item}. Please try again.`
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

    const toastMessage = localStorage.getItem('toastMessage');
    if (toastMessage) {
      Toast.showSuccessToast(toastMessage);
      localStorage.removeItem('toastMessage');
    }
    

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


