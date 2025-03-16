"use strict";
let validator;

function deleteOption(element) {
    const optionWrapper = element.closest('.mcq_options');
    const optionContainer = optionWrapper.parentElement;
    if (optionContainer.childElementCount <= 2) {
        return Toast.showInfoToast('At least two options are required');
    }
    optionWrapper.remove();
    reOrderOptions();
}

function reOrderOptions() {
    const options = document.querySelectorAll('.mcq_options');
    options.forEach((option, index) => {
        const label = option.querySelector('label');
        label.textContent = `Option ${index + 1}`;
        const input = option.querySelector('input[type="text"]');
        input.placeholder = `Option ${index + 1}`;
    });
}

function deleteQuestion(element) {
    const questionContainer = element.closest('.question-wrapper');
    const questionIndex = questionContainer.id.split('_')[1];
    removeValidatorsForDeletedQuestion(questionIndex);
    questionContainer.remove();
    reOrderQuestions();
}

function reOrderQuestions() {
    const questions = document.querySelectorAll('.question-wrapper');
    questions.forEach((question, index) => {
        question.id = `question_${index + 1}`;
        const questionTitle = question.querySelector('h3');
        questionTitle.textContent = `Member ${index + 1}`;
    });
}

function getMCQOptions(question = null) {
    if (question && question.question_type !== 'MULTIPLE_CHOICE') return '';
    const optionsList = question?.values ? JSON.parse(question.values) : [];

    if (optionsList.length === 0) {
        optionsList.push({ id: '', value: '' }, { id: '', value: '' });
    }
    const options = optionsList.map((option, index) => {
        return `
        <div class="mcq_options fv-row">
            <input type="hidden" name="options_id" value="${option.id}">
            <label class="block text-gray-800 font-medium text-sm mb-1">Option ${index + 1}</label>
            <div class="flex items-center gap-2.5">
                <input type="text" id="options" value="${option.value}" name="options"
                class="w-full border-gray-300 border rounded px-3 py-2" placeholder="Option ${index + 1}">
                <svg class="w-5 h-5 text-gray-400 hover:text-red cursor-pointer" onclick="deleteOption(this)">
                    <use href="${api_config.delete_icon}"></use>
                </svg>
            </div>
        </div>
        `;
    });

    const multipleChoiceSection = `
    <div id="mcq" class="w-full mt-7">
        <div class="w-full grid grid-cols-2 gap-x-4 gap-y-6">
            ${options.join('')}
        </div>
        <button type="button" class="btn-blue-outlined mt-6" onclick="addOption(this)">
            Add Options
            <svg class="w-5 h-5 ml-2">
                <use href="${api_config.plus_icon}"></use>
            </svg>
        </button>
    </div>
    `;

    return multipleChoiceSection
}

function getRatingDiv(question = null) {
    if (question && question.question_type !== 'RATING_SCALE') return '';
    const { id, value } = question?.values ? JSON.parse(question.values)[0] : [];

    const ratingScaleSection = `
    <div id="rating" class="w-full mt-7 grid grid-cols-4 gap-11">
        <input type="hidden" value="${id ?? ''}" name="rating_id">
        <div>
            <label class="block text-gray-800 font-medium text-sm mb-1">Rating</label>
            <select id="rating_scale" name="rating_scale" class="w-full border-gray-300 border rounded px-3 py-2.5 bg-white">
                <option value="" disabled selected>Select</option>
                <option value="1" ${value === "1" ? "selected" : ""}>1</option>
                <option value="2" ${value === "2" ? "selected" : ""}>2</option>
                <option value="3" ${value === "3" ? "selected" : ""}>3</option>
                <option value="4" ${value === "4" ? "selected" : ""}>4</option>
                <option value="5" ${value === "5" ? "selected" : ""}>5</option>
            </select>
        </div>
        <div class="flex items-center gap-5 col-span-3">
            <div class="flex items-end gap-5 text-gray-800 text-xs">
                <p>Poor</p>
                <div class="flex gap-7 text-zinc-950 font-medium">
                    <label class="flex flex-col items-center gap-2">
                        1
                        <input type="radio" id="scale_1" name="rating" class="w-5 h-5">
                    </label>
                    <label class="flex flex-col items-center gap-2">
                        2
                        <input type="radio" id="scale_2" name="rating" class="w-5 h-5">
                    </label>
                    <label class="flex flex-col items-center gap-2">
                        3
                        <input type="radio" id="scale_3" name="rating" class="w-5 h-5">
                    </label>
                    <label class="flex flex-col items-center gap-2">
                        4
                        <input type="radio" id="scale_4" name="rating" class="w-5 h-5">
                    </label>
                    <label class="flex flex-col items-center gap-2">
                        5
                        <input type="radio" id="scale_5" name="rating" class="w-5 h-5">
                    </label>
                </div>
                <p>Excellent</p>
            </div>
        </div>
    </div>
    `;
    return ratingScaleSection
}

