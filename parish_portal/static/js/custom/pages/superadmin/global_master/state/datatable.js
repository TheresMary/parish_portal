"use strict";

const StateDatatablesServerSide = function() {
    // Shared variables
    let dataTable;

    // Private functions
    const initstateDatatable = function() {

        dataTable = $("#state-datatable").DataTable({
            ajax: {
                method: "POST",
                url: `${state_api_config.datatable}`,
                data: {
                    'csrfmiddlewaretoken': `${state_api_config.csrfmiddlewaretoken}`,
                },
            },
            columns: [
                {data: 'id'},
                {data: 'state_name'},
                {data: 'state_code'},
                {data: 'country'},
                {data: 'status'},
                {data: 'created_date'},
                {data: 'id'},
            ],
            columnDefs: [
                {
                    targets: 0,
                    orderable: false,
                    render: function (data) {
                        return `<div>
                                <input type="checkbox" class="rowCheckbox" value="${data}">
                                </div>`;
                    }
                },
                {
                    targets: 1,
                    orderable: false,
                    sortable: true,
                    render: function (data) {
                        return ` <div class="font-normal text-sm text-zinc-800">${data}</div>`;
                    }
                },
                {
                    targets: 2,
                    orderable: false,
                    sortable: true,
                    render: function (data) {
                        return ` <div class="font-normal text-sm text-zinc-800">${data}</div>`;
                    }
                },
                {
                    searchable: false,
                    orderable: false,
                    targets: 4,
                    render: function(data, type, row) {
                        switch (data) {
                            case 'Active':
                                return `<div class="px-3 py-1 rounded-2xl w-fit text-xs statestatus capitalize text-activeGreen bg-mintGreen">Active</div>`;
                            case 'Inactive':
                                return `<div class="px-3 py-1 rounded-2xl w-fit text-xs statestatus capitalize text-red bg-pink">Inactive</div>`;
                       }
                    }
                },
                {
                    targets: 5,
                    visible: false,
                    orderable: false
                },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    render: function (data, type, row) {
                        let edit_url = state_api_config.edit_url.replace('0', row.encrypt_id.toString());
                        return `
                            <a href="${edit_url}" class="flex w-min">
                                <svg class=" w-5 h-5 text-zinc-800 hover:text-blue-500 editBtn">
                                    <use href="${api_config.edit_icon}"></use>
                                </svg>
                            </a>
                        `;
                    },
                },
            ],
        });

        // Re-init functions on every table re-draw -- more info: https://datatables.net/reference/event/draw
        dataTable.on('draw', function() {
            KTMenu.createInstances();
        });
    }

    // Public methods
    return {
        init: function() {
            initstateDatatable();
            handleDatatableStatusFilter(dataTable, 3, 'state');
            handleDatatableSort(dataTable, 5, 1, 'state');
            handleDatatableStatusUpdate('state');
        }
    }
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    StateDatatablesServerSide.init();
});