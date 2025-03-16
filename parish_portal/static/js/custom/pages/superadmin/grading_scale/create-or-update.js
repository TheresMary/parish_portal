"use strict";

// Class definition
var MCSaveUser = (function () {
  var validator;
  const handleSubmit = () => {
    // Get elements

    const form = document.getElementById("create-or-update-grading-scale-form");
    const submitButton = document.getElementById("create-or-update-gradingscale-submit");

    validator = FormValidation.formValidation(
      form,
      {
          fields: {
              'grading_scale_name': createFieldRequiredValidator(),
              'grading': createFieldRequiredValidator(),
              'to_limit': {
                validators: {
                  callback: {
                    message: 'This field is required when Auto Generate Levels is selected',
                    callback: function(input) {
                      const gradingType = form.querySelector('input[name="grading"]:checked').value;
                      if (gradingType === 'Auto_Generate_Levels') {
                        return input.value.trim() !== '';
                      }
                      return true;
                    }
                  }
                }
              },
              'from_limit': {
                validators: {
                  callback: {
                    message: 'This field is required when Auto Generate Levels is selected',
                    callback: function(input) {
                      const gradingType = form.querySelector('input[name="grading"]:checked').value;
                      if (gradingType === 'Auto_Generate_Levels') {
                        return input.value.trim() !== '';
                      }
                      return true;
                    }
                  }
                }
              },
              'numer_of_custom_grading_scale': {
                validators: {
                  callback: {
                    message: 'This field is required when Define Custom Levels is selected',
                    callback: function(input) {
                      const gradingType = form.querySelector('input[name="grading"]:checked').value;
                      if (gradingType === 'Define_Custom_Levels') {
                        return input.value.trim() !== '';
                      }
                      return true;
                    }
                  }
                }
              },
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

    submitButton.addEventListener("click", async (e) => {
      addValidationForCustomLevels(validator)

      e.preventDefault();
      // Validate form before submit
      if (validator) {
        try {
          const status = await validator.validate();

          const formData        = new FormData();
          var selectedStatus    = document.getElementById("status").checked;
          const selectedGrading = document.querySelector('input[name="grading"]:checked');

          formData.append("gradingscale_id",document.querySelector('[name="grading_scale_id"]').value);
          formData.append("name",document.querySelector('[name="grading_scale_name"]').value);
          formData.append("description",document.querySelector('[name="description"]').value);
          formData.append("grading_type", selectedGrading.value);
          formData.append("from_limit",document.querySelector('[name="from_limit"]').value);
          formData.append("to_limit",document.querySelector('[name="to_limit"]').value);
          formData.append("numer_of_custom_grading_scale",document.querySelector('[name="numer_of_custom_grading_scale"]').value);

          const gradingLevels = [];

          if (selectedGrading.value=="Auto_Generate_Levels"){
            document.querySelectorAll('#range-list li').forEach((input) => {
              if (input.textContent.trim() !== "") {
                gradingLevels.push(input.textContent.trim());  // Add non-empty values to the array
              }
            });
          }
          else if (selectedGrading.value=="Define_Custom_Levels"){
            document.querySelectorAll('input[name="custom_levels"]').forEach((input) => {
              if (input.value.trim() !== "") {
                  gradingLevels.push(input.value.trim());  // Add non-empty values to the array
              }
          });
          }

          gradingLevels.forEach((level) => {
            formData.append("grading_levels", level);  // Append each item individually as a list item
          });


          formData.append("status", selectedStatus);

          submitButton.setAttribute("data-kt-indicator", "on");
          submitButton.disabled = true;

          if (status === "Valid") {
            const btn = document.getElementById("create-or-update-gradingscale-submit");

            btn.style.display = "none";

            const response = await fetch(api_config.create_or_update_from, {
              method: "POST",
              headers: {
                "X-CSRFToken": api_config.csrfmiddlewaretoken,
              },
              body: formData,
            });

            const responseData = await response.json(); // Read the response body as JSON

            if (responseData.status === 200) {
              const redirectUrl = form.getAttribute("data-redirect-url");
              if (redirectUrl) {
                location.href = redirectUrl;
              }
            } else {
              // Handle other cases if needed
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
});


//Grading scale selection
function showGradingScale(GradingScaleId) {
  // Hide both content divs
  document.getElementById("autoGrading")?.classList.add("hidden");
  document.getElementById("customGrading")?.classList.add("hidden");
  document.getElementById(GradingScaleId)?.classList.remove("hidden");
  document.getElementById("show-grading-levels")?.classList.add("hidden");
}

function checkLimitsFilled() {
  const fromLimit = document.getElementById("from-limit").value.trim();
  const toLimit = document.getElementById("to-limit").value.trim();
  const rangeList = document.getElementById("range-list");
  
  const errorContainer = document.getElementById("autoGradingLevelErrorContainer");
  errorContainer.innerHTML = "";
  rangeList.innerHTML = "";



  if (fromLimit && toLimit) {
    let output = "";

    if (checkLetters(fromLimit, toLimit)) {
      output = handleLetterRange(fromLimit, toLimit, rangeList);
    } else if (checkNumbers(fromLimit, toLimit)) {
      output = handleNumberRange(fromLimit, toLimit, rangeList);
    } else {
      output = "Please enter either letters (A-Z) or numbers (1-9) for limits.";
    }

    toggleRangeLevels(true);
    if (output) {
      displayError(output, errorContainer);
    }
  } else {
    toggleRangeLevels(false);
  }
}

function checkLetters(from, to) {
  return /^[A-Za-z]$/.test(from) && /^[A-Za-z]$/.test(to);
}

function checkNumbers(from, to) {
  return !isNaN(from) && !isNaN(to) && parseInt(from, 10) >= 0 && parseInt(to, 10) >= 0;;
}

function handleLetterRange(fromLimit, toLimit, rangeList) {
  const start = fromLimit.toUpperCase().charCodeAt(0);
  const end = toLimit.toUpperCase().charCodeAt(0);

  if (start <= end) {
    for (let i = start; i <= end; i++) {
      addListItemClass(String.fromCharCode(i), rangeList);
    }
    return ""; // No error message
  } else {
    return '"From" limit should be less than or equal to "To" limit.';
  }
}

function handleNumberRange(fromLimit, toLimit, rangeList) {
  const start = parseInt(fromLimit, 10);
  const end = parseInt(toLimit, 10);

  if (end - start > 9 ) {
    return "The range should not exceed 10 levels.";
  }
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      addListItemClass(i, rangeList);
    }
    return ""; // No error message
  } else {
    return '"From" limit should be less than or equal to "To" limit.';
  }
}

function addListItemClass(content, rangeList) {
  const listItem = document.createElement("li");
  listItem.classList.add(
    "w-full",
    "h-[45px]",
    "p-2",
    "bg-white",
    "rounded-md",
    "border",
    "border-slate-200",
    "text-slate-950",
    "text-xs",
    "font-normal"
  );
  listItem.textContent = content;
  rangeList.appendChild(listItem);
}

function toggleRangeLevels(show) {
  const rangeLevels = document.getElementById("range-levels");
  if (show) {
    rangeLevels.classList.remove("hidden");
  } else {
    rangeLevels.classList.add("hidden");
  }
}

function displayError(message, errorContainer) {
  errorContainer.innerHTML = message;
}

function loadCustomValues(gradingLevelsInput, gradingLevelInputsContainer) {
  function updateCustomInputs() {
    const errorContainer = document.getElementById("customGradingLevelErrorContainer");

    // Clear previous errors and inputs
    errorContainer.innerHTML = '';
    gradingLevelInputsContainer.innerHTML = '';

    const inputValue = gradingLevelsInput.value.trim();

    if (!inputValue) {
      return ;
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

    // Create and append the label
    const label = document.createElement('label');
    label.classList.add('text-gray-800', 'font-normal', 'text-sm', 'mb-2');
    label.textContent = 'Enter Names for Custom Levels:';
    gradingLevelInputsContainer.appendChild(label);

    // Create and append input fields
    for (let i = 0; i < numberOfLevels; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.classList.add('border', 'border-gray-300', 'rounded', 'px-3', 'py-2', 'w-full', 'mt-2');
      input.placeholder = `Custom Level ${i + 1}`;
      input.name = 'custom_levels';
      input.value = api_config.customvalues?.[i] || '';

      gradingLevelInputsContainer.appendChild(input);
    }
  }

  gradingLevelsInput?.addEventListener('input', updateCustomInputs);

  // Initial call to populate inputs on page load if editing.
  updateCustomInputs();
}


function addValidationForCustomLevels(validator) {
  const customLevelsInputs = document.querySelectorAll('input[name="custom_levels"]');
  customLevelsInputs.forEach((input, index) => {
    // Add a unique name for each custom level field to avoid duplication
    const fieldName = `custom_levels_${index}`;
    input.setAttribute('data-field-name', fieldName);

    // Add dynamic field to the validator
    validator.addField(fieldName, {
      validators: {
        notEmpty: {
          message: 'This field is required'
      },
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const gradingLevelsInput = document.getElementById('grading-levels');
  const gradingLevelInputsContainer = document.getElementById('gradingLevelInputs');

  loadCustomValues(gradingLevelsInput, gradingLevelInputsContainer);
  if (api_config.grading_type == "Auto_Generate_Levels") {
    document.getElementById("auto-grading-content").checked = true;
    showGradingScale('autoGrading');
  } 
  else if (api_config.grading_type == "Define_Custom_Levels") {
    document.getElementById("custom-grading-content").checked = true;
    showGradingScale('customGrading');
  }

});