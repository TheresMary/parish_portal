"use strict";

// Class definition
var DatatablesServerSide = (function () {
  // Shared variables
  let table;
  let dt;
  let sortField = {
    value: ''
  }

  // Private functions
  var initDatatable = function () {
    dt = $("#learning-material-category-datatable").DataTable({
      paging: true,
      pagingType: "simple",
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      lengthChange: true,
      dom: '<"top"f>t<"bottom"lp><"clear">', 
      language: {
        lengthMenu:
          '<span class="text-zinc-950 text-sm">Rows per page _MENU_</span>',
        paginate: {
          previous:
            '<span class="text-zinc-500 text-sm font-medium">Previous</span>',
          next: '<span class="text-zinc-500 text-sm font-medium">Next</span>',
        },
      },
      initComplete: function () {
        // Add custom searchbar
        const searchInputHTML = `
                  <div class="flex items-center bg-white border border-zinc-200 text-zinc-500 text-sm font-normal py-2 px-3 rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-zinc-600">
                      <img src="${api_config.search_icon}" alt="Search Icon" class="w-4 h-4 my-auto mr-2">
                      <input type="text" placeholder="Type a command or search..." class="custom-search bg-transparent focus:outline-none text-sm text-zinc-500 placeholder-zinc-400 w-full">
                  </div>
              `;
        $(".custom-search-container").html(searchInputHTML);

        $(".custom-search").on("keyup", function () {
          dt.search(this.value).draw();
        });

        // Hide default search bar
        $("#learning-material-category-datatable_wrapper .dt-search").addClass(
          "hidden"
        );
      },
      searchDelay: 500,
      serverSide: true,
      responsive: true,
      processing: true,
      order: [[1, "asc"]],
      select: {
        style: "multi",
        selector: 'td:first-child input[type="checkbox"]',
        className: "row-selected",
      },
      ajax: {
        method: "POST",
        url: `${api_config.datatable}`,
        data: function (d) {
          d.csrfmiddlewaretoken = `${api_config.csrfmiddlewaretoken}`; // Add CSRF token
          d.status_filter =
            document.querySelector('input[name="status"]:checked')?.id || ""; // Pass status filter
          d.sort_field = sortField.value; // Pass the selected sort field
        },
      },
      columns: [
        { data: "id" },
        { data: "name" },
        { data: "description" },
        { data: "status" },
        { data: "created_date" },
        { data: {id : "id",has_learning_material : "has_learning_material" }},
      ],
      columnDefs: [
        {
          targets: 0,
          orderable: false,
          render: function (data) {
            return `<div><input type="checkbox" class="rowCheckbox" value="${data}"></div>`;
          },
        },
        {
          targets: 1,
          orderable: true,
          orderSequence: ["asc", "desc"],
          render: function (data, type, row) {
            let view_url = api_config.view_profile.replace(
              "0",
              row.encrypt_id.toString()
            );

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
            return `<div class="font-normal text-sm whitespace-normal line-clamp-2 text-zinc-800">${data}</div>`;
          },
        },
        {
          searchable: false,
          orderable: false,
          targets: 3,
          render: function (data) {
            let label_badge = "";
            if (data == "Active") {
              label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs capitalize status text-activeGreen bg-mintGreen">Active</div>`;
            } else if (data == "Inactive") {
              label_badge = `<div class="px-3 py-1 rounded-2xl w-fit text-xs capitalize status text-red bg-pink">Inactive</div>`;
            }
            return label_badge;
          },
        },
        {
          target: 4,
          visible: false,
          search: false,
        },
        {
          targets: -1,
          data: null,
          orderable: false,
          className: "text-end",
          render: function (data, type, row) {
            let edit_url = "";

            if (api_config.from_org === true) {
              edit_url =
                api_config.edit_url.replace("0", row.encrypt_id.toString()) +
                "?organization_id=" +
                api_config.org_id;
            } else {
              edit_url = api_config.edit_url.replace(
                "0",
                row.encrypt_id.toString()
              );
            }

            return `
              <div class="flex gap-x-5">
                <a href="${edit_url}">
                    <svg class=" w-5 h-5 text-zinc-800 hover:text-blue-500 editBtn">
                      <use href="${api_config.edit_icon}"></use>
                    </svg>
                </a>
                <a href="javascript:void(0)" data-id=${row.id} data-learning-material=${row.has_learning_material} data-learning-material-category-table-filter="delete_row">
                    <svg class=" w-5 h-5 text-zinc-800 hover:text-red deleteBtn">
                      <use href="${api_config.delete_icon}"></use>
                    </svg>
                </a>
              </div>
            `;
          },
        },
      ],
      drawCallback: function () {
        // Add tailwind classes to DataTable
        $("#learning-material-category-datatable_length").addClass(
          "flex items-center space-x-2 text-sm bg-white"
        );
        $("#learning-material-category-datatable_length select").addClass(
          "px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        );
        $("#learning-material-category-datatable_wrapper .bottom").addClass(
          "flex justify-end items-center gap-x-9 py-6"
        );
        $("#learning-material-category-datatable_length label").addClass(
          "text-zinc-950 font-normal text-sm"
        );
        $("#learning-material-category-datatable_paginate .page-link").addClass(
          "text-zinc-500 text-sm"
        );
        $("#learning-material-category-datatable td")
          .removeClass("p-3 text-end")
          .addClass("p-4 border-b");
        $("#learning-material-category-datatable th").removeClass("text-end");
      },
    });

    // Select all rows
    $("#selectAll").on("click", function () {
      var rows = dt.rows({ search: "applied" }).nodes();
      $('input[type="checkbox"]', rows).prop("checked", this.checked);
      updateSelectedCount();
    });

    // Handle individual row checkboxes
    $("#learning-material-category-datatable tbody").on(
      "change",
      'input[type="checkbox"]',
      function () {
        if (!this.checked) {
          var el = $("#selectAll").get(0);
          if (el && el.checked && "indeterminate" in el) {
            el.indeterminate = true;
          }
        }
        updateSelectedCount();
      }
    );

    table = dt.$;

    // Re-init functions on every table re-draw
    dt.on("draw", function () {
      KTMenu.createInstances();
      handleDeleteRows();
    });
  };

  var updateSelectedCount = function () {
    var selectedCount = $(
      '#learning-material-category-datatable tbody input[type="checkbox"]:checked'
    ).length;
    $("#selectedCount").text(selectedCount + ' row(s) selected');
  };

  var handleDeleteRows = () => {
    const deleteButtons = document.querySelectorAll(
      '[data-learning-material-category-table-filter="delete_row"]'
    );
    deleteButtons.forEach((d) => {
      d.addEventListener("click", function (e) {
        const destroyRecordIds = $(this).data("id");
        const hasLearningMaterial = $(this).data("learning-material");
        e.preventDefault();
        if(hasLearningMaterial) {
          var checkedCategoryIds
          Swal.fire({
            html: `
                  <div class="flex flex-col gap-y-3">
                      <div class="w-[50px] h-[50px] bg-[#feebeb] rounded-[37px] m-auto flex items-center justify-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
                          <path d="M22.6875 14.4876L14.6625 1.5751C14.025 0.712597 13.05 0.225098 12 0.225098C10.9125 0.225098 9.93753 0.712597 9.33753 1.5751L1.31253 14.4876C0.562527 15.5001 0.450027 16.8126 1.01253 17.9376C1.57503 19.0626 2.70003 19.7751 3.97503 19.7751H20.025C21.3 19.7751 22.425 19.0626 22.9875 17.9376C23.55 16.8501 23.4375 15.5001 22.6875 14.4876ZM21.4875 17.1876C21.1875 17.7501 20.6625 18.0876 20.025 18.0876H3.97503C3.33753 18.0876 2.81253 17.7501 2.51253 17.1876C2.25003 16.6251 2.28753 15.9876 2.66253 15.5001L10.6875 2.5876C10.9875 2.1751 11.475 1.9126 12 1.9126C12.525 1.9126 13.0125 2.1376 13.3125 2.5876L21.3375 15.5001C21.7125 15.9876 21.75 16.6251 21.4875 17.1876Z" fill="#E10E0E"/>
                          <path d="M12.0002 7.2002C11.5502 7.2002 11.1377 7.5752 11.1377 8.0627V12.1502C11.1377 12.6002 11.5127 13.0127 12.0002 13.0127C12.4877 13.0127 12.8627 12.6377 12.8627 12.1502V8.0252C12.8627 7.5752 12.4502 7.2002 12.0002 7.2002Z" fill="#E10E0E"/>
                          <path d="M12.0002 14C11.5502 14 11.1377 14.375 11.1377 14.8625V15.05C11.1377 15.5 11.5127 15.9125 12.0002 15.9125C12.4877 15.9125 12.8627 15.5375 12.8627 15.05V14.825C12.8627 14.375 12.4502 14 12.0002 14Z" fill="#E10E0E"/>
                          </svg>
                      </div>

                      <p class="text-center text-zinc-950 text-xl font-semibold">Delete Learning Material Category</p>
                      <p class="text-center text-slate-500 text-sm font-normal leading-normal">All Learning Materials in this category must be reassigned before deletion, or they will be permanently deleted.</p>
                      <div class="mt-6 relative flex flex-col"> 
                          <label class="text-gray-800 text-sm font-medium">Category Name</label>
                          <button id="toggleDeleteButton" class="h-[46px] relative pl-5 pr-4 py-3 bg-white rounded-md border border-slate-200 justify-start items-center gap-2.5 inline-flex">
                              <p id="selectedCategories" class="max-w-[300px] text-left line-clamp-1 text-zinc-500">-Select-</p>
                              <div id="checkedCountContainer" class="hidden absolute right-10 h-[21px] px-2.5 py-[3px] bg-blue-100 rounded-[30px] justify-center items-center gap-3 text-blue-500 text-xs font-medium">
                                <span id="checkedCountDisplay">0 </span>
                                <svg id="clearSelection" class="w-2 h-2 text-blue-500" alt="close Icon">
                                  <use href="${api_config.cross_icon}#Vector"></use>
                                </svg>
                              </div>
                              <img id="dropdownIcon" src="${api_config.dropdown_icon}" alt="Dropdown Icon" class="w-5 h-5 absolute right-0 mr-4"/>
                          </button>
                          <div id="deleteDropdown" class="absolute hidden top-20 flex-col bg-white w-[430px] max-h-[350px] h-fit rounded-md border border-slate-200 ">
                            <ul id="categoryList" class="space-y-2 max-h-[250px] overflow-y-auto">
                              <li id="selectAllCategory" class="py-4 pl-10 hover:bg-blue-50"><label class="flex items-center"><input class="mr-5 w-4 h-4 rounded border before:!border-gray-400 text-zinc-950 text-sm" type="checkbox">Select All</label</li></ul>
                            <button id="submitButton" disabled class="h-10 w-fit my-[30px] ml-[40px] px-4 py-2 bg-blue-500 disabled:opacity-40 disabled:hover:cursor-not-allowed rounded-md justify-center items-center gap-2 inline-flex text-white text-sm font-medium">Done</button>
                          </div>
                      </div>
                  </div>
                  `,
            showCancelButton: true,
            buttonsStyling: false,
            width: '530px',
            customClass: {
              container: 'delete-popup-container',
              popup: '!max-w-[530px]',
            },
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            didOpen: () => {
              // Get the button and the category list div
              const toggleDeleteButton = document.getElementById("toggleDeleteButton");
              const deleteDropdown = document.getElementById("deleteDropdown");
              const dropdownIcon = document.getElementById("dropdownIcon");
              const submitButton = document.getElementById("submitButton");
          
              const checkedCountContainer = document.getElementById("checkedCountContainer");
              const checkedCountDisplay = document.getElementById("checkedCountDisplay");
              const selectAllCheckbox = document.getElementById("selectAllCategory"); // Correct the select all checkbox reference
              const clearSelection = document.getElementById("clearSelection");
              const selectedCategories = document.getElementById("selectedCategories");  // <p> tag for selected items
          
              const categoryList = document.getElementById("categoryList");

              // Add click event listener to toggle the visibility
              toggleDeleteButton.addEventListener("click", () => {
                  deleteDropdown.classList.toggle("hidden");
                  dropdownIcon.classList.toggle("rotate-180");
              });
          
              api_config.all_categories.forEach((category, index) => {
                  if (destroyRecordIds == category.id) {
                    return; 
                  }
                  const li = document.createElement("li");
                  li.classList.add("py-4", "pl-10", "hover:bg-blue-50");
          
                  const label = document.createElement("label");
                  const input = document.createElement("input");
                  input.type = "checkbox";
                  label.classList.add("flex", "items-center")
                  input.classList.add("category-checkbox", "mr-5", "w-4", "h-4", "rounded", "border", "border-gray-400", "text-zinc-950", "text-sm");
                  input.value = category.id;
          
                  label.appendChild(input);
                  label.appendChild(document.createTextNode(category.name));
                  li.appendChild(label);
                  categoryList.appendChild(li);
              });
          
              const checkboxes = document.querySelectorAll(".category-checkbox");
          
              // Function to count the number of checked checkboxes
              function updateCheckedCount() {
                  const checkedCheckboxes = [...checkboxes].filter(checkbox => checkbox.checked);
                  checkedCategoryIds = [...checkboxes].filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
                  const checkedCount = checkedCheckboxes.length;
          
                  if (checkedCount >= 2) {
                      checkedCountContainer.classList.remove("hidden");
                      checkedCountContainer.classList.add("inline-flex");
                  } else {
                    checkedCountContainer.classList.remove("inline-flex");
                    checkedCountContainer.classList.add("hidden");
                  }
          
                  if (checkedCount > 0) {
                      const selectedItems = checkedCheckboxes.map(checkbox => checkbox.parentElement.textContent.trim()).join(", ");
                      selectedCategories.textContent = checkedCount === checkboxes.length ? "All Selected" : selectedItems;
                      submitButton.disabled = false;
                  } else {
                      submitButton.disabled = true;
                      selectedCategories.textContent = "-Select-";
                  }
          
                  checkedCountDisplay.textContent = checkedCount;
                  selectAllCheckbox.checked = checkedCount === checkboxes.length;
              }

              submitButton.addEventListener("click", (e) => {
                deleteDropdown.classList.add("hidden");
                dropdownIcon.classList.toggle("rotate-180");;
              })
          
              // Handle 'Select All' checkbox
              selectAllCheckbox.addEventListener("change", (e) => {
                  const isChecked = e.target.checked; // Check if the "Select All" checkbox is checked
                  checkboxes.forEach(checkbox => {
                      checkbox.checked = isChecked; // Set all checkboxes to the same checked state
                  });
                  updateCheckedCount(); // Update the UI after changing all checkboxes
              });
          
              // Add event listeners to each checkbox to update the count on change
              checkboxes.forEach(checkbox => {
                checkbox.addEventListener("change", () => {
                    updateCheckedCount();
            
                    // Check if all checkboxes are checked
                    const allChecked = [...checkboxes].every(chk => chk.checked);
            
                    // Update the "Select All" checkbox based on the state of all checkboxes
                    selectAllCheckbox.checked = allChecked;
                });
            });
          
              // Handle "clearSelection" click
              clearSelection.addEventListener("click", () => {
                // Uncheck all checkboxes
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
        
                // Reset the selected categories text and hide checked count display
                selectedCategories.textContent = "-Select-";
                selectedCategories.classList.add("text-zinc-500");
                checkedCountDisplay.textContent = "0";
                checkedCountContainer.classList.add("hidden");
        
                // Re-enable the submit button if no checkboxes are selected
                submitButton.disabled = true;
                selectAllCheckbox.checked = false; 
              });
            }
        
          }).then(function (result) {
            if (result.value) {
              $.ajax({
                url: `${api_config.delete_records}`,
                type: "POST",
                data: { ids: destroyRecordIds, reassign_to: checkedCategoryIds },
                headers: {
                  "X-CSRFToken": api_config.csrfmiddlewaretoken,
                },
                dataType: "json",
                success: function(data) {
                  if (data.status_code == 200) {
                    dt.draw();
                    Toast.showSuccessToast(
                      'The learning material category was successfully deleted! '
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
                    'An error occurred while deleting the learning material category. Please try again.'
                  )
                }
              });
            } else if (result.dismiss === "cancel") {
              $(".swal2-container").addClass("!hidden");
            }
          });          
        } else {
          Modal.showDeleteModal(
            "Delete Learning Material Category",
            "Are you sure you want to delete the Learning Material Category? This process cannot be undone."
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
                          'The learning material category was successfully deleted! '
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
                        'An error occurred while deleting the learning material category. Please try again.'
                      )
                    }
                });
            } else if (result.dismiss === 'cancel') {
                  $('.swal2-container').addClass('!hidden');
            }
          });
        } 
      });
    });
  };

  // Public methods
  return {
    init: function () {
      initDatatable();
      handleDatatableStatusFilter(dt, 3)
      handleDatatableSort(dt,3,1)
      handleDatatableStatusUpdate();
    },
  };
})();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  DatatablesServerSide.init();
});
