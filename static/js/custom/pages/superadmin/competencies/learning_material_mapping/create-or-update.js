"use strict";

// Class definition
let MCSaveLMMapping = function () {
    let validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-learning-material-mapping-form');
        const submitButton = document.getElementById('create-or-update-learning-material-mapping-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    competency: createFieldRequiredValidator(),
                    learning_materials: createFieldRequiredValidator(),
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );

        submitButton.onclick = async e => {  
            e.preventDefault();
            // Validate form before submit
            if (validator) {
                try {
                    const status = await validator.validate();
                    
                    const learningMaterials = form.querySelector('[name="learning_materials"]').value.split(',');
                    const selectedStatus = document.getElementById('status').checked;
                    
                    const formData = new FormData();
                    formData.append('lm_mapping_id', document.querySelector('[name="lm_mapping_id"]').value);
                    formData.append('competency', form.querySelector('[name="competency"]').value);
                    formData.append('learning_materials', learningMaterials);
                    formData.append('description', form.querySelector('[name="description"]').value);
                    formData.append('status', selectedStatus);
                    
                    if (status === 'Valid') {
                        submitButton.setAttribute('data-kt-indicator', 'on');
                        submitButton.disabled = true;
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
                            // Handle other cases if needed
                            submitButton.removeAttribute('data-kt-indicator');
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
        };

    }


    return {
        init: function () {
            handleSubmit();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    MCSaveLMMapping.init();
    createSearchableSelect('competency');
    createSearchableMultiSelect('learning-materials')
});
