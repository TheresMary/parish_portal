"use strict";

// Class definition
var DatatablesServerSide = function() {
  // Shared variables
  let table;
  let dt;
  let sortField = {
    value: ''
  }


  // Private functions
  var initDatatable = function() {

      dt = $("#competency_mapping-datatable").DataTable({
          "paging": true,
          "pagingType": "simple",
          "pageLength": 5,
          "lengthMenu": [5, 10, 25, 50],
          "lengthChange": true,
          "dom": '<"top"f>t<"bottom"lp><"clear">',
          "language": {
              "lengthMenu": '<span class="text-zinc-950 text-sm">Rows per page _MENU_</span>',
              "paginate": {
                  "previous": '<span class="text-zinc-500 text-sm font-medium">Previous</span>',
                  "next": '<span class="text-zinc-500 text-sm font-medium">Next</span>'
              }
          },
          "initComplete": function() {
              // Add custom searchbar
              const searchInputHTML = `
                  <div class="flex items-center bg-white border border-zinc-200 text-zinc-500 text-sm font-normal py-2 px-3 rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-zinc-600">
                      <img src="${api_config.search_icon}" alt="Search Icon" class="w-4 h-4 my-auto mr-2">
                      <input type="text" placeholder="Type a command or search..." class="custom-search bg-transparent focus:outline-none text-sm text-zinc-500 placeholder-zinc-400 w-full">
                  </div>
              `;
              $('.custom-search-container').html(searchInputHTML);

              $('.custom-search').on('keyup', function() {
                  dt.search(this.value).draw();
              });

              // Hide default search bar
              $('#competency_mapping-datatable_wrapper .dt-search').addClass('hidden');
          },
          searchDelay: 500,
          serverSide: true,
          responsive: true,
          processing: true,
          order: [
              [1, 'asc']
          ],
          select: {
              style: 'multi',
              selector: 'td:first-child input[type="checkbox"]',
              className: 'row-selected'
          },
          ajax: {
              method: "POST",
              url: `${api_config.datatable}`,
              data: function(d) {
                d.csrfmiddlewaretoken = `${api_config.csrfmiddlewaretoken}`;  
                d.status_filter = document.querySelector('input[name="status"]:checked')?.id || ''; 
                d.sort_field = sortField.value || ''; 
            }
          },
          columns: [
              { data: 'id' },
              { data: 'competency' },
              { data: 'gradingscale' },
              { data: 'status' },
              { data: 'created_date' },
              { data: 'id' },
          ],
          columnDefs: [
              {
                  targets: 0,
                  orderable: false,
                  render: function(data) {
                      return `<div><input type="checkbox" class="rowCheckbox" value="${data}"></div>`;
                  }
              },
              {
                targets: 1,
                orderable: false,
                sortable: true,
                render: function(data, type, row) {

                    let view_url = api_config.view_profile.replace('0', row.encrypt_id.toString()) ;
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
                  sortable: true,
                  render: function(data) {
                      return `<div class="font-normal text-sm text-zinc-800">${data}</div>`;
                  }
              },
              {
                  searchable: false,
                  orderable: false,
                  targets: 3,
                  render: function(data) {

                      let label_badge = '';
                      if (data == 'Active') {
                          label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs capitalize status text-activeGreen bg-mintGreen">Active</div>`;
                      } else if (data == 'Inactive') {
                          label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs capitalize status text-red bg-pink">Inactive</div>`;
                      }
                      return label_badge;
                  }
              },
              {
                target:4,
                visible : false,
                search:false
              },
              {
                  targets: -1,
                  data: null,
                  orderable: false,
                  className: 'text-end',
                  render: function(data, type, row) {
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
                          <a href="javascript:void(0)" data-id=${row.id} data-observations-table-filter="delete_row">
                              <svg class=" w-5 h-5 text-zinc-800 hover:text-red deleteBtn">
                                <use href="${api_config.delete_icon}"></use>
                              </svg>
                          </a>
                        </div>
                      `;
                  }
              }
          ],
          drawCallback: function() {
              // Add tailwind classes to DataTable
              $('#competency_mapping-datatable_length').addClass('flex items-center space-x-2 text-sm bg-white');
              $('#competency_mapping-datatable_length select').addClass('px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500');
              $('#competency_mapping-datatable_wrapper .bottom').addClass('flex justify-end items-center gap-x-9 py-6');
              $('#competency_mapping-datatable_length label').addClass('text-zinc-950 font-normal text-sm');
              $('#competency_mapping-datatable_paginate .page-link').addClass('text-zinc-500 text-sm');
              $('#competency_mapping-datatable td').removeClass('p-3 text-end').addClass('p-4 border-b');
              $('#competency_mapping-datatable th').removeClass('text-end');
          }
      });

      // Select all rows
      $('#selectAll').on('click', function() {
          var rows = dt.rows({ 'search': 'applied' }).nodes();
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
          updateSelectedCount();
      });

      // Handle individual row checkboxes
      $('#competency_mapping-datatable tbody').on('change', 'input[type="checkbox"]', function() {
          if (!this.checked) {
              var el = $('#selectAll').get(0);
              if (el && el.checked && ('indeterminate' in el)) {
                  el.indeterminate = true;
              }
          }
          updateSelectedCount();
      });

      table = dt.$;

      // Re-init functions on every table re-draw
      dt.on('draw', function() {
          KTMenu.createInstances();
          handleDeleteRows();
      });
  };

  var updateSelectedCount = function() {
      var selectedCount = $('#competency_mapping-datatable tbody input[type="checkbox"]:checked').length;
      $('#selectedCount').text(selectedCount + ' row(s) selected');
  };

  var handleDeleteRows = () => {
    const deleteButtons = document.querySelectorAll('[data-observations-table-filter="delete_row"]');
    deleteButtons.forEach(d => {
        d.addEventListener('click', function(e) {
            const destroyRecordIds = $(this).data('id');
            e.preventDefault();
            Modal.showDeleteModal(
              "Delete Mapped Competency",
              "Are you sure you want to delete the Mapped Competency? This process cannot be undone."
            ).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: `${api_config.delete_records}`,
                        type: 'POST',
                        data: { ids: destroyRecordIds },
                        headers: {
                            'X-CSRFToken': api_config.csrfmiddlewaretoken
                        },
                        dataType: 'json',
                        success: function(data) {
                          if (data.status_code == 200) {
                            dt.draw();
                            Toast.showSuccessToast(
                              'The Mapped Competency was successfully deleted! '
                            )
                          }
                          else {
                            Toast.showErrorToast( 
                                `${data.message || "Please try again."}`
                            );
                          }
                        },
                        error: function() {
                          Toast.showErrorToast(
                            'An error occurred while deleting the Mapped Competency. Please try again.'
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
    init: function () {
      initDatatable();
      handleDatatableStatusFilter(dt, 3)
      handleDatatableSort(dt,4,1)
      handleDatatableStatusUpdate(dt);
    }
  };
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
  DatatablesServerSide.init();
});