function changeQuestionType(element) {
    const selectedType = element.value;
    const questionWrapper = element.closest('.question-content-wrapper');

    const existingMcqContainer = questionWrapper.querySelector('#mcq');
    const existingRatingContainer = questionWrapper.querySelector('#rating');

    if (existingMcqContainer) {
        existingMcqContainer.remove();
    }

    if (existingRatingContainer) {
        existingRatingContainer.remove();
    }

    const tempDiv = document.createElement('div');

    switch (selectedType) {
        case 'MULTIPLE_CHOICE':
            tempDiv.innerHTML = getMCQOptions().trim();
            break;
        case 'RATING_SCALE':
            tempDiv.innerHTML = getRatingDiv().trim();
            break;
        default:
            tempDiv.innerHTML = '';
            break;
    }

    const newContainer = tempDiv.firstChild;
    if (newContainer) questionWrapper.appendChild(newContainer);
}

function addOption(button) {
    const optionContainer = button.previousElementSibling;

    const newOptionNumber = optionContainer.childElementCount + 1;

    const newOption = document.createElement('div');
    newOption.className = "mcq_options"
    newOption.innerHTML = `
        <input type="hidden" name="options_id" value="">
        <label class="block text
        -gray-800 font-medium text-sm mb-1">Option ${newOptionNumber}</label>
        <div class="flex items-center gap-2.5">
            <input type="text" id="options" value="" name="options"
            class="w-full border-gray-300 border rounded px-3 py-2" placeholder="Option ${newOptionNumber}">
            <svg class="w-5 h-5 text-gray-400 hover:text-red cursor-pointer" onclick="deleteOption(this)">
                <use href="${api_config.delete_icon}"></use>
            </svg>
        </div>
    `;
    optionContainer.appendChild(newOption);
}

function addValidatorsForNewQuestion(questionIndex) {
    validator.addField(`question_title_${questionIndex}`, createFieldRequiredValidator());
    validator.addField(`question_type_${questionIndex}`, createFieldRequiredValidator());
    validator.addField(`weightage_${questionIndex}`, {
        validators: {
            notEmpty: {
                message: 'This field is required'
            },
            numeric: {
                message: 'Weightage must be a number'
            },
            between: {
                min: 0,
                max: 2,
                message: 'Weightage must be between 0 and 2'
            }
        }
    });
}

function removeValidatorsForDeletedQuestion(questionIndex) {
    validator.removeField(`question_title_${questionIndex}`);
    validator.removeField(`question_type_${questionIndex}`);
    validator.removeField(`weightage_${questionIndex}`);
}

