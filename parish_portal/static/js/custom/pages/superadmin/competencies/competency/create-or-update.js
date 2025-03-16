"use strict";

// Class definition
var MCSaveUser = function () {
    var validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-competency-form');
        const submitButton = document.getElementById('create-or-update-competency-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'role_category': createFieldRequiredValidator(),
                    'domain': createFieldRequiredValidator(),
                    'competency_name': createFieldRequiredValidator(),
                    'competency_code': createFieldRequiredValidator(),
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
                    formData.append('competency_id', document.querySelector('[name="competency_id"]').value);
                    formData.append('role_category', document.querySelector('[name="role_category"]').value);
                    formData.append('domain', document.querySelector('[name="domain"]').value);
                    formData.append('competency_code', document.querySelector('[name="competency_code"]').value);
                    formData.append('competency_name', document.querySelector('[name="competency_name"]').value);
                    formData.append('description', document.querySelector('[name="description"]').value);
                    formData.append('status', selectedStatus);

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;


                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-competency-submit');

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





var handleCategoryAndDomainFilter = () => {
    // Select the dropdown elements by their IDs
    const roleCategoryField = document.getElementById("role-category");
    const domainField = document.getElementById("domain");

    // Add event listeners for when the dropdown values change
    roleCategoryField.addEventListener("change", checkAndFetchCompetencyCode);
    domainField.addEventListener("change", checkAndFetchCompetencyCode);

    async function checkAndFetchCompetencyCode() {
        // Get the current values of the role_category and domain dropdowns
        const roleCategoryValue = roleCategoryField.value;
        const domainValue = domainField.value;
        // Check if both fields have values before making the request
        if (roleCategoryValue && domainValue) {

            const formData = new FormData();
            formData.append("role_category", roleCategoryValue);
            formData.append("domain", domainValue);


            const response = await fetch(api_config.competency_code_fetch, {
                method: 'POST',
                headers: {
                  'X-CSRFToken': api_config.csrfmiddlewaretoken,
                },
                body: formData,
              });

            const responseData = await response.json();


            document.querySelector('input[name="competency_code"]').value = responseData.data;

        }
    }
};


$(function(){
    handleCategoryAndDomainFilter()
})

