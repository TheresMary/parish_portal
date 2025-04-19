"use strict";

// Class definition
const MCSaveUser = function () {
	let validator;
	const handleSubmit = () => {

		// Get elements
		const form = document.getElementById('create-or-update-zipcode-form');
		const submitButton = document.getElementById('create-or-update-zipcode-submit');

		validator = FormValidation.formValidation(
			form,
			{
				fields: {
					zip_code: {
						validators: {
							notEmpty: {
								message: 'This field is required'
							},
							regexp: {
								regexp: /^\d+$/,
								message: 'Zip code should be numeric',
							}
						}
					},
					country: createFieldRequiredValidator(),
					location: createFieldRequiredValidator(),
					state: createFieldRequiredValidator()
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
					const zipcodeId = document.querySelector('[name="zipcode_id"]').value;
					formData.append('zipcode_id', zipcodeId);
					formData.append('zip_code', document.querySelector('[name="zip_code"]').value.trim());
					formData.append('city', document.querySelector('[name="location"]').value.trim());
					formData.append('state', document.querySelector('[name="state"]').value.trim());
					formData.append('country', document.querySelector('[name="country"]').value.trim());
					formData.append('zipcode_status', selectedStatus);

					if (zipcodeId && !selectedStatus) {
						const result = await Modal.showDeleteModal(
							"Are you sure?",
							"Do you really want to mark the 'zipcode' as inactive ?",
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
	createSearchableSelect('state');
	createSearchableSelect('location');
});

async function fetchStates(countryId) {
	if (!countryId) return populateSearchableDropdowns('state', []);
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
			populateSearchableDropdowns('state', responseData.states);
		} else {
			console.error('Failed to fetch states: ', responseData.message);
		}
	} catch (error) {
		console.error('Error fetching states:', error);
	}
}

async function fetchLocation(statesId) {
	if (!statesId) return populateSearchableDropdowns('location', []);
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
			populateSearchableDropdowns('location', responseData.cities);
		} else {
			console.error('Failed to fetch location: ', responseData.message);
		}
	} catch (error) {
		console.error('Error fetching location:', error);
	}
}