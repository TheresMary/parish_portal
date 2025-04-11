"use strict";
// Class definition
let LearningMaterialMappingDatatablesServerSide = function () {
    // Shared variables
    let dt;

    // Private functions
    const initDatatable = function () {

        dt = $("#learning-material-mapping-datatable").DataTable({
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
                { data: 'competency' },
                { data: 'learning_material' },
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
                        return `<div class="font-normal text-sm text-zinc-800 whitespace-normal line-clamp-2">${data}</div>`;
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
                          <a href="javascript:void(0)" data-id=${row.id} data-mapping-table-action="delete_row">
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
        const deleteButtons = document.querySelectorAll('[data-mapping-table-action="delete_row"]');
        deleteButtons.forEach(button => {
            button.onclick = function (e) {
                const destroyRecordIds = $(this).data('id');
                e.preventDefault();
                Modal.showDeleteModal(
                    "Delete Learning Material Mapping",
                    "Are you sure you want to delete the Learning Material Mapping? This process cannot be undone."
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
                                        'The Learning Material Mapping was successfully deleted! '
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
                                    'An error occurred while deleting the Learning Material Mapping. Please try again.'
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

    'data-materials-custom-filter="applyFilter"'

    var handleCustomFilter = () => {
        const dropdownFilterMenu = document.getElementById('dropdownFilterMenu');
        const competencySearch = document.getElementById('CompetencySearch');
        const lmSearch = document.getElementById('lmSearch');
        const clearFilterBtn = document.querySelector('[data-materials-filter="clearFilter"]');
        const applyFilterBtn = document.querySelector('[data-materials-custom-filter="applyFilter"]');
    
        competencySearch.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const competencyCheckboxes = document.querySelectorAll('.competency-checkbox');
            competencyCheckboxes.forEach(checkbox => {
                const competencyName = checkbox.nextElementSibling.textContent.toLowerCase();
                const labelElement = checkbox.closest('label');
                if (competencyName.includes(searchValue)) {
                    labelElement.style.display = 'flex';
                } else {
                    labelElement.style.display = 'none';
                }
            });
        });
    
        lmSearch.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const lmCheckboxes = document.querySelectorAll('.lm-checkbox');
            lmCheckboxes.forEach(checkbox => {
                const lmTitle = checkbox.nextElementSibling.textContent.toLowerCase();
                const labelElement = checkbox.closest('label');
                if (lmTitle.includes(searchValue)) {
                    labelElement.style.display = 'flex';
                } else {
                    labelElement.style.display = 'none';
                }
            });
        });
    
        applyFilterBtn.addEventListener('click', function() {
            const selectedCompetencies = Array.from(
                document.querySelectorAll('.competency-checkbox:checked')
            ).map(checkbox => checkbox.value);
    
            const selectedLearningMaterials = Array.from(
                document.querySelectorAll('.lm-checkbox:checked')
            ).map(checkbox => checkbox.value);
    
            console.log('Selected Competencies:', selectedCompetencies);
            console.log('Selected Learning Materials:', selectedLearningMaterials);
    
            const combinedSearchValue = {'competencies':selectedCompetencies,'learning_materials':selectedLearningMaterials};
            dt.column(1).search(combinedSearchValue, true, false).draw();
        });
    
        clearFilterBtn.addEventListener('click', function() {
            document.querySelectorAll('.competency-checkbox, .lm-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });

            competencySearch.value = '';
            lmSearch.value = '';
            document.querySelectorAll('.competency-checkbox, .lm-checkbox')
                .forEach(checkbox => checkbox.closest('label').style.display = 'flex');
            
            applyFilterBtn.addEventListener('click', function(){
                dt.column(1).search('').draw();
            })

        });
    };

    // Public methods
    return {
        init: function () {
            initDatatable();
            handleDatatableStatusFilter(dt, 3)
            handleDatatableSort(dt, 5, 1)
            handleDatatableStatusUpdate();
            handleCustomFilter()
        }
    };
}();





// On document ready
KTUtil.onDOMContentLoaded(function () {
    LearningMaterialMappingDatatablesServerSide.init();
});


