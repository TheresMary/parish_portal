"use strict";
var SigninGeneral = function () { // Elements
    var form;
    var submitButton;
    var validator;

    // Handle form
    var handleForm = function (e) {
        validator = FormValidation.formValidation(form, {
            fields: {
                'email_or_username': {
                    validators: {
                        notEmpty: {
                            message: 'Username or Email is required'
                        },
                    }
                },
                'password': {
                    validators: {
                        notEmpty: {
                            message: 'The password is required'
                        }
                    }
                }
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap5(
                    { rowSelector: '.fv-row' }
                )
            }
        });

        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            // Prevent button default action
            e.preventDefault();
        
            // Validate form
            validator.validate().then(function (status) {
                if (status === 'Valid') {
                    // Show loading indication
                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;
        
                    // Get form data
                    let email_or_username = form.querySelector('[name="email_or_username"]').value;
                    let password = form.querySelector('[name="password"]').value;
        
                    // AJAX POST with CSRF token
                    $.ajax({
                        url: `${api_config.authentication_url}`,
                        type: 'POST',
                        headers: {
                            'X-CSRFToken': api_config.csrfmiddlewaretoken
                        },
                        data: {
                            email_or_username: email_or_username,
                            password: password
                        },
                        dataType: 'json',
                        success: function (data) {
                            if (data.status_code == 100) {
                                // Clear form fields
                                form.querySelector('[name="email_or_username"]').value = "";
                                form.querySelector('[name="password"]').value = "";
        
                                // Handle redirect
                                var redirectUrl = form.getAttribute('data-redirect-url');
                                if (redirectUrl) {
                                    localStorage.removeItem('sessionExpired');
                                    location.href = redirectUrl;
                                }
                            } else {
                                // Show error message
                                Swal.fire({
                                    text: data.message,
                                    icon: "error",
                                    target: '#_sign_in_form .login-form',
                                    buttonsStyling: false,
                                    showConfirmButton: false,
                                    customClass: {
                                        popup: "focus:outline-none", 
                                    }
                                });
                            }
                        },
                        error: function (jqxhr, status, error) {
                            console.error('Request failed:', error);
                            Swal.fire({
                                text: "An error occurred. Please try again.",
                                icon: "error",
                                target: '#_sign_in_form .login-form',
                                buttonsStyling: false,
                                showConfirmButton: false,
                                customClass: {
                                    popup: "focus:outline-none",
                                }
                            });
                        },
                        complete: function () {
                            // Reset button state
                            submitButton.removeAttribute('data-kt-indicator');
                            submitButton.disabled = false;
                        }
                    });
                } else {
                    // Show validation error message
                    Swal.fire({
                        text: "Oops! Invalid credentials. Please try again.",
                        icon: "error",
                        target: '#_sign_in_form .login-form',
                        buttonsStyling: false,
                        showConfirmButton: false,
                        customClass: {
                            popup: "focus:outline-none", 
                        }
                    });
                }
            });
        });
    }

    // Public functions
    return { // Initialization
        init: function () {
            form = document.querySelector('#_sign_in_form');
            submitButton = document.querySelector('#_sign_in_submit');

            handleForm();
        }
    };
}();

KTUtil.onDOMContentLoaded(function () {
    SigninGeneral.init();
});