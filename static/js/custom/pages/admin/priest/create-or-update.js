"use strict";

// Class definition
var MCSaveUser = function () {
    var validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-priest-form');
        const submitButton = document.getElementById('create-or-update-priest-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'priest_name'  : createFieldRequiredValidator(),
                    'priest_contact_number': createFieldRequiredValidator(),
                    'priest_email': createFieldRequiredValidator(),
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
            alert('clicked');
            e.preventDefault();


            // Validate form before submit
            if (validator) {
                try {
                    const status = await validator.validate();

                    const formData = new FormData();
                    var selectedStatus = document.getElementById('status').checked;
                    formData.append('priest_id', document.querySelector('[name="priest_id"]').value);
                    formData.append('priest_name', document.querySelector('[name="priest_name"]').value);
                    formData.append('priest_contact_number', document.querySelector('[name="priest_contact_number"]').value);
                    formData.append('priest_email', document.querySelector('[name="priest_email"]').value);
                    formData.append('priest_status', selectedStatus);

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;


                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-priest-submit');

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

// On document ready
KTUtil.onDOMContentLoaded(function () {
    MCSaveUser.init();
});