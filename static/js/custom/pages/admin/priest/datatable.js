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
        dt = $("#priest-datatable").DataTable({
            "paging": true,
            "pagingType": "simple",
            "pageLength": 5,
            "lengthMenu": [5, 10, 25, 50],
            "lengthChange": true,
            "dom": '<"top"f>t<"bottom"lp><"clear">',
            "language": {
                "lengthMenu": '<span class="text-zinc-950 text-sm">Rows per page _MENU_</span>',
                "paginate": {
                    "previous": '<span class=" text-zinc-500 text-sm font-medium">Previous</span>',
                    "next": '<span class=" text-zinc-500 text-sm font-medium">Next</span>'
                }
            },
            "initComplete": function() {
                // Add custom searchbar
                const searchInputHTML = `
                    <div class="flex items-center bg-white border border-zinc-200 text-zinc-500 text-sm font-normal py-2 px-3 rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-zinc-600">
                        <img src="${api_config.search_icon}" alt="Search Icon" class="w-4 h-4 my-auto mr-2">
                        <input type="text" placeholder="Type a command or search..." id="customSearch" class="bg-transparent focus:outline-none text-sm text-zinc-500 placeholder-zinc-400 w-full">
                    </div>
                `;
                $('#customSearch-container').html(searchInputHTML);

                $('#customSearch').on('keyup', function() {
                    dt.search(this.value).draw();
                });

                // Searchbar styles
                $('#priest-datatable_wrapper .dt-search').addClass('hidden');
            },
            searchDelay: 500,
            serverSide: true,
            responsive: true,
            processing: true,
            order: [
                [0, 'asc']
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
                    // Add extra parameters to the default DataTables parameters
                    d.csrfmiddlewaretoken = `${api_config.csrfmiddlewaretoken}`;  // Add CSRF token
                    d.status_filter = document.querySelector('input[name="status"]:checked')?.id || '';  // Pass status filter
                    d.sort_field = sortField.value;  // Pass the selected sort field
                }
            },
            columns: [
                { data: 'id' },
                { data: 'priest_name' },
                { data: 'email' },
                { data: 'contact_number' },
                { data: 'status' },
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
                    orderable: true,
                    orderSequence: ["desc","asc"],
                    render: function(data, type, row) {
                        let view_url = api_config.organization_profile.replace('0', row.encrypt_id.toString());
                        return `
                            <a href="${view_url}">
                                <div class="font-normal text-sm text-zinc-800">${data}</div>
                            </a>`;
                    }
                },
        
                {
                    searchable: false,
                    orderable: false,
                    targets: 4,
                    render: function(data, type, row) {
                        let label_badge = '';
                        if (data === 'Active') {
                            label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs capitalize status text-activeGreen bg-mintGreen">Active</div>`;
                        } else if (data === 'Inactive') {
                            label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs capitalize status text-red bg-pink">Inactive</div>`;
                        }
                        return label_badge;
                    }
                },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    className: 'text-end',
                    render: function(data, type, row) {
                        let edit_url = api_config.edit_url.replace('0', row.encrypt_id.toString());
                        return `
                        <div class="flex gap-x-5">
                          <a href="${edit_url}">
                              <svg class=" w-5 h-5 text-zinc-800 hover:text-blue-500 editBtn">
                                <use href="${api_config.edit_icon}"></use>
                              </svg>
                          </a>
                          <a href="javascript:void(0)" data-id=${row.id} data-organization-table-filter="delete_row">
                              <svg class=" w-5 h-5 text-zinc-800 hover:text-red deleteBtn">
                                <use href="${api_config.delete_icon}"></use>
                              </svg>
                          </a>
                        </div>
                        `;
                    }
                }
            ],
            // Add data-filter attribute
            drawCallback: function() {
                // Adding tailwind classes to DataTable
                $('#priest-datatable_length').addClass('flex items-center space-x-2 text-sm bg-white');
                $('#priest-datatable_length select').addClass('px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500');
                $('#priest-datatable_wrapper .bottom').addClass('flex justify-end items-center gap-x-9 py-6');
                $('#priest-datatable_length label').addClass('text-zinc-950 font-normal text-sm');
                $('#priest-datatable_paginate .page-link').addClass('text-zinc-500 text-sm');
                $('#priest-datatable_wrapper .dt-search label').addClass('hidden');
                $('#priest-datatable td').removeClass('p-3 text-end');
                $('#priest-datatable th').removeClass('text-end');
                $('#priest-datatable td').addClass('p-4 border-b');
                $('#priest-datatable_wrapper .dt-search label').addClass('hidden');
            }
        });

        $('#selectAll').on('click', function() {
            var rows = dt.rows({ 'search': 'applied' }).nodes();
            $('input[type="checkbox"]', rows).prop('checked', this.checked);
            updateSelectedCount();
        });

        // Handle individual row checkboxes
        $('#priest-datatable tbody').on('change', 'input[type="checkbox"]', function() {
            if (!this.checked) {
                var el = $('#selectAll').get(0);
                if (el && el.checked && ('indeterminate' in el)) {
                    el.indeterminate = true;
                }
            }
            updateSelectedCount();
        });

        table = dt.$;

        // Re-init functions on every table re-draw -- more info: https://datatables.net/reference/event/draw
        dt.on('draw', function() {
            KTMenu.createInstances();
            handleDeleteRows();

        });
    };


    var updateSelectedCount = function() {
      var selectedCount = $('#priest-datatable tbody input[type="checkbox"]:checked').length;
      $('#selectedCount').text(selectedCount + ' row(s) selected');
    }

    var handleDeleteRows = () => {
        const deleteButtons = document.querySelectorAll('[data-organization-table-filter="delete_row"]');

        deleteButtons.forEach(d => {
            d.addEventListener('click', function(e) {
                const destroyRecordIds = $(this).data('id');
                e.preventDefault();
                Modal.showDeleteModal(
                    "Delete Organization",
                    "Are you sure you want to delete the Organization? This process cannot be undone."
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
                            success: function(data, jqXHR) {
                                if (data.status_code == 200) {
                                  dt.draw();
                                  Toast.showSuccessToast(
                                    'The organization was successfully deleted! '
                                  )
                                }
                                else {
                                    console.log("Suceess elseeeee",data)
                                    Toast.showErrorToast(
                                        `${data.message || "Please try again."}`
                                    );
                                }
                            },
                            error: function() {
                              Toast.showErrorToast(
                                'An error occurred while deleting the organization. Please try again.'
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

    var handleCountryWiseFilter = () => {
        const countrySelector = document.querySelectorAll('[data-organization-filter="country_wise"]');

        const getSelectedCountryIds = () => {
            let selectedCountryIds = Array.from(countrySelector)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);     
            let searchValue = selectedCountryIds.length > 0 ? selectedCountryIds.join(',') : '';
            dt.column(4).search(searchValue, true, false).draw();
        };

        countrySelector.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                getSelectedCountryIds();
            });
        });

        document.querySelector('button[data-organization-filter="clearCountry"]').addEventListener("click", function () {
            countrySelector.forEach((checkbox) => {
                checkbox.checked = false;
            });

            let searchValue = '';
            dt.column(4).search(searchValue).draw();
        });

        const searchInput = document.getElementById('countrySearch');
        const countryCheckboxes = document.querySelectorAll('.country-checkbox');
    
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            countryCheckboxes.forEach(checkbox => {
                const countryLabel = checkbox.nextElementSibling;
                const countryName = countryLabel.textContent.toLowerCase();
                
                if (searchTerm === '' || countryName.includes(searchTerm)) {
                    checkbox.closest('div').style.display = 'flex';
                } else {
                    checkbox.closest('div').style.display = 'none';
                }
            });
        });
    };

    // Public methods
    return {
        init: function () {
            initDatatable();
            handleDatatableStatusFilter(dt, 3)
            handleDatatableSort(dt,5,0)
            handleCountryWiseFilter();
        }
    }
}();



// On document ready
KTUtil.onDOMContentLoaded(function() {
    DatatablesServerSide.init();
});