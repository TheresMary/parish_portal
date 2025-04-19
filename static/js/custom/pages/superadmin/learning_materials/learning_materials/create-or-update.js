"use strict";

const filetypeSelect = document.getElementById('learning-material-filetype');
const fileUpload = document.getElementById('learning-material-file-upload');
const youtubeVideo = document.getElementById('learning-material-youtube-video');
const textContent = document.getElementById('learning-material-text-content');
const embeddedLlink = document.getElementById('learning-material-embedded-link');

const sections = {
    'FILE': fileUpload,
    'AUDIO': fileUpload,
    'VIDEO': fileUpload,
    'URL': youtubeVideo,
    'TEXT': textContent,
    'EMBEDDED_LINK': embeddedLlink
};

const validExtensions = {
    'FILE': 'pdf, doc, docx, txt, xls, xlsx, ppt, pptx',
    'AUDIO': 'mp3, wav, ogg',
    'VIDEO': 'mp4, avi, mov, wmv, mkv, m4v',
};
const maxUploadSize = 5 * 1048576; // 5 MB
const urlRegex = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;
let fileValidationRequired = true;

function updateVisibility() {
    const selectedType = filetypeSelect.value;
    Object.values(sections).forEach(section => section.classList.add('hidden'));

    if (sections[selectedType]) {
        sections[selectedType].classList.remove('hidden');
    }
    if (validExtensions[selectedType]) {
        document.querySelector('#learning-material-file-upload #accepted-filetypes').textContent = `${validExtensions[selectedType]} upto ${maxUploadSize / 1048576} MB`;
    }
}

filetypeSelect.addEventListener('change', updateVisibility);
document.addEventListener('DOMContentLoaded', updateVisibility);

// File upload
const uploadContainer = document.getElementById('upload-container');
const browseFileButton = document.getElementById('browse-file-btn');
const fileInput = document.getElementById('learning-material-file-input');
const fileList = document.getElementById('learning-material-file-list');

//Prevent default drag behaviors
['dragenter', 'dragover'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'none';
    });
});

browseFileButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleAddFile(files);
});

uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
});

uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;    
    if (files.length > 0) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
        handleAddFile(files);
    }
});

function handleAddFile(files) {
    fileValidationRequired = true;
    var size    = (files[0].size / 1024 / 1024).toFixed(2)
    const icon  = getIconForFile(files[0].type);
    fileList.innerHTML = createFileElement(files[0].name,size,icon);
}

function handleRemoveFile() {
    fileInput.files = new DataTransfer().files;
    fileList.innerHTML = '';
}

function createFileElement(filename,filesize,icon) {
    return `
        <div class="h-[74px] w-full px-6 py-4 bg-slate-100 rounded border border-slate-200 justify-center items-center inline-flex">
            <div class="w-full flex justify-between items-center">
                <div class="flex justify-start items-center gap-4">
                    <img src="${assetsBaseUrl + icon}" alt="Document Icon">
                    <div class="flex-col justify-start items-start inline-flex">
                        <p class="text-zinc-950 text-sm font-semibold line-clamp-2">${filename}</p>
                        <p class="text-zinc-500 text-xs font-medium">${filesize} MB</p>
                    </div>
                </div>
                <img src="${assetsBaseUrl}delete_icon.svg" id="delete-icon" onclick="handleRemoveFile()" alt="Delete Icon" class="cursor-pointer">
            </div>
        </div>
    `;
}

function getIconForFile(fileType) { 
    if (fileType.startsWith('video/')) {
        return 'video_uploaded_icon.svg';
    } else if (fileType.startsWith('audio/')) {
        return 'audio_uploaded_icon.svg';
    } else {
        return 'document_uploaded_icon.svg';
    }
}

document.addEventListener('DOMContentLoaded', () => {    
    if (api_config.fileData) {
        var size    = api_config.fileSize
        var name    = api_config.fileName
        const newicon  = getIconForFile(api_config.content_type);
        fileList.innerHTML = createFileElement(name,size,newicon);
        fileValidationRequired = false;
    }
});

