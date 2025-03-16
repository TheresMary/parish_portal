"use strict";

// Class definition
let ObservationTemplatesDatatablesServerSide = function () {
    // Shared variables
    let dt;

    // Private functions
    const initDatatable = function () {

        dt = $("#observation_templates-datatable").DataTable({
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
                { data: 'role' },
                { data: 'category' },
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
                        return `<div class="font-normal text-sm text-zinc-800 whitespace-normal line-clamp-2">${data}</div>`;
                    }
                },
                {
                    targets: 3, 
                    render: function (data) {
                        if (typeof data === 'string' && data.split(',').length > 2) {
                            const categories = data.split(',');
                            const displayCategories = categories.slice(0, 2).join(', ');
                            return `${displayCategories}... `;
                        }
                        return data;
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
                          <a href="javascript:void(0)" data-id=${row.id} data-observations-table-action="copy_row">
                              <svg class=" w-5 h-5 text-zinc-800 hover:text-blue-500 copyBtn">
                                <use href="${api_config.copy_icon}"></use>
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
            handleCopyRows();
        });
    };

    const handleDeleteRows = () => {
        const deleteButtons = document.querySelectorAll('[data-observations-table-action="delete_row"]');
        deleteButtons.forEach(button => {
            button.onclick = function (e) {
                const destroyRecordIds = $(this).data('id');
                e.preventDefault();
                Modal.showDeleteModal(
                    "Delete Observation Template",
                    "Are you sure you want to delete the Observation Template? This process cannot be undone."
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
                                        'The Observations Template was successfully deleted! '
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
                                    'An error occurred while deleting the Observation Template. Please try again.'
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

    const handleCopyRows = () => {
        const copyButtons = document.querySelectorAll('[data-observations-table-action="copy_row"]');
        copyButtons.forEach(button => {
            button.onclick = function (e) {
                const templateId = $(this).data('id');
                e.preventDefault();
                Swal.fire({
                    html: `
                    <div class="flex flex-col gap-y-3">
                        <div class="flex-col justify-start items-center gap-4 flex">
                            <div class="text-black text-2xl font-semibold font-['Plus Jakarta Sans']">Copy Sequence</div>
                            <div class="w-[90px] h-[3px] bg-blue-500 rounded-sm"></div>
                        </div>
                        <form id="copy-observation-template" class="space-y-6">
                            <div>
                                <label for="template-name" class="block text-gray-800 font-normal text-sm mb-1">Sequence Name
                                    <span class="required-asterisk">*</span></label>
                                <input type="text" id="template-name" name="copy_template_name"
                                    class="w-full border-gray-300 border rounded px-3 py-2" placeholder="Enter Sequence Name" required/>
                            </div>
                        </form>
                    </div>`,
                    showCancelButton: true,
                    buttonsStyling: false,
                    focusConfirm: false,
                    confirmButtonText: "Done",
                    cancelButtonText: "Cancel",
                    customClass: {
                        container: 'custom-popup-container fixed top-0 left-0 w-full h-full bg-black-dark/50 flex justify-center items-center z-50',
                        popup: 'min-w-[580px] bg-white rounded-lg p-12 shadow-lg',
                        actions: 'mt-6 flex-row-reverse justify-center gap-x-[18px]',
                        confirmButton: 'w-[150px] flex justify-center items-center py-2 px-7 rounded-md text-white bg-blue-500 hover:bg-blue-600',
                        cancelButton: 'w-[150px] flex justify-center items-center py-2 px-7 rounded-md border border-slate-200',
                    },
                    didOpen: () => {
                        const copyTemplateName = document.querySelector('[name="copy_template_name"]');
                        copyTemplateName.addEventListener('input', () => {
                            if (copyTemplateName.value.trim()) {
                                Swal.resetValidationMessage();
                            }
                        });
                    },
                    preConfirm: () => {
                        const copyTemplateName = document.querySelector('[name="copy_template_name"]');
                        if (!copyTemplateName.value.trim()) {
                            Swal.showValidationMessage('<p class="text-red text-xs">This field is required</p>');
                            return false;
                        }
                        return new FormData($('#copy-observation-template')[0]);
                    }
                }).then(function (result) {
                    if(result.isDismissed) return $('.swal2-container').addClass('!hidden');
                    if (result.value) {
                        var tempName =document.querySelector('[name="copy_template_name"]').value
                        
                        $.ajax({
                            url: `${api_config.copy_records}`,
                            type: 'POST',
                            data: { template_id: templateId ,temp_name:tempName},
                            headers: {
                                'X-CSRFToken': api_config.csrfmiddlewaretoken
                            },
                            dataType: 'json',
                            success: function (data) {
                                if (data.status_code == 200) {
                                    Toast.showSuccessToast(
                                        'Template Copied Successfully! '
                                    )
                                    dt.draw();
                                }
                                else {
                                    Toast.showErrorToast(
                                        `${data.message || "Please try again."}`
                                    );
                                }
                            },
                            error: function () {
                                Toast.showErrorToast(
                                    'An error occurred while Template copying. Please try again.'
                                )
                            }
                        });
                    }
                });
            };
        });
    };

    // Public methods
    return {
        init: function () {
            initDatatable();
            handleDatatableStatusFilter(dt, 3)
            handleDatatableSort(dt, 4, 1)
            handleDatatableStatusUpdate();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    ObservationTemplatesDatatablesServerSide.init();
});


