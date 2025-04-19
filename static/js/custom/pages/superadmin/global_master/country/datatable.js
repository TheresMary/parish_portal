"use strict";

const CountryDatatablesServerSide = function () {
  // Shared variables
  let dataTable;

  // Private functions
  const initDatatable = function () {

    dataTable = $("#country-DataTable").DataTable({
      ajax: {
        method: "POST",
        url: `${country_api_config.datatable}`,
        data: {
          'csrfmiddlewaretoken': `${api_config.csrfmiddlewaretoken}`,
        },
      },
      columns: [
        { data: 'id' },
        { data: 'country_name' },
        { data: 'country_code' },
        { data: 'status' },
        { data: 'created_date' },
        { data: 'id' },
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
          targets: 3,
          render: function (data, _type, _row) {
            switch (data) {
              case 'Active':
                return `<div class="px-3 py-1 rounded-2xl w-fit text-xs countrystatus capitalize text-activeGreen bg-mintGreen">Active</div>`;
              case 'Inactive':
                return `<div class="px-3 py-1 rounded-2xl w-fit text-xs countrystatus capitalize text-red bg-pink">Inactive</div>`;
            }
          }
        },
        {
          targets: 4,
          visible: false,
          searchable: false,
        },
        {
          targets: -1,
          data: null,
          orderable: false,
          render: function (_data, _type, row) {
            let edit_url = country_api_config.edit_url.replace('0', row.encrypt_id.toString());
            return `
                    <a href="${edit_url}" class="flex w-min">
                        <svg class="w-5 h-5 text-zinc-800 hover:text-blue-500 editBtn">
                          <use href="${api_config.edit_icon}"></use>
                        </svg>
                    </a>
                  `;
          },
        },
      ],
    });

    // Re-init functions on every table re-draw -- more info: https://datatables.net/reference/event/draw
    dataTable.on('draw', function () {
      KTMenu.createInstances();
    });
  }

  // Public methods
  return {
    init: function () {
      initDatatable();
      handleDatatableStatusFilter(dataTable, 3, 'country');
      handleDatatableSort(dataTable, 4, 1, 'country');
      handleDatatableStatusUpdate('country');
    }
  }
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  CountryDatatablesServerSide.init();
});