//Multi Select
const toggleSelectButton = document.getElementById("toggleSelectButton");
const selectDropdown = document.getElementById("selectDropdown");
const searchInput = document.getElementById("categorySearch");
const checkedCountContainer = document.getElementById("checkedCountContainer");
const checkedCountDisplay = document.getElementById("checkedCountDisplay");
const clearSelection = document.getElementById("clearSelection");
const selectedCategories = document.getElementById("selectedCategories");
const checkboxes = document.querySelectorAll(".category-checkbox");
let checkedCategoryIds; // Find selected category ids here

toggleSelectButton.onclick = (e) => {
    selectDropdown.classList.toggle("hidden");
    e.stopPropagation();
};

selectDropdown.onclick = (e) => {
    e.stopPropagation();
};

// Filter items based on search
searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const items = document.querySelectorAll("#categoryList label");
    
    items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.parentElement.style.display = text.includes(searchTerm) ? "block" : "none";
    });
});

// Function to count the number of checked checkboxes
function updateCheckedCount() {
    const checkedCheckboxes = [...checkboxes].filter(checkbox => checkbox.checked);
    checkedCategoryIds = [...checkboxes].filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    const checkedCount = checkedCheckboxes.length;

    if (checkedCount >= 2) {
        checkedCountContainer.classList.remove("hidden");
        checkedCountContainer.classList.add("inline-flex");
    }

    if (checkedCount > 0) {
        const selectedItems = checkedCheckboxes.map(checkbox => checkbox.parentElement.textContent.trim()).join(", ");
        selectedCategories.classList.remove("text-zinc-500");
        selectedCategories.classList.add("text-zinc-950");
        selectedCategories.textContent = checkedCount === checkboxes.length ? "All Selected" : selectedItems;
    } else {
        selectedCategories.textContent = "Select";
    }

    checkedCountDisplay.textContent = checkedCount;
    validator.revalidateField('category_name');
}

// Add event listeners to each checkbox to update the count on change
checkboxes.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
      updateCheckedCount();
  });
});

// Handle "clearSelection" click
clearSelection.addEventListener("click", () => {
    // Uncheck all checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset the selected categories text and hide checked count display
    selectedCategories.textContent = "Select";
    selectedCategories.classList.remove("text-zinc-950");
    selectedCategories.classList.add("text-zinc-500");
    checkedCountDisplay.textContent = "0";
    checkedCountContainer.classList.add("hidden");
});

// Close when clicking outside
document.onclick = (e) => {
    if (!selectDropdown.contains(e.target) && e.target !== toggleSelectButton) {
        selectDropdown.classList.add("hidden");
    }
};

// Close dropdown when select element is clicked
const selectElement = document.querySelector('select');
if (selectElement) {
    selectElement.addEventListener('focus', () => {
        selectDropdown.classList.add("hidden");
    });
}

