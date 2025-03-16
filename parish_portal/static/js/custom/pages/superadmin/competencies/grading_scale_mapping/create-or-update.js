const gradingContainer = document.getElementById("grading-container");
const gradingScaleSelect = document.getElementById("grading-scale-select");

async function gradingLevels(scale) {
    if (scale) {
        const formData = new FormData();
        formData.append("grading_scale", scale);
        const response = await fetch(api_config.grading_values_fetch, {
            method: 'POST',
            headers: {
            'X-CSRFToken': api_config.csrfmiddlewaretoken,
            },
            body: formData,
        });
        const responseData = await response.json();
        return responseData.data
    }
};

const createGradingInputs = (value) => {
    return `
    <!-- Grading Value & Description Field -->
        <div class="w-full flex gap-5 text-gray-800 font-normal text-sm grading_container validate_class">
            <input type="hidden" value="${value.threshold_id}" class="threshold_id">
            <div class="w-1/6">
                <input 
                    type="text" name="grading-value" 
                    class="w-full border border-gray-300 rounded px-3 py-2 grading_values" 
                    value="${value.grading_values}"  id="${value.id}" 
                    disabled 
                />
            </div>
            <div class="w-5/6 validate_class">
                <input 
                    type="text" name="threshold_values"  value="${value.threshold_value ?? ''}"  
                    class="w-full border border-gray-300 rounded px-3 py-2 threshold_values" 
                    placeholder="Enter description" 
                />
            </div>
        </div>
    `;
};       

const clearGradingInputs = () => {
    gradingContainer.innerHTML = '';
};

const displayGradingInputs = (scale) => {
    var gradingValues = gradingLevels(scale)
    if (scale && gradingValues) {
        gradingValues.then((result) => {
            result.forEach(value => {
                gradingContainer.innerHTML += createGradingInputs(value);
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loadData = api_config.grading_values
    loadData.forEach(value => {
        gradingContainer.innerHTML += createGradingInputs(value);
    });
})

const handleGradingScaleChange = (e) => {
    const selectedScale = e.target.value;
    clearGradingInputs();
    displayGradingInputs(selectedScale);
};

const init = () => {
    gradingScaleSelect.addEventListener("change", handleGradingScaleChange);
};
init();

var MCSaveUser = function () {
    var validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-competency-mapping-form');
        const submitButton = document.getElementById('create-or-update-gradingscale_mapping-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'competency_name': createFieldRequiredValidator(),
                    'grading_scale': createFieldRequiredValidator(),
                    'threshold_values': {
                        validators: {
                            notEmpty: {
                                message: 'This field is required'
                            },
                            stringLength: {
                                max: 100,
                                message: 'Description must be less than 100 characters'
                            },
                            regexp: {
                                regexp: /^[A-Za-z0-9\s-]+$/,
                                message: 'Only alphanumeric characters, spaces, and hyphens are allowed'
                            },
                        }
                      },                     
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.validate_class',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );

        submitButton.addEventListener('click', async e => {
            e.preventDefault();
            // Validate form before submit
            if (validator) {
                try {
                    const status = await validator.validate();

                    const formData = new FormData();
                    var selectedStatus = document.getElementById('status').checked;
                    formData.append('gradingscale_mapping_id', document.querySelector('[name="gradingscale_mapping_id"]').value);
                    formData.append('competency_name', document.querySelector('[name="competency_name"]').value);
                    formData.append('grading_scale', document.querySelector('[name="grading_scale"]').value);
                    formData.append('status', selectedStatus);
                    
                    const gradingData = [];
                    let formIsValid = true;

                    document.querySelectorAll('.grading_container').forEach((container) => {
                        const gradingInput    = container.querySelector('.grading_values');
                        const thresholdInput  = container.querySelector('.threshold_values');
                        const threshold_row    = container.querySelector('.threshold_id').value;

                        const threshold_id = threshold_row ? threshold_row : null;

                        // Validate threshold description
                        if (!thresholdInput || !thresholdInput.value.trim()) {
                            const errorMessage = document.createElement('span');
                            errorMessage.className = 'text-red text-xs';
                            errorMessage.textContent = 'Threshold description is required.';
                            if (!container.querySelector('.text-red')) {
                                thresholdInput.insertAdjacentElement('afterend', errorMessage);
                            }

                            formIsValid =false
                            return; 
                        }
                    
                        // Remove any existing error message if the field is valid
                        const existingError = container.querySelector('.text-red');
                        if (existingError) {
                            existingError.remove();
                        }

                        if (gradingInput && thresholdInput) {
                            const gradingId = gradingInput.id;
                            const thresholdValue = thresholdInput.value.trim();
                            if (gradingId || thresholdValue) {
                                gradingData.push({
                                    grading_value: gradingId ,
                                    threshold: thresholdValue,
                                });
                                if (threshold_id) {
                                    gradingData.threshold_id = threshold_id;
                                }
                            }
                        }
                    });

                    if (!formIsValid) {
                        return;
                    }
            
                    formData.append('grading_data', JSON.stringify(gradingData));

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;

                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-gradingscale_mapping-submit');

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
                            const res = responseData.message?.message ?? responseData.message;
                            // Handle other cases if needed
                            submitButton.removeAttribute('data-kt-indicator');
                            btn.style.display = 'inline-block';
                            submitButton.disabled = false;
                            Toast.showInfoToast(`${res || "Please try again."}`);
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
    MCSaveUser.init();
});


