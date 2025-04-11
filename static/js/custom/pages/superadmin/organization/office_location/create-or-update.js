"use strict";

// Class definition
var MCSaveUser = function () {
    var validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-officelocation-form');
        const submitButton = document.getElementById('create-or-update-officelocation-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'office_location'   : createFieldRequiredValidator(),
                    'organization'      : createFieldRequiredValidator(),
                    'groups'            : createFieldRequiredValidator(),
                    'country'           : createFieldRequiredValidator(),
                    'state'             : createFieldRequiredValidator(),
                    'location'          : createFieldRequiredValidator(),
                    'zipcode'           : createFieldRequiredValidator(),
                    'address'           : createFieldRequiredValidator(),
                    'contact_person': {
                        validators: {
                            notEmpty: {
                                message: 'This field is required'
                            },
                            regexp: {
                              regexp: /^[a-zA-Z\s]+$/,
                              message: 'Only alphabetic characters are allowed'
                            }
                        }
                    },
                    'contact_person_number': {
                        validators: {
                          regexp: {
                            regexp: /^[0-9]+$/,
                            message: 'Only numbers are allowed'
                          }
                        }
                    },
                    'contact_person_email': {
                        validators: {
                          emailAddress: {
                            message: 'Please enter a valid email address'
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


            // Validate form before submit
            if (validator) {
                try {
                    const status = await validator.validate();

                    const formData = new FormData();
                    var selectedStatus = document.getElementById('status').checked;
                    formData.append('officelocation_id', document.querySelector('[name="officelocation_id"]').value);
                    formData.append('office_location', document.querySelector('[name="office_location"]').value);
                    formData.append('organization', document.querySelector('[name="organization"]').value);
                    formData.append('groups', document.querySelector('[name="groups"]').value);
                    formData.append('country', document.querySelector('[name="country"]').value);
                    formData.append('state', document.querySelector('[name="state"]').value);
                    formData.append('city', document.querySelector('[name="location"]').value);
                    formData.append('zipcode', document.querySelector('[name="zipcode"]').value);
                    formData.append('address', document.querySelector('[name="address"]').value);
                    formData.append('contact_person', document.querySelector('[name="contact_person"]').value);
                    formData.append('contact_person_number', document.querySelector('[name="contact_person_number"]').value);
                    formData.append('contact_person_email', document.querySelector('[name="contact_person_email"]').value);
                    formData.append('status', selectedStatus);

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;


                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-officelocation-submit');

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
    createSearchableSelect('organization');
    createSearchableSelect('group');
    createSearchableSelect('country-name');
    createSearchableSelect('state-name');
    createSearchableSelect('location-name');
    createSearchableSelect('zipcode');
});

async function fetchGroups(organizationId) {
    if (!organizationId) return populateSearchableDropdowns('group', []);
    try {

        const formData = new FormData();
        formData.append('organizationId', organizationId);

        const response = await fetch(api_config.groups_fetch, {
          method: 'POST',
          headers: {
              'X-CSRFToken': api_config.csrfmiddlewaretoken,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.status === 200) {
            populateSearchableDropdowns('group', responseData.groups);
        } else {
            console.error('Failed to fetch states: ', responseData.message);
        }
    } catch (error) {
        console.error('Error fetching states:', error);
    }
}

async function fetchStates(countryId) {
    if (!countryId) return populateSearchableDropdowns('state-name', []);
    try {

        const formData = new FormData();
        formData.append('countryId', countryId);

        const response = await fetch(api_config.state_fetch, {
          method: 'POST',
          headers: {
              'X-CSRFToken': api_config.csrfmiddlewaretoken,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.status === 200) {
            populateSearchableDropdowns('state-name', responseData.states);
        } else {
            console.error('Failed to fetch states: ', responseData.message);
        }
    } catch (error) {
        console.error('Error fetching states:', error);
    }
}

async function fetchLocation(statesId) {
    if (!statesId) return populateSearchableDropdowns('location-name', []);
    try {

        const formData = new FormData();
        formData.append('statesId', statesId);

        const response = await fetch(api_config.location_fetch, {
          method: 'POST',
          headers: {
              'X-CSRFToken': api_config.csrfmiddlewaretoken,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.status === 200) {
            populateSearchableDropdowns('location-name', responseData.cities);
        } else {
            console.error('Failed to fetch location: ', responseData.message);
        }
    } catch (error) {
        console.error('Error fetching location:', error);
    }
}

async function fetchZipCode(locationId) {
    if (!locationId) return populateSearchableDropdowns('zipcode', []);
    try {

        const formData = new FormData();
        formData.append('locationId', locationId);

        const response = await fetch(api_config.zipcode_fetch, {
          method: 'POST',
          headers: {
              'X-CSRFToken': api_config.csrfmiddlewaretoken,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.status === 200) {
            populateSearchableDropdowns('zipcode', responseData.zipcodes);
        } else {
            console.error('Failed to fetch Zip Code: ', responseData.message);
        }
    } catch (error) {
        console.error('Error fetching Zip Code:', error);
    }
}