var validator;
var MCSaveUser = function () {
    const handleSubmit = () => {

        // Get elements
        const form = document.getElementById('create-or-update-learning-material-form');
        const submitButton = document.getElementById('create-or-update-learning-material-submit');

        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    title: {
                        validators: {
                            notEmpty: {
                                message: 'This field is required'
                            },
                            stringLength: {
                                max: 100,
                                message: 'Title must not exceed 100 characters'
                            },
                            regexp: {
                                regexp: /^[a-zA-Z0-9\s]+$/,
                                message: 'Title can only consist of alphanumerical characters and space'
                            }
                        }
                    },
                    category_name: {
                        validators: {
                            callback: {
                                message: 'Please select at least one category',
                                callback: function () {
                                    const checkboxes = document.querySelectorAll('.category-checkbox');
                                    const selectedCategories = [];
                                    checkboxes.forEach(checkbox => {
                                        if (checkbox.checked) {
                                            selectedCategories.push(parseInt(checkbox.value, 10));
                                        }
                                    });
                                    return selectedCategories.length > 0;
                                }
                            }
                        }
                    },
                    file_type: createFieldRequiredValidator(),
                    file_input: {
                        validators: {
                            callback: {
                                message: 'The selected file is not valid',
                                callback: function (input) {  
                                    const fileType = filetypeSelect.value;

                                    // Valid when upload is not selected
                                    if (!(fileType in validExtensions) || !fileValidationRequired) return true;

                                    const file = input.element.files[0];   
                                    if (!file) {
                                        return {
                                            valid: false,
                                            message: 'Please select a file'
                                        }
                                    } 

                                    const validExtension = validExtensions[fileType].split(', ').some(ext => file.name.endsWith(ext)); 
                                    
                                    if (!validExtension) { 
                                        return { 
                                            valid: false, 
                                            message: `Please upload a ${validExtensions[fileType]} file` 
                                        }; 
                                    } 
                                        
                                    if (file.size > maxUploadSize) { 
                                        return { 
                                            valid: false, 
                                            message: `The file size must be less than ${maxUploadSize / 1048576} MB`
                                        };
                                    }

                                    return true; 
                                }
                            }
                        }
                    },
                    url: {
                        validators: {
                            callback: {
                                callback: function (input) {
                                    const fileType = filetypeSelect.value;
                                    if (fileType != 'URL') return true;
                                    
                                    if (input.element.value.length <= 0) {
                                        return {
                                            valid: false,
                                            message: 'This field is required'
                                        };
                                    } else if (urlRegex.test(input.element.value) === false) {
                                        return {
                                            valid: false,
                                            message: 'Please enter a valid URL'
                                        };
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    text_input: {
                        validators: {
                            callback: {
                                callback: function (input) {
                                    const fileType = filetypeSelect.value;
                                    if (fileType != 'TEXT') return true;

                                    if (input.element.value.length <= 0) {
                                        return {
                                            valid: false,
                                            message: 'This field is required'
                                        };
                                    } else if (input.element.value.length > 5000) {
                                        return {
                                            valid: false,
                                            message: 'Text content must not exceed 5000 characters'
                                        };
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    embedded_link_input: {
                        validators: {
                            callback: {
                                message: 'This field is required',
                                callback: function (input) {
                                    const fileType = filetypeSelect.value;
                                    if (fileType != 'EMBEDDED_LINK') return true;
                                    return input.element.value.length > 0;
                                }
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.validate_class',
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
                    
                    const checkboxes = document.querySelectorAll('.category-checkbox');

                    // Get the selected checkbox values
                    const selectedCategories = [];

                    checkboxes.forEach(checkbox => {
                        if (checkbox.checked) {
                            selectedCategories.push(parseInt(checkbox.value, 10));
                        }
                    });
                    const formData = new FormData();
                    var selectedStatus = document.getElementById('status').checked;
                    formData.append('learning_material_id', document.querySelector('[name="learning_material_id"]').value);
                    formData.append('title', document.querySelector('[name="title"]').value);
                    formData.append('description', document.querySelector('[name="description"]').value);
                    formData.append('category', JSON.stringify(selectedCategories));
                    formData.append('tags', document.querySelector('[name="tags"]').value);
                    formData.append('file_type', document.querySelector('[name="file_type"]').value);
                    formData.append('file_input', document.querySelector('[name="file_input"]').files[0]);
                    formData.append('url', document.querySelector('[name="url"]').value);
                    formData.append('text_input', document.querySelector('[name="text_input"]').value);
                    formData.append('embedded_link_input', document.querySelector('[name="embedded_link_input"]').value);
                    formData.append('status', selectedStatus);

                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;

                    if (status === 'Valid') {
                        const btn = document.getElementById('create-or-update-learning-material-submit');

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
                            const message = responseData?.message?.message ?? responseData?.message ?? "Please try again.";
                            Toast.showInfoToast(message);
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