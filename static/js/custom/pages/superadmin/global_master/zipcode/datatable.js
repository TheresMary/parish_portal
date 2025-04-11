"use strict";

const ZipCodeDatatablesServerSide = function() {
    // Shared variables
    let dataTable;

    // Private functions
    const initzipcodeDatatable = function() {

        dataTable = $("#zipcode-DataTable").DataTable({
            ajax: {
                method: "POST",
                url: `${zipcode_api_config.datatable}`,
                data: {
                    'csrfmiddlewaretoken': `${zipcode_api_config.csrfmiddlewaretoken}`,
                },
            },
            columns: [
                {data: 'id'},
                {data: 'zip_code'},
                {data: 'city'},
                {data: 'state'},
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
                    sortable: true,
                    orderable: false,
                    render: function (data) {
                        return ` <div class="font-normal text-sm text-zinc-800">${data}</div>`;
                    }
                },
                {
                    searchable: false,
                    orderable: false,
                    targets: 5,
                    render: function(data, type, row) {
                        return `<div class="px-3 py-1 rounded-2xl w-fit text-xs zipcodestatus capitalize ${data == 'Active' ? 'text-activeGreen bg-mintGreen' : 'text-red bg-pink'}">${data}</div>`;
                    }
                },
                {
                    targets: 6,
                    visible: false,
                    searchable: false
                },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    render: function (data, type, row) {
                        let edit_url = zipcode_api_config.edit_url.replace('0', row.encrypt_id.toString());
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
            initzipcodeDatatable();
            handleDatatableStatusFilter(dataTable, 3, 'zipcode');
            handleDatatableSort(dataTable, 6, 1, 'zipcode');
            handleDatatableStatusUpdate('zipcode');
        }
    }
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    ZipCodeDatatablesServerSide.init();
});