"use strict";

// Class definition
var MCSaveUser = function () {
    var validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-observation-form');
        const submitButton = document.getElementById('create-or-update-observation-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'observation_name': {
                        validators: {
                            notEmpty: {
                                message: 'Observation Name* is required'
                            },
                            stringLength: {
                                max: 50,
                                message: 'Observation Name* must be 50 characters or fewer'
                            },
                            regexp: {
                                regexp: /^[A-Za-z0-9\s-]+$/,
                                message: 'Only alphanumeric characters, spaces, and hyphens are allowed'
                            },
                        }
                    },
                    'observation_category': createFieldRequiredValidator(),
                    'observation_code': createFieldRequiredValidator(),
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
            // Validate form before submit
            if (validator) {
                try {
                    const status = await validator.validate();

                    const formData = new FormData();
                    var selectedStatus = document.getElementById('status').checked;
                    formData.append('observation_id', document.querySelector('[name="observation_id"]').value);
                    formData.append('observation_name', document.querySelector('[name="observation_name"]').value);
                    formData.append('observation_category', document.querySelector('[name="observation_category"]').value);
                    formData.append('observation_code', document.querySelector('[name="observation_code"]').value);
                    formData.append('description', document.querySelector('[name="description"]').value);
                    formData.append('status', selectedStatus);

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;


                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-observation-submit');

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
                            // Handle other cases if needed
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
createSearchableSelect('observation-category');

// On document ready
KTUtil.onDOMContentLoaded(function () {
    MCSaveUser.init();
});


