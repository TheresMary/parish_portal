"use strict";
let clickedButton = null;

const openSelectionModal = async (modalId, event,dynamic_id=null) => {

    clickedButton = event.currentTarget
    const modal = document.getElementById(modalId);
    modal.showModal();
    if (dynamic_id){
        var categorySection   = document.querySelector(`[data-id="category-${dynamic_id}"]`);
        var categoryId        = categorySection.value;
        var categoryName      = categorySection.getAttribute('data-value');
        await fetchObservation(categoryId,modalId,categoryName,dynamic_id);
        highlightSelectedOptions(modal);
    }
}

const addButton = document.getElementById('add-observation');
const templateDetailsContainer = document.querySelector('.template-row');
    
const createNewRow = (template_details=null) => {
    const templateRows            = document.querySelectorAll('.template-row.w-full');
    const templateDetailsCount    = templateRows[0].querySelectorAll('.template_details');
    let dynamic_id                = templateDetailsCount.length > 0 ? parseInt(templateDetailsCount[templateDetailsCount.length - 1].id, 10) + 1 : 1;

    const newRow = document.createElement('div');
    newRow.className = 'w-full flex template_details';
    newRow.id = dynamic_id;
    newRow.innerHTML = `
        <div class="flex-[0_0_32.3%] flex-grow px-4 py-3">
            <input type="hidden" name="template_details_id" value = "${template_details.template_id}" />
            <input name="category" data-id="category-${dynamic_id}" type="hidden" value="${template_details.category_id || ''}" data-value = "${template_details.category_name}" />
            <button type="button" onclick="openSelectionModal('add-category-modal', event)" class="add-category bg-white rounded-md min-h-14 w-full flex justify-between items-center px-4 text-sm font-semibold">
                <span id="selected-category" class="max-w-[calc(100% - 40px)] line-clamp-1 text-left ${ template_details.category_name ? 'text-zinc-950' : 'text-zinc-500' }">${ template_details.category_name || "Add Category" }</span>
                <img src="${api_config.add_icon}" alt="Add Icon" class="w-6 h-6"/>
            </button>
        </div>
        <div class="flex-[0_0_32.3%] flex-grow px-4 py-3">
            <input name="observation" type="hidden"  value="${template_details.obsevation_id  || ''}" data-value = "${template_details.obsevation_name}"/>
            <button type="button" onclick="openSelectionModal('add-observation-modal', event,${dynamic_id})" class="add-observation bg-white rounded-md h-14 w-full flex justify-between items-center px-4 text-sm font-semibold">
                <span id="selected-observation" class="max-w-[calc(100% - 40px)] line-clamp-1 text-left ${ template_details.obsevation_name ? 'text-zinc-950' : 'text-zinc-500' }">${ template_details.obsevation_name || "Add Observation" }</span>
                <img src="${api_config.add_icon}" alt="Add Icon" class="w-6 h-6"/>
            </button>
        </div>
        <div class="flex-[0_0_35.4%] overflow-hidden  pl-4 pr-5 py-3">
            <div class="flex flex-grow justify-between">
                <input name="competency" type="hidden" value="${template_details.competency_ids  || ''}" />
                <button type="button" onclick="openSelectionModal('add-competency-modal', event)" class="add-competency w-full w-[calc(100% - 44px)] bg-white rounded-md h-14 flex justify-between items-center px-4 text-sm font-semibold">
                    <span id="selected-competency" class="line-clamp-1 text-left max-w-[calc(100%-90px)] ${ template_details.competency_name ? 'text-zinc-950' : 'text-zinc-500' }">${ template_details.competency_name || "Add Competencies" }</span>
                    <div class="flex items-center gap-x-3 w-[70px] relative justify-end">
                        <div id="checked-count-container" class="hidden h-[21px] px-2.5 py-[3px] bg-blue-100 rounded-[30px] justify-center items-center gap-3 text-blue-500 text-xs font-medium">
                            <span id="checked-count-display" class="leading-3">0 </span>
                            <svg id="clearSelection" class="w-2 h-2 text-blue-500" alt="close Icon" onclick="clearSelectedCompetencies(event)">
                                <use href="${api_config.cross_icon}"></use>
                            </svg>
                        </div>
                        <img id="add-icon" src="${api_config.add_icon}" alt="Add Icon" class="w-6 h-6"/>
                    </div>
                </button>
                <button type="button" onclick="deleteRow(event)" class="deleteBtn ml-6 h-14">
                    <svg class="w-5 h-5 text-slate-500 hover:text-red ">
                        <use href="${api_config.delete_icon}"></use>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Append the new row to the container
    templateDetailsContainer.appendChild(newRow);
}
addButton.onclick = createNewRow;

// Function to delete a row
const deleteRow = (event) => {
    if (event.target.closest('.deleteBtn')) {
        const row = event.target.closest('.w-full.flex');
        if (row) {
            row.remove(); // Remove the row
        }
    }
}

function dropdownSelect(dynamic_id=null){
    document.querySelectorAll('.option-wrapper:not(.multi-select)').forEach(option => {
        option.onclick = (event) => {
            const selectedValue = event.currentTarget.dataset.name; 

            if (clickedButton) {
                const selectedValueDisplay = clickedButton.querySelector("span");
                const errorMessage = clickedButton.nextElementSibling;
                const previousInput = clickedButton.previousElementSibling;
            
                // Update display and attributes
                if (selectedValueDisplay) {
                    selectedValueDisplay.textContent = selectedValue;
                    selectedValueDisplay.classList.replace('text-zinc-500', 'text-zinc-950');
                }
            
                if (previousInput) {
                    previousInput.value = event.currentTarget.dataset.value;
                    previousInput.setAttribute('data-value', event.currentTarget.dataset.name);
                    previousInput.setAttribute('data-observation-row', `observation-${dynamic_id}`);
                }
            
                // Remove error message if present
                errorMessage?.remove();
            }
            
            if (clickedButton?.classList.contains("add-category")) {
                const siblingObservation = clickedButton.parentElement?.nextElementSibling;
                const observationDisplay = siblingObservation?.querySelector("span");
            
                if (observationDisplay) {
                    observationDisplay.textContent = 'Add Observation';
                    observationDisplay.classList.remove('text-zinc-950');
                    observationDisplay.classList.add('text-zinc-500');
                }
            
                const observationInput = observationDisplay?.parentElement?.previousElementSibling;
                if (observationInput) {
                    observationInput.value = '';
                    observationInput.setAttribute('data-value', '');
                }
            }
            event.currentTarget.closest('dialog').close();
        };
    });
}

// Highlight selected options on modal open
const highlightSelectedOptions = (modal) => {
    const selectedOptions = modal.querySelectorAll('.option-wrapper.bg-blue-100');
    if (selectedOptions) {
        selectedOptions.forEach(option => {
            option.classList.replace('bg-blue-100', 'bg-neutral-50');
            option.querySelectorAll('p').forEach(p => {
                p.classList.replace('text-blue-500', 'text-zinc-700');
                p.classList.replace('text-blue-400', 'text-zinc-500');
            });
        });
    }
    const selectedValue = clickedButton.textContent.trim();
    
    const option = modal.querySelector(`.option-wrapper[data-name=${CSS.escape(selectedValue)}]`);
    if (option) {
        option.classList.replace('bg-neutral-50', 'bg-blue-100');
        option.querySelectorAll('p').forEach(p => {
            p.classList.replace('text-zinc-700', 'text-blue-500');
            p.classList.replace('text-zinc-500', 'text-blue-400');
        });
    }
}

// Multi select handlers
const addCompetencyModalForm = document.querySelector('#add-competency-modal form');
const addCompetencySubmitBtn = document.getElementById("add-competency-submit-btn");

const resetModalForm = (modal) => {
    if (modal.id != 'add-competency-modal') return;
    modal.querySelector('form')?.reset();

    // Check the selected checkboxes
    const selectedCompetencies = clickedButton.previousElementSibling.value.split(',');
    if (selectedCompetencies[0] === "") return addCompetencySubmitBtn.disabled = true;

    selectedCompetencies.forEach(competencyId => {
        const checkbox = modal.querySelector(`input[type="checkbox"][value="${competencyId}"]`);
        if (checkbox) checkbox.checked = true;
    });
    addCompetencySubmitBtn.disabled = false;
}

const addSelectedCompetencies = (e) => {
    const checkedCheckboxes = addCompetencyModalForm.querySelectorAll('input[type="checkbox"]:checked');
    const checkedCount = checkedCheckboxes.length;
    const checkedCountContainer = clickedButton.querySelector("#checked-count-container");
    const checkedCountDisplay = checkedCountContainer.querySelector("#checked-count-display");
    const competencyDisplay = clickedButton.querySelector("#selected-competency");
    const errorMessage = clickedButton.parentElement.nextElementSibling;
    const selectedItems = [...checkedCheckboxes].map(checkbox => checkbox.name).join(", ");
    const selectedIds = [...checkedCheckboxes].map(checkbox => checkbox.value);

    competencyDisplay.textContent = selectedItems;
    competencyDisplay.classList.replace('text-zinc-500', 'text-zinc-950')
    clickedButton.previousElementSibling.value = selectedIds;

    // remove error message after change
    if(errorMessage) {
        errorMessage.remove();
    }

    checkedCountContainer.classList.replace('hidden', 'flex');
    checkedCountDisplay.textContent = checkedCount;

    e.target.closest('dialog').close();
}

const clearSelectedCompetencies = (e) => {
    e.stopPropagation();
    const clickedButton = e.target.closest('.add-competency');
    const checkedCountContainer = clickedButton.querySelector("#checked-count-container");
    const competencyDisplay = clickedButton.querySelector("span");

    competencyDisplay.classList.replace('text-zinc-950', 'text-zinc-500')
    competencyDisplay.textContent = "Add Competencies";
    clickedButton.previousElementSibling.value = "";
    checkedCountContainer.classList.replace('flex', 'hidden');
    clickedButton.querySelector('#add-icon').classList.remove('hidden');
}

const toggleAddButtonState = () => {
    const checkedCheckboxesCount = addCompetencyModalForm.querySelectorAll('input[type="checkbox"]:checked').length;
    if (checkedCheckboxesCount > 0) {
        addCompetencySubmitBtn.disabled = false;
    } else {
        addCompetencySubmitBtn.disabled = true;
    }
}

addCompetencyModalForm.addEventListener('change', toggleAddButtonState);
addCompetencySubmitBtn.onclick = addSelectedCompetencies;

// Class definition
let MCSaveUser = function () {
    let validator;
    const handleSubmit = () => {
        const form = document.getElementById('create-or-update-observation-template-form');
        const submitButton = document.getElementById('create-or-update-observation-template-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'template_name': {
                        validators: {
                            notEmpty: {
                                message: 'This field is required'
                            }
                        }
                    },
                    'role': {
                        validators: {
                            notEmpty: {
                                message: 'This field is required'
                            }
                        }
                    },
                    'grading_scale': {
                        validators: {
                            notEmpty: {
                                message: 'This field is required'
                            }
                        }
                    },
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.mb-6',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );

        submitButton.addEventListener('click', async e => {
            e.preventDefault();
            if (validator) {
                try {
                    const status = await validator.validate();

                    const formData = new FormData();
                    let selectedStatus = document.getElementById('status').checked;
                    formData.append('sequence_id', document.querySelector('[name="sequence_id"]').value);
                    formData.append('template_name', document.querySelector('[name="template_name"]').value);
                    formData.append('grading_scale', document.querySelector('[name="grading_scale"]').value);
                    formData.append('role', document.querySelector('[name="role"]').value);
                    formData.append('status', selectedStatus);

                    const templateDetails = [];
                    const detailsIdlist = [];
                    let formIsValid = true;

                    document.querySelectorAll('.template_details').forEach((container) => {
                        const template_details_id    = container.querySelector('[name="template_details_id"]').value;
                        const category    = container.querySelector('[name="category"]').value;
                        const observation = container.querySelector('[name="observation"]').value;
                        const competency  = container.querySelector('[name="competency"]').value;

                        const categoryButton    = container.querySelector('.add-category');
                        const observationButton = container.querySelector('.add-observation');
                        const competencyButton  = container.querySelector('.add-competency');
                        
                        const detailsEntry = {};

                        // Remove any existing error message if the field is valid
                        const existingError = container.querySelector('.text-red');
                        if (existingError) {
                            existingError.remove();
                        }

                        // Conditionally add properties only if they have a value
                        if (template_details_id != null && template_details_id !== '' && template_details_id !== 'undefined') {
                            detailsEntry.details_id = template_details_id;
                            detailsIdlist.push(template_details_id);
                        }
                    
                        if (category != null && category !== '') {
                            detailsEntry.category = category;
                        } else {
                            const errorMessage = document.createElement('p');
                            errorMessage.className = 'mt-2 text-red text-xs';
                            errorMessage.textContent = 'Category is required.';
                            if (!container.querySelector('.text-red')) {
                                categoryButton.insertAdjacentElement('afterend', errorMessage);
                                formIsValid =false
                                return; 
                            }
                        }
                        
                        if (observation != null && observation !== '') {
                            detailsEntry.observation = observation;
                        } else {
                            const errorMessage = document.createElement('p');
                            errorMessage.className = 'mt-2 text-red text-xs';
                            errorMessage.textContent = 'Observation is required.';
                            if (!container.querySelector('.text-red')) {
                                observationButton.insertAdjacentElement('afterend', errorMessage);
                                formIsValid =false
                                return; 
                            }
                        }
                    
                        if (competency != null && competency !== '') {
                            detailsEntry.competency = competency;
                        } else {
                            const errorMessage = document.createElement('p');
                            errorMessage.className = 'mt-2 text-red text-xs';
                            errorMessage.textContent = 'Competency is required.';
                            if (!container.querySelector('.text-red')) {
                                competencyButton.parentElement.insertAdjacentElement('afterend', errorMessage);
                                formIsValid =false
                                return; 
                            }
                        }
                    
                        // Only push to templateDetails if the object is not empty
                        if (Object.keys(detailsEntry).length > 0) {
                            templateDetails.push(detailsEntry);
                        }
                    });

                    if (!formIsValid) {
                        return;
                    }

                    formData.append('sequence_details', JSON.stringify(templateDetails));
                    formData.append('details_id_list', JSON.stringify(detailsIdlist));

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;

                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-observation-template-submit');

                        btn.style.display = 'none';

                        const response = await fetch(api_config.create_or_update_from, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': api_config.csrfmiddlewaretoken,
                            },
                            body: formData,
                        });

                        const responseData = await response.json();  // Read the response body as JSON

                        if (responseData.status === 200) {
                            const redirectUrl = form.getAttribute('data-redirect-url');
                            if (redirectUrl) {
                                location.href = redirectUrl;
                            }
                        } else {
                            submitButton.removeAttribute('data-kt-indicator');
                            btn.style.display = 'inline-block';
                            submitButton.disabled = false;      
                            Toast.showInfoToast(`${responseData.message || "Please try again."}`);
                        }
                    } else {

                        submitButton.removeAttribute('data-kt-indicator');
                        submitButton.disabled = false;
                    }
                } catch (error) {
                    console.error( error);
                }
            }
        });
    }
    return {
        init: function () {
            handleSubmit();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    let  sequence = api_config.sequence;
    MCSaveUser.init();
    createSearchableSelect('role');
    createSearchableSelect('grading_scale');
    dropdownSelect();

    if (sequence) {
        fetchCompetency(gradingScale.value, role.dataset.value);
    } else {
        addButton.click();
    }
    
    const template_details = api_config.template_details
    template_details.forEach(details => {
        createNewRow(details)
    })

    // Overide default dialog show method
    const modals = document.querySelectorAll('dialog');
    modals.forEach(modal => {
        const originalShowModal = modal.showModal;
        modal.showModal = function () {
            originalShowModal.call(this);
            highlightSelectedOptions(this);
            resetModalForm(this);
        }
    });
});


const gradingScale = document.querySelector('[name="grading_scale"]');
const role         = document.querySelector('[name="role"]');

const handleGradingScaleAndRoleChange = () => {
    const gradingScaleID = gradingScale?.value;
    const roleCategory = role?.dataset?.value;
    
    if (gradingScaleID && roleCategory) {
        fetchCompetency(gradingScaleID, roleCategory);
    }
}

gradingScale.addEventListener('change', handleGradingScaleAndRoleChange);
role.addEventListener('change', handleGradingScaleAndRoleChange);


async function fetchObservation(categoryId,modalId,categoryName,dynamic_id) {
    if (!categoryId) categoryId = 0;
    let modalDiv = document.getElementById(modalId).querySelector('#observation-modal-div');
    modalDiv.innerHTML = "";

    try {
      const formData = new FormData();
      formData.append('category_id', categoryId);
      const response = await fetch(api_config.observation_fetch, {
        method: 'POST',
        headers: {
          'X-CSRFToken': api_config.csrfmiddlewaretoken,
        },
        body: formData,
      });

      const responseData = await response.json();
      if (response.status === 200) {    
        var modalHeader = document.getElementById(modalId).querySelector('#category-name-head')
        modalHeader.textContent = categoryName !== 'undefined' ? categoryName : "Not selected";

        const countDiv = document.createElement('div')
        countDiv.className = "mb-5 flex justify-start items-center gap-3"

        const countNamepara = document.createElement('p');
        countNamepara.className = 'text-gray-900 text-sm font-medium';
        countNamepara.textContent = "Available Observations";
    
        const countValuePara = document.createElement('p');
        countValuePara.className = 'px-2 py-[3px] bg-blue-100 rounded-full text-blue-500 text-xs font-bold';
        countValuePara.textContent = responseData.observations.length;

        countDiv.appendChild(countNamepara)
        countDiv.appendChild(countValuePara)

        modalDiv.appendChild(countDiv)

        const parentDiv = document.createElement('div');
        parentDiv.className = 'w-full flex flex-col justify-center items-start gap-3'

        await responseData.observations.forEach(option => {
            const optionWrapper = document.createElement('div');
            optionWrapper.className = 'option-wrapper w-full px-[18px] pl-[34px] py-3 bg-neutral-50 rounded-md border border-gray-100 hover:bg-blue-100 active:text-blue-500';
            optionWrapper.setAttribute('data-name', option.name);
            optionWrapper.setAttribute('data-value', option.id);

            const nameParagraph = document.createElement('p');
            nameParagraph.className = 'text-zinc-700 text-sm font-medium';
            nameParagraph.textContent = option.name;
        
            //added highlights to selected option
            if (clickedButton.textContent === option.name) {
                optionWrapper.classList.replace('bg-neutral-50', 'bg-blue-100');
                nameParagraph.classList.replace('text-zinc-700', 'text-blue-500');
            }

            const idParagraph = document.createElement('p');
            idParagraph.className = 'text-zinc-500 text-xs font-normal';
            idParagraph.textContent = option.code;
        
            optionWrapper.appendChild(nameParagraph);
            optionWrapper.appendChild(idParagraph);

            parentDiv.appendChild(optionWrapper);
        });

        modalDiv.appendChild(parentDiv)

        dropdownSelect(dynamic_id)

      } else {
        console.error('Failed to fetch Observations: ', responseData.message);
      }
    } catch (error) {
      console.error('Error fetching Observations:', error);
    }
}

async function fetchCompetency(gradingScaleID, roleCategory) {
    if (!gradingScaleID) gradingScaleID = 0;
    if (!roleCategory) roleCategory = 0;
    try {
      const formData = new FormData();
      formData.append('grading_scale', gradingScaleID);
      formData.append('role_category', roleCategory);
      
      const response = await fetch(api_config.competency_fetch, {
        method: 'POST',
        headers: {
          'X-CSRFToken': api_config.csrfmiddlewaretoken,
        },
        body: formData,
      });

      const responseData = await response.json();
      if (response.status === 200) {   
            const formContainer = document.getElementById('category-name-form');
            formContainer.innerHTML = ''

            const competencyCount = document.getElementById('competency_modal_count');
            competencyCount.innerHTML = responseData.competency.length ?? 0

            responseData.competency.forEach(option => {
                const optionWrapper = document.createElement('div');
                optionWrapper.className = 'option-wrapper multi-select w-full px-[18px] py-3 flex items-start justify-start gap-3.5 bg-neutral-50 rounded-md border border-gray-100 hover:bg-blue-100';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'mt-1 w-4 h-4 rounded';
                checkbox.value = option.id;
                checkbox.name = option.name;

                const textContainer = document.createElement('div');
                const nameParagraph = document.createElement('p');
                nameParagraph.className = 'text-zinc-700 text-sm font-medium';
                nameParagraph.textContent = option.name;

                const codeParagraph = document.createElement('p');
                codeParagraph.className = 'text-zinc-500 text-xs font-normal';
                codeParagraph.textContent = option.code;

                textContainer.appendChild(nameParagraph);
                textContainer.appendChild(codeParagraph);

                optionWrapper.appendChild(checkbox);
                optionWrapper.appendChild(textContainer);

                formContainer.appendChild(optionWrapper);
            });


      } else {
        console.error('Failed to fetch Competency: ', responseData.message);
      }
    } catch (error) {
      console.error('Error fetching Competency:', error);
    }
}