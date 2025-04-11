"use strict";

// Class definition
var MCSaveUser = (function () {
  var validator;

  const handleSubmit = () => {
    const form = document.getElementById("create-or-update-difficulty-level-form");
    const submitButton = document.getElementById("create-or-update-difficulty-level-submit");

    validator = FormValidation.formValidation(
      form,
      {
        fields: {
          'difficulty_level_name': createFieldRequiredValidator(),
          'organization': createFieldRequiredValidator(),
          'number_of_levels': createFieldRequiredValidator(),
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap: new FormValidation.plugins.Bootstrap5({
            rowSelector: '.validate-class',
            eleInvalidClass: '',
            eleValidClass: ''
          })
        },
        errorContainer: function(field, validator) {
          const errorContainer = field.element.closest('.mb-4').querySelector('.validation-error');
          return errorContainer;
        }
      }
    );

    submitButton.addEventListener("click", async (e) => {
      addValidationForDifficultyLevelDiscriptions(validator);

      e.preventDefault();
      // Validate form before submit
      if (validator) {
        try {
          const status = await validator.validate();

          const formData = new FormData();
          var selectedStatus = document.getElementById("status").checked;

          let difficultyLevels = [];
          
          formData.append("difficulty_level_id", document.querySelector('[name="difficulty_level_id"]').value);
          formData.append("name", document.querySelector('[name="difficulty_level_name"]').value);
          formData.append("organization", document.querySelector('[name="organization"]').value);
          formData.append("number_of_levels", document.querySelector('[name="number_of_levels"]').value);

          document.querySelectorAll('textarea[name="difficulty_levels"]').forEach((input) => {
            if (input.value.trim() !== "") {
              difficultyLevels.push(input.value.trim());
            }
          })

          difficultyLevels.forEach((level) => {
            formData.append("difficulty_levels_description", level);
          })
          
          formData.append("status", selectedStatus);

          submitButton.setAttribute("data-kt-indicator", "on");
          submitButton.disabled = true;

          if (status === "Valid") {
            const btn = document.getElementById("create-or-update-difficulty-level-submit");
            btn.style.display = "none";

            const response = await fetch(api_config.create_or_update_from, {
              method: "POST",
              headers: {
                "X-CSRFToken": api_config.csrfmiddlewaretoken,
              },
              body: formData,
            });

            const responseData = await response.json();

            if (responseData.status === 200) {
              const redirectUrl = form.getAttribute("data-redirect-url");
              if (redirectUrl) {
                location.href = redirectUrl;
              }
            } else {
              submitButton.removeAttribute("data-kt-indicator");
              btn.style.display = "inline-block";
              submitButton.disabled = false;
              const message = responseData?.message?.message ?? responseData?.message ?? "Please try again.";
              Toast.showInfoToast(message);
            }
          } else {
            submitButton.removeAttribute("data-kt-indicator");
            submitButton.disabled = false;
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  return {
    init: function () {
      handleSubmit();
    },
  };
})();

// On document ready
KTUtil.onDOMContentLoaded(function () {
  MCSaveUser.init();
  createSearchableSelect('organization');
});

function displayError(message, errorContainer) {
  errorContainer.innerHTML = message;
}

function loadDifficultyLevelDiscriptions(difficultyLevelsInput, difficultyLevelInputsContainer) {
  function updateDescriptionInputs() {
    const errorContainer = document.getElementById("difficulty-level-error-container");
    
    // Clear previous errors and inputs
    if (errorContainer) {
      errorContainer.innerHTML = '';
      difficultyLevelInputsContainer.innerHTML = '';
    }
    
    const inputValue = difficultyLevelsInput.value.trim();

    if (!inputValue) {
      return;
    }

    // Validate the input
    if (inputValue && isNaN(inputValue)) {
      return displayError("Please enter numbers (1-9) for levels.", errorContainer);
    }

    const numberOfLevels = parseInt(inputValue, 10);

    if (numberOfLevels > 10) {
      return displayError("The range should not exceed 10 levels.", errorContainer);
    }

    if (numberOfLevels <= 0) {
      return displayError("The range should be greater than 0.", errorContainer); 
    }

    // Create and append input fields with individual labels and error containers
    for (let i = 0; i < numberOfLevels; i++) {
      const container = document.createElement('div');
      container.classList.add('mb-4'); // Add spacing between each level's input

      const label = document.createElement('label');
      label.classList.add('text-gray-800', 'font-normal', 'text-sm', 'mb-2', 'block');
      label.textContent = `Description for Level ${i + 1}`;
      label.setAttribute('for', `difficulty_level_${i}`);
      
      const textarea = document.createElement('textarea');
      textarea.name = `difficulty_levels`;
      textarea.rows = 3;
      textarea.classList.add('border', 'border-gray-300', 'rounded', 'px-3', 'py-2', 'w-full', 'mt-1');
      textarea.placeholder = `Enter Description for Level ${i + 1}`;
      textarea.value = api_config.level_descriptions?.[i] || '';

      // Create error container for each level
      const errorContainer = document.createElement('div');
      errorContainer.classList.add('text-danger', 'mt-1', 'validation-error'); // Styling for the error message
      errorContainer.setAttribute('id', `error_level_${i}`); // Unique ID for each error container

      // Append the error container and textarea to the level container
      container.appendChild(label);
      container.appendChild(textarea);
      container.appendChild(errorContainer); // Add the error container here
      difficultyLevelInputsContainer.appendChild(container);
    }
  }

  difficultyLevelsInput?.addEventListener('input', updateDescriptionInputs);
  updateDescriptionInputs();
}

function addValidationForDifficultyLevelDiscriptions(validator) {
  const descriptionInputs = document.querySelectorAll('textarea[name^="difficulty_levels_description"]');
  descriptionInputs.forEach((textarea, index) => {
    const fieldName = `difficulty_levels_description_${index}`; // Unique field name for each textarea
    textarea.setAttribute('data-field-name', fieldName);

    // Add dynamic field to the validator
    validator.addField(fieldName, {
      validators: {
        notEmpty: {
          message: 'This field is required' // Error message when the field is empty
        },
      }
    });

    // Modify error display to be under the specific textarea
    const errorContainer = document.getElementById(`error_level_${index}`);
    textarea.addEventListener('input', () => {
      // Remove error message when the user starts typing
      if (errorContainer) {
        errorContainer.innerHTML = ''; // Clear the error message on input
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const difficultyLevelsInput = document.getElementById('difficulty-levels');
  const difficultyLevelInputsContainer = document.getElementById('difficulty-level-inputs');
  loadDifficultyLevelDiscriptions(difficultyLevelsInput, difficultyLevelInputsContainer);
});