function addQuestion(button, question = null) {
    const questionContainer = button.parentElement;
    const newQuestionNumber = questionContainer.querySelectorAll('.question-wrapper').length + 1;

    const newQuestion = document.createElement('div');
    newQuestion.id = `question_${newQuestionNumber}`;
    newQuestion.className = "question-wrapper w-full mt-6 bg-gray-100 rounded-md overflow-hidden border border-slate-200"

    const multipleChoiceSection = question?.question_type === 'MULTIPLE_CHOICE' ? getMCQOptions(question) : '';
    const ratingScaleSection = question?.question_type === 'RATING_SCALE' ? getRatingDiv(question) : '';


    const questionContent = `
    <div class="w-full px-8 py-4 bg-white text-zinc-950 text-sm font-semibold flex items-center justify-between">
        <h3>Member ${newQuestionNumber}</h3>
        <svg class="w-5 h-5 text-gray-400 hover:text-red cursor-pointer" onclick="deleteQuestion(this)">
            <use href="${api_config.delete_icon}"></use>
        </svg>
    </div>
    <div class="question-content-wrapper w-full p-8">
        <div class="w-full grid grid-cols-6 gap-4">
            <input type="hidden" value="${question?.question_id || ''}" name="question_id">
            <div class="col-span-2 fv-row">
                <label class="block text-gray-800 font-medium text-sm mb-1">Name</label>
                <input type="text" id="question_title" value="${question?.title || ''}" name="question_title_${newQuestionNumber}" 
                    class="w-full border-gray-300 border rounded px-3 py-2" placeholder="Enter name">
            </div>
            <div class="col-span-1 fv-row">
            <label class="block text-gray-800 font-medium text-sm mb-1">Age</label>
            <input type="text" id="question_title" value="${question?.title || ''}" name="question_title_${newQuestionNumber}" 
                class="w-full border-gray-300 border rounded px-3 py-2" placeholder="Enter age">
            </div>
            <div class="col-span-1 fv-row">
                <label class="block text-gray-800 font-medium text-sm mb-1">Sex</label>
                <select id="question_type" name="question_type_${newQuestionNumber}" onchange="changeQuestionType(this)"
                    class="w-full border-gray-300 border rounded px-3 py-2.5 bg-white">
                    <option value="" disabled selected>Select</option>
                    <option value="male" ${question?.question_type === "MULTIPLE_CHOICE" ? "selected" : ""}>Male</option>
                    <option value="female" ${question?.question_type === "YES_NO" ? "selected" : ""}>Female</option>
                </select>
            </div>
            <div class="col-span-2 fv-row">
                <label class="block text-gray-800 font-medium text-sm mb-1">Qualification & Job</label>
                <input type="text" id="weightage" value="${question?.weightage || ''}" name="weightage_${newQuestionNumber}" 
                    class="w-full border-gray-300 border rounded px-3 py-2">
            </div>
            <div class="col-span-1 fv-row">
            <label class="block text-gray-800 font-medium text-sm mb-1">Relationship Status</label>
            <input type="text" id="question_title" value="${question?.title || ''}" name="question_title_${newQuestionNumber}" 
                class="w-full border-gray-300 border rounded px-3 py-2" placeholder="Enter age">
            </div>
            <div class="col-span-1 fv-row">
                <label for="birthday" class="block text-gray-800 font-medium text-sm mb-1">Date of Birth</label>
                <input type="date" class="w-full border-gray-300 border rounded px-3 py-2" name="birthday">
            </div>
            <div class="col-span-1 fv-row">
                <label for="birthday" class="block text-gray-800 font-medium text-sm mb-1">Date of Baptism</label>
                <input type="date" class="w-full border-gray-300 border rounded px-3 py-2" name="birthday">
            </div>
            <div class="col-span-1 fv-row">
                <label for="birthday" class="block text-gray-800 font-medium text-sm mb-1">Date of F H C</label>
                <input type="date" class="w-full border-gray-300 border rounded px-3 py-2 placeholder-gray-400 focus:placeholder-gray-600" name="birthday">
            </div>
            <div class="col-span-1 fv-row">
                <label for="birthday" class="block text-gray-800 font-medium text-sm mb-1">Date of Confirmation</label>
                <input type="date" class="w-full border-gray-300 border rounded px-3 py-2" name="birthday">
            </div>
            <div class="col-span-1 fv-row">
                <label for="birthday" class="block text-gray-800 font-medium text-sm mb-1">Date of Marriage</label>
                <input type="date" class="w-full border-gray-300 border rounded px-3 py-2" name="birthday">
            </div>
            <div class="col-span-3 fv-row">
                <label for="description" class="block text-gray-800 font-normal text-sm mb-1">Remarks</label>
                <textarea id="description" rows="4" name="Enter remarks" class="w-full border-gray-300 border rounded px-3 py-2"
                    placeholder="Enter remarks"></textarea>
            </div>
        </div>
        ${multipleChoiceSection}
        ${ratingScaleSection}
    </div>
    `;

    newQuestion.innerHTML = questionContent;
    questionContainer.insertBefore(newQuestion, button);
    addValidatorsForNewQuestion(newQuestionNumber);
}

