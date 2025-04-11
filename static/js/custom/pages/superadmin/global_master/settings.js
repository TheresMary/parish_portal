"use strict";

// Class definition
var DatatablesServerSide = function() {
    // Shared variables
    var table;
    var dt;
    var playersdt;


    // Private functions
    var initDatatable = function() {

        dt = $("#country-datatable").DataTable({
            searchDelay: 500,
            serverSide: true,
            responsive: true,
            processing: true,
            order: [
                [0, 'desc']
            ],
            select: {
                style: 'multi',
                selector: 'td:first-child input[type="checkbox"]',
                className: 'row-selected'
            },
            ajax: {
                method: "POST",
                url: `${api_config.datatable}`,
                data: {
                    'csrfmiddlewaretoken': `${api_config.csrfmiddlewaretoken}`,
                },
            },
            columns: [
                {data: 'id'},
                {data: 'country_name'},
                {data: 'country_code'},
                {data: 'status'},
                {data: 'id'},
            ],
            columnDefs: [
                {
                    targets: 0,
                    orderable: false,
                    render: function (data) {
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid ">
                                <input class="form-check-input checkbox-input-id" type="checkbox" value="${data}" />
                            </div>`;
                    }
                },

                {
                    searchable: false,
                    orderable: false,
                    targets: 3,
                    render: function(data, type, row) {
                        let label_badge = '';
                        if(data == 'Active'){
                            label_badge = `<span class="badge badge-light-success">Active</span>`;
                        }else if(data == 'Inactive'){
                            label_badge =  `<span class="badge badge-light-danger">Inactive</span>`;
                        }
                        return label_badge;
                    }
                },

                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    className: 'text-end',
                    render: function (data, type, row) {
                        let edit_url = api_config.edit_url.replace('0', row.encrypt_id.toString());
                        return `
                                <div class="d-flex justify-content-end flex-shrink-0">
                                    <a href="${edit_url}" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
                                        <span class="svg-icon svg-icon-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="currentColor" />
                                                <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="currentColor" />
                                            </svg>
                                        </span>
                                    </a>
                                    <a href="javascript:void(0)" data-id=${row.id} data-country-table-filter="delete_row" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm">
                                        <span class="svg-icon svg-icon-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="currentColor" />
                                                <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="currentColor" />
                                                <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="currentColor" />
                                            </svg>
                                        </span>
                                    </a>
                                </div>
                        `;
                    },
                },
            ],
            // Add data-filter attribute
            drawCallback: function(settings) {},

        });

        table = dt.$;
        // Re-init functions on every table re-draw -- more info: https://datatables.net/reference/event/draw
        dt.on('draw', function() {
            KTMenu.createInstances();
        });
    }

    // Search Datatable --- official docs reference: https://datatables.net/reference/api/search()
    var handleSearchDatatable = function() {
        const filterSearch = document.querySelector('[data-country-table-filter="search"]');
        filterSearch.addEventListener('keyup', function(e) {
            dt.search(e.target.value).draw();
        });

    }

    // Handle status filter dropdown
    var handleStatusFilter = () => {
        const filterStatus = document.querySelector('[data-country-filter="status"]');
        $(filterStatus).on('change', e => {
            let value = e.target.value;
            if(value === 'all'){
                value = '';
            }
            dt.column(3).search(value).draw();
        });
    }
    // user package

    // Delete customer
    var handleDeleteRows = () => {
        // Select all delete buttons
        const deleteButtons = document.querySelectorAll('[data-country-table-filter="delete_row"]');

        deleteButtons.forEach(d => {
            // Delete button on click
            d.addEventListener('click', function(e) {

                const destroyRecordIds = [$(this).data('id')];
                e.preventDefault();
                // Select parent row
                const parent = e.target.closest('tr');
                // Get customer name
                const userName = parent.querySelectorAll('td')[1].innerText;

                //     // SweetAlert2 pop up --- official docs reference: https://sweetalert2.github.io/
                Swal.fire({
                    text: "Are you sure you want to delete " + userName + "?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, delete!",
                    cancelButtonText: "No, cancel",
                    customClass: {
                        confirmButton: "btn fw-bold btn-danger",
                        cancelButton: "btn fw-bold btn-active-light-primary"
                    }
                }).then(function(result) {
                    if (result.value) {
                        $.post(`${api_config.delete_records}`, { ids: destroyRecordIds }, function(data, status, xhr) {

                            if (data.status_code == 200) {
                                Swal.fire({
                                    text: "You have deleted " + userName + "!.",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn fw-bold btn-primary",
                                    }
                                }).then(function() {
                                    // delete row data from server and re-draw datatable
                                    dt.draw();
                                });

                            } else {
                                Swal.fire({
                                    html: `
                                    <div class="p-[22px] bg-white rounded-xl shadow justify-start items-start gap-6 inline-flex">
                                        <div class="justify-start items-center gap-4 flex">
                                            <div class="w-[46px] h-[46px] relative bg-orange-100 rounded-[11px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" class="m-auto h-full">
                                               <path fill-rule="evenodd" clip-rule="evenodd" d="M0 15C0 6.71538 6.71538 0 15 0C23.2846 0 30 6.71538 30 15C30 23.2846 23.2846 30 15 30C6.71538 30 0 23.2846 0 15ZM15 9.23077C15.306 9.23077 15.5995 9.35234 15.8159 9.56872C16.0323 9.78511 16.1538 10.0786 16.1538 10.3846V16.1538C16.1538 16.4599 16.0323 16.7533 15.8159 16.9697C15.5995 17.1861 15.306 17.3077 15 17.3077C14.694 17.3077 14.4005 17.1861 14.1841 16.9697C13.9677 16.7533 13.8462 16.4599 13.8462 16.1538V10.3846C13.8462 10.0786 13.9677 9.78511 14.1841 9.56872C14.4005 9.35234 14.694 9.23077 15 9.23077ZM15 21.9231C15.306 21.9231 15.5995 21.8015 15.8159 21.5851C16.0323 21.3687 16.1538 21.0753 16.1538 20.7692C16.1538 20.4632 16.0323 20.1697 15.8159 19.9533C15.5995 19.737 15.306 19.6154 15 19.6154C14.694 19.6154 14.4005 19.737 14.1841 19.9533C13.9677 20.1697 13.8462 20.4632 13.8462 20.7692C13.8462 21.0753 13.9677 21.3687 14.1841 21.5851C14.4005 21.8015 14.694 21.9231 15 21.9231Z" fill="#EA580C"/>
                                            </svg>
                                            </div>
                                            <div class="flex-col justify-start items-start gap-1 inline-flex">
                                                <div class="text-orange-600 text-base font-bold font-['Plus Jakarta Sans']">Warning</div>
                                                <div class="w-[531px] text-gray-500 text-base font-['Plus Jakarta Sans']">Something went wrong.</div>
                                            </div>
                                        </div>
                                    </div>
                                    `,
                                    toast: true, 
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 5000,
                                    customClass: {
                                      popup: '!p-5 custom-toast min-w-[350px]',
                                    }
                                });
                            }

                        }, 'json').done(function() {
                            console.log('Request done!');
                        }).fail(function(jqxhr, settings, ex) {
                            console.log('failed, ' + ex);
                            Swal.fire({
                                html: `
                                <div class="p-[22px] bg-white rounded-xl shadow justify-start items-start gap-6 inline-flex">
                                    <div class="justify-start items-center gap-4 flex">
                                        <div class="w-[46px] h-[46px] relative bg-orange-100 rounded-[11px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" class="m-auto h-full">
                                           <path fill-rule="evenodd" clip-rule="evenodd" d="M0 15C0 6.71538 6.71538 0 15 0C23.2846 0 30 6.71538 30 15C30 23.2846 23.2846 30 15 30C6.71538 30 0 23.2846 0 15ZM15 9.23077C15.306 9.23077 15.5995 9.35234 15.8159 9.56872C16.0323 9.78511 16.1538 10.0786 16.1538 10.3846V16.1538C16.1538 16.4599 16.0323 16.7533 15.8159 16.9697C15.5995 17.1861 15.306 17.3077 15 17.3077C14.694 17.3077 14.4005 17.1861 14.1841 16.9697C13.9677 16.7533 13.8462 16.4599 13.8462 16.1538V10.3846C13.8462 10.0786 13.9677 9.78511 14.1841 9.56872C14.4005 9.35234 14.694 9.23077 15 9.23077ZM15 21.9231C15.306 21.9231 15.5995 21.8015 15.8159 21.5851C16.0323 21.3687 16.1538 21.0753 16.1538 20.7692C16.1538 20.4632 16.0323 20.1697 15.8159 19.9533C15.5995 19.737 15.306 19.6154 15 19.6154C14.694 19.6154 14.4005 19.737 14.1841 19.9533C13.9677 20.1697 13.8462 20.4632 13.8462 20.7692C13.8462 21.0753 13.9677 21.3687 14.1841 21.5851C14.4005 21.8015 14.694 21.9231 15 21.9231Z" fill="#EA580C"/>
                                        </svg>
                                        </div>
                                        <div class="flex-col justify-start items-start gap-1 inline-flex">
                                            <div class="text-orange-600 text-base font-bold font-['Plus Jakarta Sans']">Warning</div>
                                            <div class="w-[531px] text-gray-500 text-base font-['Plus Jakarta Sans']">Something went wrong.</div>
                                        </div>
                                    </div>
                                </div>
                                `,
                                toast: true, 
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 5000,
                                customClass: {
                                  popup: '!p-5 custom-toast min-w-[350px]',
                                }
                            });
                        });

                    } else if (result.dismiss === 'cancel') {
                        Swal.fire({
                            text: userName + " was not deleted.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary",
                            }
                        });
                    }
                });
            })
        });
    }



    // Init toggle toolbar
    var initToggleToolbar = function() {
        // Toggle selected action toolbar
        // Select all checkboxes
        const container = document.querySelector('#country-datatable');
        const checkboxes = container.querySelectorAll('[type="checkbox"]');

        // Select elements
        const deleteSelected = document.querySelector('[data-country-table-select="delete_selected"]');

        // Toggle delete selected toolbar
        checkboxes.forEach(c => {
            // Checkbox on click event
            c.addEventListener('click', function() {
                setTimeout(function() {
                    toggleToolbars();
                }, 50);
            });
        });

        // Deleted selected rows
        deleteSelected.addEventListener('click', function() {

            const row_ids = []
            $(".checkbox-input-id:checkbox:checked").each(function() {
                row_ids.push($(this).val());
            });

            Swal.fire({
                text: "Are you sure you want to delete selected users?",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                showLoaderOnConfirm: true,
                confirmButtonText: "Yes, delete!",
                cancelButtonText: "No, cancel",
                customClass: {
                    confirmButton: "btn fw-bold btn-danger",
                    cancelButton: "btn fw-bold btn-active-light-primary"
                },
            }).then(function(result) {
                if (result.value) {

                    $.post(`${api_config.delete_records}`, { ids: row_ids }, function(data, status, xhr) {

                        if (data.status = 200) {
                            Swal.fire({
                                text: "You have deleted all selected users!.",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn fw-bold btn-primary",
                                }
                            }).then(function() {
                                // delete row data from server and re-draw datatable
                                dt.draw();
                                const headerCheckbox = container.querySelectorAll('[type="checkbox"]')[0];
                                headerCheckbox.checked = false;
                            });

                        } else {
                            Swal.fire({
                                html: `
                                <div class="p-[22px] bg-white rounded-xl shadow justify-start items-start gap-6 inline-flex">
                                    <div class="justify-start items-center gap-4 flex">
                                        <div class="w-[46px] h-[46px] relative bg-orange-100 rounded-[11px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" class="m-auto h-full">
                                           <path fill-rule="evenodd" clip-rule="evenodd" d="M0 15C0 6.71538 6.71538 0 15 0C23.2846 0 30 6.71538 30 15C30 23.2846 23.2846 30 15 30C6.71538 30 0 23.2846 0 15ZM15 9.23077C15.306 9.23077 15.5995 9.35234 15.8159 9.56872C16.0323 9.78511 16.1538 10.0786 16.1538 10.3846V16.1538C16.1538 16.4599 16.0323 16.7533 15.8159 16.9697C15.5995 17.1861 15.306 17.3077 15 17.3077C14.694 17.3077 14.4005 17.1861 14.1841 16.9697C13.9677 16.7533 13.8462 16.4599 13.8462 16.1538V10.3846C13.8462 10.0786 13.9677 9.78511 14.1841 9.56872C14.4005 9.35234 14.694 9.23077 15 9.23077ZM15 21.9231C15.306 21.9231 15.5995 21.8015 15.8159 21.5851C16.0323 21.3687 16.1538 21.0753 16.1538 20.7692C16.1538 20.4632 16.0323 20.1697 15.8159 19.9533C15.5995 19.737 15.306 19.6154 15 19.6154C14.694 19.6154 14.4005 19.737 14.1841 19.9533C13.9677 20.1697 13.8462 20.4632 13.8462 20.7692C13.8462 21.0753 13.9677 21.3687 14.1841 21.5851C14.4005 21.8015 14.694 21.9231 15 21.9231Z" fill="#EA580C"/>
                                        </svg>
                                        </div>
                                        <div class="flex-col justify-start items-start gap-1 inline-flex">
                                            <div class="text-orange-600 text-base font-bold font-['Plus Jakarta Sans']">Warning</div>
                                            <div class="w-[531px] text-gray-500 text-base font-['Plus Jakarta Sans']">Something went wrong.</div>
                                        </div>
                                    </div>
                                </div>
                                `,
                                toast: true, 
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 5000,
                                customClass: {
                                  popup: '!p-5 custom-toast min-w-[350px]',
                                }
                            });
                        }

                    }, 'json').done(function() {
                        console.log('Request done!');
                    }).fail(function(jqxhr, settings, ex) {
                        console.log('failed, ' + ex);
                        Swal.fire({
                            html: `
                            <div class="p-[22px] bg-white rounded-xl shadow justify-start items-start gap-6 inline-flex">
                                <div class="justify-start items-center gap-4 flex">
                                    <div class="w-[46px] h-[46px] relative bg-orange-100 rounded-[11px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none" class="m-auto h-full">
                                       <path fill-rule="evenodd" clip-rule="evenodd" d="M0 15C0 6.71538 6.71538 0 15 0C23.2846 0 30 6.71538 30 15C30 23.2846 23.2846 30 15 30C6.71538 30 0 23.2846 0 15ZM15 9.23077C15.306 9.23077 15.5995 9.35234 15.8159 9.56872C16.0323 9.78511 16.1538 10.0786 16.1538 10.3846V16.1538C16.1538 16.4599 16.0323 16.7533 15.8159 16.9697C15.5995 17.1861 15.306 17.3077 15 17.3077C14.694 17.3077 14.4005 17.1861 14.1841 16.9697C13.9677 16.7533 13.8462 16.4599 13.8462 16.1538V10.3846C13.8462 10.0786 13.9677 9.78511 14.1841 9.56872C14.4005 9.35234 14.694 9.23077 15 9.23077ZM15 21.9231C15.306 21.9231 15.5995 21.8015 15.8159 21.5851C16.0323 21.3687 16.1538 21.0753 16.1538 20.7692C16.1538 20.4632 16.0323 20.1697 15.8159 19.9533C15.5995 19.737 15.306 19.6154 15 19.6154C14.694 19.6154 14.4005 19.737 14.1841 19.9533C13.9677 20.1697 13.8462 20.4632 13.8462 20.7692C13.8462 21.0753 13.9677 21.3687 14.1841 21.5851C14.4005 21.8015 14.694 21.9231 15 21.9231Z" fill="#EA580C"/>
                                    </svg>
                                    </div>
                                    <div class="flex-col justify-start items-start gap-1 inline-flex">
                                        <div class="text-orange-600 text-base font-bold font-['Plus Jakarta Sans']">Warning</div>
                                        <div class="w-[531px] text-gray-500 text-base font-['Plus Jakarta Sans']">Something went wrong.</div>
                                    </div>
                                </div>
                            </div>
                            `,
                            toast: true, 
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 5000,
                            customClass: {
                              popup: '!p-5 custom-toast min-w-[350px]',
                            }
                        });
                    });

                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "Selected category was not deleted.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary",
                        }
                    });
                }
            });
        });
    }

    // Toggle toolbars
    var toggleToolbars = function() {
        // Define variables
        const container = document.querySelector('#country-datatable');
        const toolbarBase = document.querySelector('[data-table-toolbar="base"]');
        const toolbarSelected = document.querySelector('[data-country-table-toolbar="selected"]');
        const selectedCount = document.querySelector('[data-country-table-select="selected_count"]');

        // Select refreshed checkbox DOM elements
        const allCheckboxes = container.querySelectorAll('tbody [type="checkbox"]');

        // Detect checkboxes state & count
        let checkedState = false;
        let count = 0;

        // Count checked boxes
        allCheckboxes.forEach(c => {
            if (c.checked) {
                checkedState = true;
                count++;
            }
        });

        // Toggle toolbars
        if (checkedState) {
            selectedCount.innerHTML = count;
            toolbarBase.classList.add('d-none');
            toolbarSelected.classList.remove('d-none');
        } else {
            toolbarBase.classList.remove('d-none');
            toolbarSelected.classList.add('d-none');
        }

        const headerCheckbox = container.querySelectorAll('[type="checkbox"]')[0];
        headerCheckbox.addEventListener('click', function() {
            allCheckboxes.forEach(c => {
                c.checked = headerCheckbox.checked;
            });
            checkedState = headerCheckbox.checked;
            count = headerCheckbox.checked ? allCheckboxes.length : 0;
            selectedCount.innerHTML = count;

            if (checkedState) {
                toolbarBase.classList.add('d-none');
                toolbarSelected.classList.remove('d-none');
            } else {
                toolbarBase.classList.remove('d-none');
                toolbarSelected.classList.add('d-none');
            }
        });

        if (checkedState && count !== allCheckboxes.length) {
            headerCheckbox.checked = false;
        } else if (count === 0) {
            headerCheckbox.checked = false;
        } else if (checkedState && count === allCheckboxes.length) {
            headerCheckbox.checked = true;
        }
    }




    // Public methods
    return {
        init: function() {
            initDatatable();

        }
    }
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    DatatablesServerSide.init();
});