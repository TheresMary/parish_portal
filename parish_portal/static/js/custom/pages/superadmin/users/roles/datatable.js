"use strict";

const DatatablesServerSide = function () {
    // Shared variables
    let dataTable;

    const initDatatable = function () {

        dataTable = $("#roles-datatable").DataTable({
            ajax: {
                method: "POST",
                url: `${api_config.datatable}`,
                data: function (d) {
                    d.csrfmiddlewaretoken = `${api_config.csrfmiddlewaretoken}`;  // Add CSRF token
                    d.status_filter = document.querySelector('input[name="status"]:checked')?.id || '';  // Pass status filter
                }
            },
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'category' },
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
                    orderable: true,
                    orderSequence: ["asc", "desc"],
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
                    orderable: true,
                    orderSequence: ["asc", "desc"],
                    render: function (data) {
                        return `<div class="font-normal text-sm text-zinc-800">${data}</div>`;
                    }
                },
                {
                    targets: 3,
                    orderable: false,
                    render: function (data) {
                        return `<div class="font-normal text-sm text-zinc-800 whitespace-normal line-clamp-2">${data}</div>`;
                    }
                },
                {
                    searchable: false,
                    orderable: false,
                    targets: 4,
                    render: function (data) {
                        return `<div class="px-3 py-1 rounded-2xl w-fit text-xs status capitalize ${data == 'Active' ? 'text-activeGreen bg-mintGreen' : 'text-red bg-pink'}">${data}</div>`;
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
                        let edit_url = api_config.edit_url.replace('0', row.encrypt_id.toString());

                        return `
                        <div class="flex gap-x-5">
                            <a href="${edit_url}">
                                <svg class=" w-5 h-5 text-zinc-800 hover:text-blue-500 editBtn">
                                <use href="${api_config.edit_icon}"></use>
                                </svg>
                            </a>
                            <a href="javascript:void(0)" data-id=${row.id} data-roles-table-filter="delete_row">
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
        dataTable.on('draw', function () {
            KTMenu.createInstances();
            handleDeleteRows();
        });
    };

    const handleDeleteRows = () => {
        const deleteButtons = document.querySelectorAll('[data-roles-table-filter="delete_row"]');
        deleteButtons.forEach(button => {
            button.onclick = function (e) {
                const destroyRecordIds = $(this).data('id');
                e.preventDefault();
                Modal.showDeleteModal(
                    "Delete Role",
                    "Are you sure you want to delete the Role? This process cannot be undone."
                ).then(function (result) {
                    if (result.isDismissed) return $('.swal2-container').addClass('!hidden');

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
                                dataTable.draw();
                                Toast.showSuccessToast(
                                    'The role was successfully deleted! '
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
                                'An error occurred while deleting the role. Please try again.'
                            )
                        }
                    });

                });
            };
        });
    };

    // Public methods
    return {
        init: function () {
            initDatatable();
            handleDatatableStatusFilter(dataTable, 3)
            handleDatatableSort(dataTable, 4, 1)
            handleDatatableStatusUpdate();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    DatatablesServerSide.init();
});
