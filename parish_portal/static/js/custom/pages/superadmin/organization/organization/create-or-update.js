"use strict";

// Class definition
const MCSaveUser = function () {
    let validator;
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-organization-form');
        const submitButton = document.getElementById('create-or-update-organization-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                  'organization_name': createAlphaNumericRequiredValidatorWithMaxLength(100),
                  'country': createFieldRequiredValidator(),
                  'location': createFieldRequiredValidator(),
                  'state': createFieldRequiredValidator(),
                  'zipcode': createFieldRequiredValidator(),
                  'address': createFieldRequiredValidatorWithMaxLength(200),
                  'contact_person': createAlphabetsRequiredValidatorWithMaxLength(100),
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
                  'website_url': {
                    validators: {
                      uri: {
                        message: 'Please enter a valid URL'
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
                    const selectedStatus = document.getElementById('status').checked;
                    formData.append('organization_id', document.querySelector('[name="organization_id"]').value);
                    formData.append('organization_name', document.querySelector('[name="organization_name"]').value);
                    formData.append('city', document.querySelector('[name="location"]').value);
                    formData.append('state', document.querySelector('[name="state"]').value);
                    formData.append('country', document.querySelector('[name="country"]').value);
                    formData.append('zipcode', document.querySelector('[name="zipcode"]').value);
                    formData.append('address', document.querySelector('[name="address"]').value);
                    formData.append('contact_person', document.querySelector('[name="contact_person"]').value);
                    formData.append('contact_person_number', document.querySelector('[name="contact_person_number"]').value);
                    formData.append('contact_person_email', document.querySelector('[name="contact_person_email"]').value);
                    formData.append('website_url', document.querySelector('[name="website_url"]').value);
                    formData.append('status', selectedStatus);

                    const logoInput = document.querySelector('[name="company_logo"]');
                    if (logoInput.files.length > 0) {
                        formData.append('company_logo', logoInput.files[0]);
                    }

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;


                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-organization-submit');

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

function initializeImageUpload(dropAreaId, removeButtonId, dropTextId, inputFileId) {
    let imgPreview;

    const dropArea = document.getElementById(dropAreaId);
    const removeButton = document.getElementById(removeButtonId);
    const dropText = document.getElementById(dropTextId);
    const inputFile = document.getElementById(inputFileId);

    // Prevent default behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop area on drag
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.add('border-blue-500'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.remove('border-blue-500'), false);
    });

    // Handle file drop
    dropArea.addEventListener('drop', (event) => {
      const file = event.dataTransfer.files[0];
      handleFile(file);
    });

    // Handle file input change
    inputFile.addEventListener('change', (event) => {
      const file = event.target.files[0];
      handleFile(file);
    });

    // Handle file input or drop
    function handleFile(file) {
      if (file) {
        // Remove the previous image if it exists
        if (imgPreview) {
          imgPreview.remove();
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          imgPreview = document.createElement('img');
          imgPreview.src = reader.result;
          imgPreview.classList.add('max-w-full', 'h-auto');
          dropArea.appendChild(imgPreview);

          // Update UI to show the remove button
          removeButton.classList.remove('hidden');
          dropText.classList.add('hidden');
        };
      }
    }

    // Remove the uploaded image
    removeButton.addEventListener('click', removeImage);

    function removeImage() {
      if (imgPreview) {
        imgPreview.remove();
        imgPreview = null;
      }

      // Reset the file input field and UI
      inputFile.value = '';
      removeButton.classList.add('hidden');
      dropText.classList.remove('hidden');
    }
  }

document.addEventListener('DOMContentLoaded', () => {
  initializeImageUpload('drop-area', 'remove-image', 'drop-text', 'company-logo');
});

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

// On document ready
KTUtil.onDOMContentLoaded(function () {
  MCSaveUser.init();
  createSearchableSelect('country-name');
  createSearchableSelect('state-name');
  createSearchableSelect('location-name');
  createSearchableSelect('zipcode');
});
