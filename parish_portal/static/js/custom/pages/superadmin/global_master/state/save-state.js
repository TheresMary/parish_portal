"use strict";

// Class definition
const MCSaveUser = function () {
    let validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-state-form');
        const submitButton = document.getElementById('create-or-update-state-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    state_name: createAlphaNumericRequiredValidator(),
                    state_code: {
                        validators: {
                            regexp: {
                                regexp: /^(?=.*\S)[a-zA-Z0-9\s]+$/,
                                message: 'State code must be alphanumeric'
                            }
                        }
                    },
                    country: createFieldRequiredValidator()
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

        submitButton.addEventListener('click', async e => {
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                try {
                    const status = await validator.validate();
                    if (status !== 'Valid') return;

                    const formData = new FormData();
                    const selectedStatus = document.getElementById('status').checked;
                    const stateId = document.querySelector('[name="state_id"]').value;

                    formData.append('state_id', stateId);
                    formData.append('state_name', document.querySelector('[name="state_name"]').value.trim());
                    formData.append('state_code', document.querySelector('[name="state_code"]').value.trim());
                    formData.append('country', document.querySelector('[name="country"]').value.trim());
                    formData.append('state_status', selectedStatus);

                    if (stateId && !selectedStatus) {
                        const result = await Modal.showDeleteModal(
                            "Are you sure?",
                            "Do you really want to mark the 'state' as inactive ?",
                            "Yes"
                        );
                        if (result.isDismissed) return $('.swal2-container').addClass('!hidden');
                        $('.swal2-container').addClass('!hidden');
                    }

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

                } catch (error) {
                    console.error(error);
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
    createSearchableSelect('country');
});