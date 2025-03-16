"use strict";

// Class definition
let ChecklistDatatablesServerSide = function () {
    // Shared variables
    let dt;

    // Private functions
    const initDatatable = function () {

        dt = $("#checklist-datatable").DataTable({
            order: [
                [1, 'asc']
            ],
            ajax: {
                method: "POST",
                url: `${api_config.datatable}`,
                data: {
                    'csrfmiddlewaretoken': `${api_config.csrfmiddlewaretoken}`
                }
            },
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'observation' },
                { data: 'description' },
                { data: 'status' },
                { data: 'created_date' },
                { data: 'id' },

            ],
            columnDefs: [
                {
                    targets: 0,
                    orderable: false,
                    render: function (data) {
                        return `<div><input type="checkbox" class="rowCheckbox" value="${data}"></div>`;
                    }
                },
                {
                    targets: 1,
                    orderable: false,
                    sortable: true,
                    render: function (data, type, row) {

                        let view_url = api_config.view_profile.replace('0', row.encrypt_id.toString());

                        return `
                        <a href="${view_url}">
                            <div class="font-normal text-sm text-zinc-800">${data}</div>
                        </a>
                    `;
                    },
                },
                {
                    targets: 2,
                    orderable: false,
                    render: function (data) {
                        return `<div class="font-normal text-sm text-zinc-800">${data}</div>`;
                    }
                },
                {
                    targets: 3, 
                    render: function (data) {
                        return `<div class="font-normal text-sm text-zinc-800 whitespace-normal line-clamp-2">${data}</div>`;
                    }
                },
                {
                    searchable: false,
                    orderable: false,
                    targets: 4,
                    render: function (data) {
                        let label_badge = '';
                        if (data == 'Active') {
                            label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs status capitalize text-activeGreen bg-mintGreen">Active</div>`;
                        } else if (data == 'Inactive') {
                            label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs status capitalize text-red bg-pink">Inactive</div>`;
                        }
                        return label_badge;
                    }
                },
                {
                    target: 5,
                    visible: false,
                    search: false
                },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    render: function (data, type, row) {
                        let edit_url = "";

                        if (api_config.from_org === true) {
                            edit_url = api_config.edit_url.replace('0', row.encrypt_id.toString()) + '?organization_id=' + api_config.org_id;
                        } else {
                            edit_url = api_config.edit_url.replace('0', row.encrypt_id.toString());
                        }

                        return `
                        <div class="flex gap-x-5">
                          <a href="${edit_url}">
                              <svg class=" w-5 h-5 text-zinc-800 hover:text-blue-500 editBtn">
                                <use href="${api_config.edit_icon}"></use>
                              </svg>
                          </a>
                          <a href="javascript:void(0)" data-id=${row.id} data-observations-table-action="delete_row">
                              <svg class=" w-5 h-5 text-zinc-800 hover:text-red deleteBtn">
                                <use href="${api_config.delete_icon}"></use>
                              </svg>
                          </a>
                        </div>
                      `;
                    }
                }
            ],
        });

        // Re-init functions on every table re-draw
        dt.on('draw', function () {
            KTMenu.createInstances();
            handleDeleteRows();
        });
    };

    const handleDeleteRows = () => {
        const deleteButtons = document.querySelectorAll('[data-observations-table-action="delete_row"]');
        deleteButtons.forEach(button => {
            button.onclick = function (e) {
                const destroyRecordIds = $(this).data('id');
                e.preventDefault();
                Modal.showDeleteModal(
                    "Delete Checklist",
                    "Are you sure you want to delete the Checklist? This process cannot be undone."
                ).then(function (result) {
                    if (result.value) {
                        $.ajax({
                            url: `${api_config.delete_records}`,
                            type: 'POST',
                            data: { ids: destroyRecordIds },
                            headers: {
                                'X-CSRFToken': api_config.csrfmiddlewaretoken
                            },
                            dataType: 'json',
                            success: function (data) {
                                if (data.status_code == 200) {
                                    dt.draw();
                                    Toast.showSuccessToast(
                                        'The Checklist was successfully deleted! '
                                    )
                                }
                                else {
                                    Toast.showErrorToast(
                                        `${data.message || "Please try again."}`
                                    );
                                }
                            },
                            error: function () {
                                Toast.showErrorToast(
                                    'An error occurred while deleting the Checklist. Please try again.'
                                )
                            }
                        });
                    } else if (result.dismiss === 'cancel') {
                        $('.swal2-container').addClass('!hidden');
                    }
                });
            };
        });
    };


    var handleObservationsWiseFilter = () => {
        const countrySelector = document.querySelectorAll('[data-checklist-filter="observation_wise"]');
        const getSelectedObservationsIds = () => {
            let selectedCountryIds = Array.from(countrySelector)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);     
            let searchValue = selectedCountryIds.length > 0 ? selectedCountryIds.join(',') : '';
            dt.column(2).search(searchValue, true, false).draw();
        };

        countrySelector.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                getSelectedObservationsIds();
            });
        });

        document.querySelector('button[data-checklist-filter="clearObservations"]').addEventListener("click", function () {
            countrySelector.forEach((checkbox) => {
                checkbox.checked = false;
            });

            let searchValue = '';
            dt.column(2).search(searchValue).draw();
        });

        const searchInput = document.getElementById('observationSearch');
        const observationCheckboxes = document.querySelectorAll('.observations-checkbox');
    
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            observationCheckboxes.forEach(checkbox => {
                const observationLabel = checkbox.closest('label');
                const observationName = observationLabel.querySelector('span').textContent.toLowerCase();
                
                // Show or hide based on search term
                if (searchTerm === '' || observationName.includes(searchTerm)) {
                    observationLabel.style.display = 'flex';
                } else {
                    observationLabel.style.display = 'none';
                }
            });
        });
    };



    // Public methods
    return {
        init: function () {
            initDatatable();
            handleDatatableStatusFilter(dt, 3)
            handleDatatableSort(dt, 4, 1)
            handleDatatableStatusUpdate();
            handleObservationsWiseFilter()
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    ChecklistDatatablesServerSide.init();
});