// Class definition
let MCSaveUser = function () {
    const handleSubmit = () => {

        const form = document.getElementById('create-or-update-checklist-form');
        const submitButton = document.getElementById('create-or-update-checklist-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    checklist_name: createFieldRequiredValidatorWithMaxLength(100),
                    observation: createFieldRequiredValidator(),
                    description: {
                        validators: {
                            stringLength: {
                                max: 500,
                                message: 'Description must be less than 500 characters'
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

        submitButton.addEventListener('click', async e => {
            e.preventDefault();
            if (validator) {
                try {
                    const status = await validator.validate();

                    const formData = new FormData();
                    let selectedStatus = document.getElementById('status').checked;
                    formData.append('checklist_id', document.querySelector('[name="checklist_id"]').value);
                    formData.append('checklist_name', document.querySelector('[name="checklist_name"]').value);
                    formData.append('observation', document.querySelector('[name="observation"]').value);
                    formData.append('description', document.querySelector('[name="description"]').value);
                    formData.append('status', selectedStatus);

                    const questionsIdList = [];
                    const checklistQuestions = [];

                    const questions = document.querySelectorAll('.question-wrapper');
                    if (questions.length === 0) return Toast.showInfoToast('At least one question is required');

                    questions.forEach((container) => {
                        const question = {}

                        const question_id = container.querySelector('[name="question_id"]')
                        question['question_id'] = question_id.value || '';

                        if (question_id != null && question_id !== '' && question_id !== 'undefined') {
                            if (question_id.value != null && question_id.value !== '' && question_id.value !== 'undefined') {
                                questionsIdList.push(question_id.value)
                            }
                        }

                        const question_title = container.querySelector('#question_title');
                        if (question_title) {
                            question['question_title'] = question_title.value;
                        }

                        const question_type = container.querySelector('#question_type').value;
                        if (question_type) {
                            question['question_type'] = question_type;
                        }

                        const weightage = container.querySelector('#weightage');
                        if (weightage) {
                            question['weightage'] = weightage.value;
                        }

                        const rating_scale = container.querySelector('#rating_scale');
                        if (rating_scale) {
                            question['rating_scale'] = rating_scale.value;
                        }

                        const rating_id = container.querySelector('[name="rating_id"]');

                        question['rating_id'] = rating_id?.value ?? '';

                        const mcqOptionsList = [];
                        const optionsIdsList = [];

                        container.querySelectorAll('.mcq_options').forEach((options) => {
                            const options_dict = {}
                            const mcq_options = options.querySelector('#options');
                            const options_id = options.querySelector('[name="options_id"]');
                            options_dict['id'] = options_id?.value ?? '';

                            if (options_id != null && options_id !== '' && options_id !== 'undefined') {
                                if (options_id.value != null && options_id.value !== '' && options_id.value !== 'undefined') {
                                    optionsIdsList.push(options_id.value)
                                }
                            }

                            if (mcq_options) {
                                options_dict['options'] = mcq_options.value
                                mcqOptionsList.push(options_dict);
                            }
                        })
                        question['options_list'] = mcqOptionsList;

                        question['options_ids'] = []

                        if (question_type === "RATING_SCALE") {
                            if (rating_id != null && rating_id !== '' && rating_id !== 'undefined') {
                                if (rating_id.value != null && rating_id.value !== '' && rating_id.value !== 'undefined') {
                                    question['options_ids'] = [rating_id.value];
                                }
                            }
                        }
                        else if (question_type === "MULTIPLE_CHOICE") {
                            question['options_ids'] = optionsIdsList;
                        }

                        checklistQuestions.push(question)
                    });

                    formData.append('checklist_questions', JSON.stringify(checklistQuestions));
                    formData.append('questions_ids', JSON.stringify(questionsIdList));

                    // submitButton.setAttribute('data-kt-indicator', 'on');
                    // submitButton.disabled = true;

                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-checklist-submit');

                        // btn.style.display = 'none';
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

function LoadScreenCustomisation() {
    const addQuestionButton = document.getElementById('add-question')
    const checklistQuestions = api_config.checklist_questions

    if (checklistQuestions && checklistQuestions.length > 0) {
        checklistQuestions.forEach(question => {
            addQuestion(addQuestionButton, question)
        })
    }
    else {
        addQuestion(addQuestionButton)
    }
}

KTUtil.onDOMContentLoaded(function () {
    MCSaveUser.init();
    LoadScreenCustomisation()

    createSearchableSelect('observation');
});
