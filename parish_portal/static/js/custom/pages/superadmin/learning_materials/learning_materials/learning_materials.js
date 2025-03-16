class PaginationHandler {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentPage = 1;
        this.totalPages = 1;
        this.isInitialized = false;
    }

    initialize(totalPages, currentPage = 1) {
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        
        if (!this.isInitialized) {
            this.attachEventListeners();
            this.isInitialized = true;
        }
        
        this.render();
    }

    getPageRange() {
        const range = [];
        const rangeSize = 2;

        let start = Math.max(this.currentPage - rangeSize, 1);
        let end = Math.min(this.currentPage + rangeSize, this.totalPages);

        if (this.currentPage <= rangeSize) {
            end = Math.min(1 + (rangeSize * 2), this.totalPages);
        }
        if (this.currentPage > this.totalPages - rangeSize) {
            start = Math.max(this.totalPages - (rangeSize * 2), 1);
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        return range;
    }

    render() {
        const pageRange = this.getPageRange();

        let html = `
        
            <div class="pagination transition-width duration-300 lg:ml-[280px] right-0 w-full lg:w-pagination fixed bottom-0 left-0 text-center bg-white px-[72] py-4 z-10 justify-between">
                <!-- Previous Button -->
                <button 
                    class="page-link flex py-2 px-3 rounded border border-zinc-200 self-center text-black text-xs ${this.currentPage === 1 ? 'cursor-not-allowed text-gray-300' : ''}"
                    ${this.currentPage === 1 ? 'disabled' : ''}
                    data-page="${this.currentPage - 1}">
                    <img src="${api_config.left_arrow}" alt="Left Arrow" class="mr-2">
                    Previous
                </button>

                <!-- Page Links -->
                <div class="text-center text-[#475466] text-sm font-medium">`;

        if (this.totalPages > 1) {
            // First page
            html += this.renderPageButton(1);

            // Leading ellipsis
            if (pageRange[0] > 2) {
                html += '<span class="page-link inline-flex items-center justify-center w-10 h-10">...</span>';
            }

            // Page range
            pageRange.forEach(page => {
                if (page !== 1 && page !== this.totalPages) {
                    html += this.renderPageButton(page);
                }
            });

            // Trailing ellipsis
            if (pageRange[pageRange.length - 1] < this.totalPages - 1) {
                html += '<span class="page-link inline-flex items-center justify-center w-10 h-10">...</span>';
            }

            // Last page
            html += this.renderPageButton(this.totalPages);
        } else {
            // Single page
            html += this.renderPageButton(1);
        }

        html += `</div>
                <!-- Next Button -->
                <button 
                    class="page-link flex py-2 px-3 rounded border border-zinc-200 self-center text-black text-xs ${this.currentPage === this.totalPages ? 'cursor-not-allowed text-gray-300' : ''}"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}
                    data-page="${this.currentPage + 1}">
                    Next
                    <img src="${api_config.right_arrow}" alt="Right Arrow" class="ml-2">
                </button>
            </div>`;

        this.container.innerHTML = html;
    }

    renderPageButton(page) {
        const isActive = page === this.currentPage;
        return `
            <button 
                class="page-link inline-flex items-center justify-center w-10 h-10 hover:bg-gray-200 hover:text-black
                    ${isActive ? 'bg-[#f8f9fb] text-gray-800' : ''}"
                data-page="${page}">
                ${page}
            </button>`;
    }

    attachEventListeners() {
        // Single event listener for all pagination clicks
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button || button.disabled) return;

            const page = parseInt(button.dataset.page);
            if (!isNaN(page) && page !== this.currentPage) {
                sendFilterData(page);
            }
        });
    }
}

function updateLearningMaterials(materials) {
    const container = document.querySelector('.card-container');
    container.innerHTML = '';
    
    materials.forEach((material) => {
        const card = document.createElement('div');
        card.className = "card relative flex flex-col max-h-80 border-2 border-zinc-200 rounded-lg";
        let view_profile = api_config.view_profile.replace('0', material.encrypt_id.toString());
        
        const cardContent = `
            <a href="${view_profile}">
                ${renderMaterialContent(material)}
            </a>
            ${createSettingsButton(material)}
            <a href="${view_profile}">
                <div class="px-4 pt-4 pb-8">
                    <div class="py-1 px-4 bg-blue-50 rounded-3xl inline-flex mb-4">
                        <p class="text-blue-500 text-xs font-medium capitalize">${material.tags || ''}</p>
                    </div>
                    <h3 class="line-clamp-2 text-zinc-950 text-base font-medium mb-6">${material.title || ''}</h3>
                    <div class="flex mt-2">
                        ${renderFileTypeIcon(material.file_type)}
                        <p class="text-sm lowercase first-letter:uppercase"">${material.file_type}</p>
                    </div>
                </div>
            </a>
        `;
        
        card.innerHTML = cardContent;
        container.appendChild(card);
        
        // Add click event listener to the settings button after appending
        const settingsButton = card.querySelector('.settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdownMenu(card, material);
            });
        }
    });
}

function renderMaterialContent(material) {
    switch(material.file_type) {
        case 'TEXT':
            return `<p class="w-full max-w-full grow object-cover min-h-40 text-sm bg-white p-4 text-zinc-700 line-clamp-6 rounded-lg">${material.content_text}</p>`;
        case 'FILE':
            return material.content_extension === 'pdf' 
                ? `<embed src="${material.content_file}" type="application/pdf" class="w-full h-40 border rounded-t-lg">`
                : `<div class="w-full max-w-full grow object-cover bg-[#eef1fa] h-40 border rounded-t-lg flex items-center justify-center">
                    <img src="${api_config.file_preview_icon}" alt="Thumbnail">
                   </div>`;
        case 'AUDIO':
            return `<audio controls class="w-full bg-gray-100 border-2 h-40 rounded-t-lg p-2 outline-none">
                        <source src="${material.content_file}" type="audio/mp3">
                    </audio>`;
        case 'VIDEO':
            return material.content_extension === 'avi' || material.content_extension === 'wmv'
                ? `<div class="w-full max-w-full grow object-cover bg-[#eef1fa] h-40 border rounded-t-lg flex items-center justify-center">
                    <img src="${api_config.video_preview_icon}" alt="Thumbnail">
                   </div>`
                : `<video controls class="w-full max-w-full grow object-cover h-40 border rounded-t-lg">
                    <source src="${material.content_file}" type="video/mp4">
                   </video>`;
        case 'URL':
            return `<div class="w-full max-w-full grow object-cover bg-[#eef1fa] h-40 border rounded-t-lg flex items-center justify-center">
                        <img src="${api_config.url_preview_icon}" alt="Thumbnail">
                    </div>`;
        case 'EMBEDDED_LINK':
            return `<div class="w-full max-w-full grow object-cover bg-[#eef1fa] h-40 border rounded-t-lg flex items-center justify-center">
                        <img src="${api_config.embedded_preview_icon}" alt="Thumbnail">
                    </div>`;
        default:
            return '';
    }
}

function createSettingsButton(material) {
    let edit_url = api_config.edit_url.replace('0', material.encrypt_id.toString());

    return `
        <div class="absolute top-3 right-3">
            <button class="settings-button flex items-center gap-x-2 text-white px-2 py-1.5 rounded-full shadow-lg hover:bg-gray-200" 
                    style="background-color: rgba(0, 0, 0, 0.4);">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M6.96913 0.875C6.31683 0.875 5.75924 1.34714 5.65171 1.99089L5.58691 2.38185C5.56895 2.47998 5.52547 2.57166 5.46084 2.64766C5.39621 2.72367 5.31271 2.78132 5.21874 2.81482C5.10368 2.85786 4.99014 2.90489 4.87835 2.95582C4.78819 2.99868 4.68832 3.01704 4.58881 3.00904C4.4893 3.00104 4.39365 2.96696 4.3115 2.91024L3.98891 2.67952C3.73168 2.49574 3.4176 2.4092 3.10255 2.43528C2.7875 2.46136 2.49193 2.59837 2.26842 2.82194L2.09538 2.99499C1.87181 3.21849 1.73479 3.51406 1.70871 3.82911C1.68263 4.14416 1.76918 4.45825 1.95295 4.71547L2.18368 5.03806C2.2404 5.12022 2.27447 5.21586 2.28247 5.31537C2.29047 5.41488 2.27212 5.51475 2.22926 5.60491C2.17833 5.71671 2.1313 5.83024 2.08826 5.9453C2.05476 6.03928 1.99711 6.12277 1.9211 6.1874C1.8451 6.25203 1.75342 6.29551 1.65529 6.31347L1.26362 6.37899C0.952008 6.43105 0.668952 6.59192 0.464768 6.83301C0.260583 7.07409 0.148499 7.37977 0.148438 7.6957V7.94067C0.148438 8.59297 0.620574 9.15056 1.26433 9.25809L1.65529 9.32289C1.85539 9.35636 2.01704 9.50093 2.08826 9.69106C2.13098 9.80643 2.1787 9.91965 2.22926 10.0315C2.27212 10.1216 2.29047 10.2215 2.28247 10.321C2.27447 10.4205 2.2404 10.5161 2.18368 10.5983L1.95295 10.9209C1.76918 11.1781 1.68263 11.4922 1.70871 11.8073C1.73479 12.1223 1.87181 12.4179 2.09538 12.6414L2.26842 12.8144C2.72988 13.2759 3.45766 13.3364 3.98891 12.9568L4.3115 12.7261C4.39365 12.6694 4.4893 12.6353 4.58881 12.6273C4.68832 12.6193 4.78819 12.6377 4.87835 12.6805C4.99015 12.7311 5.10338 12.7781 5.21874 12.8215C5.40888 12.8928 5.55344 13.0544 5.58691 13.2545L5.65242 13.6462C5.75924 14.2892 6.31612 14.7614 6.96913 14.7614H7.2141C7.86641 14.7614 8.424 14.2892 8.53153 13.6455L8.59633 13.2545C8.61429 13.1564 8.65777 13.0647 8.7224 12.9887C8.78703 12.9127 8.87053 12.855 8.9645 12.8215C9.07955 12.7785 9.19308 12.7314 9.30489 12.6805C9.39505 12.6377 9.49492 12.6193 9.59443 12.6273C9.69394 12.6353 9.78959 12.6694 9.87174 12.7261L10.1943 12.9568C10.4516 13.1406 10.7656 13.2272 11.0807 13.2011C11.3957 13.175 11.6913 13.038 11.9148 12.8144L12.0879 12.6414C12.5493 12.1799 12.6098 11.4521 12.2303 10.9209L11.9996 10.5983C11.9428 10.5161 11.9088 10.4205 11.9008 10.321C11.8928 10.2215 11.9111 10.1216 11.954 10.0315C12.0045 9.91965 12.0515 9.80643 12.095 9.69106C12.1662 9.50093 12.3278 9.35636 12.528 9.32289L12.9196 9.25809C13.2314 9.20601 13.5145 9.04503 13.7187 8.8038C13.9229 8.56257 14.0349 8.25672 14.0348 7.94067V7.6957C14.0348 7.04339 13.5627 6.4858 12.9189 6.37827L12.528 6.31347C12.4298 6.29551 12.3381 6.25203 12.2621 6.1874C12.1861 6.12277 12.1285 6.03928 12.095 5.9453C12.0519 5.83025 12.0049 5.71672 11.954 5.60491C11.9111 5.51475 11.8928 5.41488 11.9008 5.31537C11.9088 5.21586 11.9428 5.12022 11.9996 5.03806L12.2303 4.71547C12.4141 4.45825 12.5006 4.14416 12.4745 3.82911C12.4484 3.51406 12.3114 3.21849 12.0879 2.99499L11.9148 2.82194C11.6913 2.59837 11.3957 2.46136 11.0807 2.43528C10.7656 2.4092 10.4516 2.49574 10.1943 2.67952L9.87174 2.91024C9.78959 2.96696 9.69394 3.00104 9.59443 3.00904C9.49492 3.01704 9.39505 2.99868 9.30489 2.95582C9.19309 2.9049 9.07956 2.85787 8.9645 2.81482C8.87053 2.78132 8.78703 2.72367 8.7224 2.64766C8.65777 2.57166 8.61429 2.47998 8.59633 2.38185L8.53153 1.99018C8.47944 1.67845 8.31847 1.3953 8.07724 1.1911C7.836 0.986901 7.53016 0.874893 7.2141 0.875H6.96913ZM7.09162 10.4886C7.79987 10.4886 8.47911 10.2073 8.97992 9.70648C9.48072 9.20567 9.76207 8.52643 9.76207 7.81818C9.76207 7.10993 9.48072 6.43069 8.97992 5.92989C8.47911 5.42908 7.79987 5.14773 7.09162 5.14773C6.38337 5.14773 5.70413 5.42908 5.20332 5.92989C4.70252 6.43069 4.42116 7.10993 4.42116 7.81818C4.42116 8.52643 4.70252 9.20567 5.20332 9.70648C5.70413 10.2073 6.38337 10.4886 7.09162 10.4886Z"
                    fill="white" />
                </svg>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-down">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M0.812874 1.97219L3.10211 4.67301C3.24327 4.84998 3.47169 4.95508 3.71516 4.95508C3.95862 4.95508 4.18704 4.84998 4.3282 4.67301L6.8307 1.97219C7.03562 1.7437 7.08351 1.43334 6.95539 1.16396C6.82728 0.894582 6.54382 0.709639 6.21726 0.682351H1.42472C1.09844 0.710106 0.815489 0.89523 0.687749 1.16452C0.560008 1.43381 0.608049 1.74391 0.812874 1.97219Z"
                            fill="white" />
                </svg>
            </button>
            <div class="dropdown-menu hidden absolute right-0 top-[38px] py-3.5 px-1 bg-white shadow-lg rounded-lg border cursor-pointer">
                <ul>
                    <a href="${edit_url}">
                        <li class="flex pl-4 pr-11 py-2 rounded-md hover:bg-slate-50 gap-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                                    fill="none">
                                    <path
                                        d="M5.5 5.33203H4.66667C4.22464 5.33203 3.80072 5.50763 3.48816 5.82019C3.17559 6.13275 3 6.55667 3 6.9987V14.4987C3 14.9407 3.17559 15.3646 3.48816 15.6772C3.80072 15.9898 4.22464 16.1654 4.66667 16.1654H12.1667C12.6087 16.1654 13.0326 15.9898 13.3452 15.6772C13.6577 15.3646 13.8333 14.9407 13.8333 14.4987V13.6654"
                                        stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                    <path
                                        d="M12.9993 3.66676L15.4993 6.16676M16.6535 4.98759C16.9817 4.65938 17.1661 4.21424 17.1661 3.75009C17.1661 3.28594 16.9817 2.84079 16.6535 2.51259C16.3253 2.18438 15.8802 2 15.416 2C14.9519 2 14.5067 2.18438 14.1785 2.51259L7.16602 9.50009V12.0001H9.66602L16.6535 4.98759Z"
                                        stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            <p class="text-sm text-zinc-800">Edit</p>
                        </li>
                    </a>
                    <li class="flex pl-4 pr-11 py-2 rounded-md hover:bg-slate-50 gap-x-2" onclick="handleArchive(${material.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                            fill="none">
                            <path
                                d="M9.92897 14.398L9.99967 14.4687L10.0704 14.398L12.827 11.6422L12.8978 11.5715L12.8271 11.5008L12.2371 10.9108L12.1663 10.8401L12.0956 10.9108L10.5163 12.4901V8.81482V8.71482H10.4163H9.58301H9.48301V8.81482V12.4901L7.90372 10.9108L7.83301 10.8401L7.7623 10.9108L7.1723 11.5008L7.10158 11.5715L7.17231 11.6422L9.92897 14.398ZM14.1649 4.3058L14.2063 4.21482L14.1649 4.3058C14.2222 4.33197 14.273 4.36668 14.3177 4.41015L15.2863 5.57398H4.69672L5.66712 4.41125C5.70996 4.36814 5.76007 4.33323 5.81816 4.30649C5.87552 4.28009 5.93351 4.26732 5.99301 4.26732H13.9897C14.0501 4.26732 14.1082 4.27997 14.1649 4.3058ZM4.26634 15.3215V6.60732H15.733V15.3215C15.733 15.4473 15.6935 15.5437 15.6181 15.6191C15.5427 15.6945 15.4463 15.734 15.3205 15.734H4.67967C4.55318 15.734 4.45655 15.6944 4.38122 15.6191C4.30582 15.5437 4.26634 15.4473 4.26634 15.3215ZM3.7198 16.2805C4.0404 16.6011 4.404 16.7673 4.80801 16.7673L15.1922 16.7665C15.5957 16.7665 15.959 16.6003 16.2796 16.2797C16.6001 15.9591 16.7663 15.5958 16.7663 15.1923V6.28815C16.7663 6.11463 16.7388 5.94796 16.6833 5.7887C16.6276 5.6281 16.5436 5.48264 16.4319 5.35282L15.12 3.76392C14.9893 3.58874 14.8225 3.45607 14.621 3.36674C14.4215 3.27823 14.211 3.23398 13.9905 3.23398H5.97717C5.7562 3.23398 5.5478 3.27822 5.3531 3.3672C5.15721 3.45673 4.99371 3.58966 4.86355 3.76463L3.56753 5.32018C3.45631 5.4494 3.37233 5.59167 3.31643 5.74674C3.2606 5.90164 3.23301 6.06595 3.23301 6.23898V15.1932C3.23301 15.5966 3.39923 15.96 3.7198 16.2805Z"
                                fill="#9CA3AF" stroke="#9CA3AF" stroke-width="0.2" />
                        </svg>
                        <p class="text-sm text-zinc-800">Archive</p>
                    </li>
                    <li data-id="${material.id}" data-material-filter="delete_material" class="flex pl-4 pr-11 py-2 rounded-md hover:bg-slate-50 gap-x-2" onclick="handleDelete(${material.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                            fill="none">
                            <path
                                d="M12.3265 8.50023L12.0958 14.5001M8.9039 14.5001L8.67324 8.50023M15.3184 6.36028C15.5464 6.39495 15.773 6.43162 15.9997 6.47095M15.3184 6.36028L14.6064 15.6154C14.5774 15.9922 14.4071 16.3441 14.1298 16.6008C13.8524 16.8576 13.4884 17.0001 13.1105 17H7.88926C7.51133 17.0001 7.14729 16.8576 6.86994 16.6008C6.59258 16.3441 6.42235 15.9922 6.3933 15.6154L5.68132 6.36028M15.3184 6.36028C14.549 6.24397 13.7756 6.15569 12.9998 6.09562M5.68132 6.36028C5.45332 6.39428 5.22666 6.43095 5 6.47028M5.68132 6.36028C6.45072 6.24397 7.2241 6.15569 7.99992 6.09562M12.9998 6.09562V5.48497C12.9998 4.69833 12.3931 4.04235 11.6065 4.01768C10.8689 3.99411 10.1308 3.99411 9.39322 4.01768C8.60657 4.04235 7.99992 4.699 7.99992 5.48497V6.09562M12.9998 6.09562C11.3356 5.96701 9.66406 5.96701 7.99992 6.09562"
                                stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="text-red-500 text-sm">Delete</div>
                    </li>
                </ul>
            </div>
        </div>`;
}

function toggleDropdownMenu(card, material) {
    // Close all other open dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== card.querySelector('.dropdown-menu')) {
            menu.classList.add('hidden');
        }
    });

    // Toggle the current dropdown
    const dropdownMenu = card.querySelector('.dropdown-menu');
    dropdownMenu.classList.toggle('hidden');
    
    // Add click outside listener to close dropdown
    const closeDropdown = (e) => {
        if (!card.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
            document.removeEventListener('click', closeDropdown);
        }
    };
    
    document.addEventListener('click', closeDropdown);
}

// Handler functions for actions
function handleArchive(materialId) {
    Modal.showDeleteModal(
        "Archive Learning Materials",
        "Are you sure you want to archive the Learning Materials?",
        "Archive", 
        "Cancel"
    ).then(function(result) {
        if (result.value) {
            $.ajax({
                url: `${api_config.archive_status_change}`,
                type: 'POST',
                data: { ids: materialId },
                headers: {
                    'X-CSRFToken': api_config.csrfmiddlewaretoken
                },
                dataType: 'json',
                success: function(data) {
                    if (data.status_code == 200) {
                        Toast.showSuccessToast(
                          'The learning material was successfully archived! '
                        ).then(function() {
                            window.location.reload(); 
                        });
                    } else {
                        Toast.showErrorToast(
                            `${data.message || "Please try again."}`
                        );
                    }
                },
                error: function() {
                    Toast.showErrorToast(
                        'An error occurred while archiving the learning material category. Please try again.'
                    )
                }
            });
        } else if (result.dismiss === 'cancel') {
              $('.swal2-container').addClass('!hidden');
        }
    })
}

function handleDelete(materialId) {
    Modal.showDeleteModal(
        "Delete Learning Material",
        "Are you sure you want to delete the Learning Material? This process cannot be undone."
      ).then(function(result) {
        if (result.value) {
            $.ajax({
                url: `${api_config.delete_records}`,
                type: 'POST',
                data: { ids: materialId },
                headers: {
                    'X-CSRFToken': api_config.csrfmiddlewaretoken
                },
                dataType: 'json',
                success: function(data) {
                    if (data.status_code == 200) {
                        localStorage.setItem('toastMessage', 'The learning material category was successfully deleted!');
                        window.location.reload();
                    } else {
                        Toast.showErrorToast(
                            `${data.message || "Please try again."}`
                        );
                    }
                },
                error: function() {
                    Toast.showErrorToast(
                        'An error occurred while deleting the learning material. Please try again.'
                    )
                }
            });
        } else if (result.dismiss === 'cancel') {
              $('.swal2-container').addClass('!hidden');
        }
    });
}

const toastMessage = localStorage.getItem('toastMessage');
if (toastMessage) {
  Toast.showSuccessToast(toastMessage);
  localStorage.removeItem('toastMessage'); 
}


function renderFileTypeIcon(fileType) {
    const iconMap = {
        'VIDEO': api_config.video_icon,
        'FILE': api_config.file_icon,
        'TEXT': api_config.text_icon,
        'AUDIO': api_config.audio_icon,
        'URL': api_config.url_icon,
        'EMBEDDED_LINK': api_config.embedded_icon
    };

    return `<img src="${iconMap[fileType] || ''}" alt="${fileType} Icon" class="w-5 h-4 mr-2.5">`;
}

async function sendFilterData(page = 1) {
    try {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        // Get filter values
        const searchInput = document.getElementById('searchInput')?.value.trim();
        const applySort = document.querySelector('[data-material-filter="sort"]:checked');
        const categories = Array.from(document.querySelectorAll('.category-filter input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
        const statuses = Array.from(document.querySelectorAll('.status-filter input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
        const fileTypes = Array.from(document.querySelectorAll('.type-filter input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

        const cancelSearch = document.querySelector('[data-material-filter="clearSearch"]')        
        if (searchInput.trim().length > 0) {
            cancelSearch.classList.remove('invisible');
            cancelSearch.classList.add('visible');
        } else {
            cancelSearch.classList.add('invisible');
            cancelSearch.classList.remove('visible');
        }

        // Construct query parameters
        const params = new URLSearchParams();
        if (applySort) params.append('sort', applySort.id);
        if (searchInput) params.append('search', searchInput);
        categories.forEach(category => params.append('categories', category));
        statuses.forEach(status => params.append('statuses', status));
        fileTypes.forEach(fileType => params.append('fileTypes', fileType));
        params.append('page', page);

        // Single API call for both data and pagination
        const response = await fetch(`${api_config.load_data}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': api_config.csrfmiddlewaretoken,
                'Accept': 'application/json',
            },
        });


        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update URL without page refresh
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        // Update content and pagination in a single render cycle
        updateLearningMaterials(data.learning_materials);
        window.paginationHandler.initialize(data.pagination.total_pages, data.pagination.current_page);

        const totalCount = document.getElementById('total-materials')
        totalCount.innerHTML = `(${data.pagination.total_items})`;

        if (loadingIndicator) loadingIndicator.style.display = 'none';

    } catch (error) {
        const errorIndicator = document.getElementById('errorIndicator');
        if (errorIndicator) {
            errorIndicator.textContent = 'Error loading data. Please try again.';
            errorIndicator.style.display = 'block';
        }
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function loadFilterSearchData(){
    const urlParams = new URLSearchParams(window.location.search);
    var search = urlParams.get('search');
    var selectedCategories = urlParams.getAll('categories');
    var selectedStatuses = urlParams.getAll('statuses');
    var selectedFileTypes = urlParams.getAll('fileTypes');

    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(checkbox => {
        if (selectedCategories.includes(checkbox.value)) {
            checkbox.checked = true; 
        }
    });

    const fileTypeCheckboxes = document.querySelectorAll('.filetype-checkbox');
    fileTypeCheckboxes.forEach(filetype=>{
        if (selectedFileTypes.includes(filetype.value)) {
            filetype.checked = true; 
        }
    })

    const statusCheckboxes = document.querySelectorAll('.status-filter input[type="checkbox"]');
    statusCheckboxes.forEach(checkbox => {
        if (selectedStatuses.includes(checkbox.value)) {
            checkbox.checked = true; 
        }
    });
    
    if (search){
        document.getElementById('searchInput').value=search
    }

    const currentPage = parseInt(urlParams.get('page')) || 1;
    const totalPages = parseInt(document.getElementById('lm-pagination').dataset.totalPages) || 1;

    // Create pagination handler once
    window.paginationHandler = new PaginationHandler('lm-pagination');
    window.paginationHandler.initialize(totalPages, currentPage);

    // Handle browser navigation
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page')) || 1;
        sendFilterData(page);
    });

}

// Add this single event listener at the document level
document.addEventListener('click', function(event) {
    // Find the closest settings button to the clicked element
    const settingsButton = event.target.closest('.settings-button');
    
    // If we clicked on or inside a settings button
    if (settingsButton) {
        event.preventDefault();
        event.stopPropagation();
        
        // Find the parent card and required elements
        const card = settingsButton.closest('.card');
        alert(1)
        const settingsMenu = card.querySelector('.dropdown-menu');
        const arrow = card.querySelector('.arrow-down');
        
        // Toggle the classes
        settingsMenu.classList.toggle('hidden');
        arrow.classList.toggle('arrow-up');
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.settings-button') && !event.target.closest('.dropdown-menu')) {
        // Close all open dropdowns
        document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
            menu.classList.add('hidden');
            const card = menu.closest('.card');
            const arrow = card.querySelector('.arrow-down');
            if (arrow.classList.contains('arrow-up')) {
                arrow.classList.remove('arrow-up');
            }
        });
    }
});

function filterCategory(){
    const categorySearch = document.getElementById('categorySearch');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');

    // Add event listener for search input
    categorySearch.addEventListener('input', function() {
        // Get the lowercase search term
        const searchTerm = this.value.toLowerCase().trim();

        // Iterate through each category checkbox
        categoryCheckboxes.forEach(checkbox => {
            // Get the category name (assuming the name is in the next sibling span)
            const categoryName = checkbox.nextElementSibling.textContent.toLowerCase();

            // Determine visibility based on search term
            if (searchTerm === '' || categoryName.includes(searchTerm)) {
                // Show the entire label (parent of checkbox)
                checkbox.closest('label').style.display = 'flex';
            } else {
                // Hide labels that don't match
                checkbox.closest('label').style.display = 'none';
            }
        });
    });
}



// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadFilterSearchData()
    sendFilterData()
    filterCategory()

    // Add search input listener with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => sendFilterData(), 500));
    }

    // Add filter button listener
    const applyFilterBtn = document.querySelector('[data-materials-filter="applyFilter"]');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => sendFilterData());
    }

    const applySort = document.querySelector('[data-material-filter="sort"]');
    if (applySort) {
        applySort.addEventListener('click', () => sendFilterData());
    }

    const cancelSort = document.querySelector('[data-material-filter="clearsort"]');
    if (cancelSort) {
        cancelSort.addEventListener('click', () => {
            const checkedRadio = document.querySelector('[data-material-filter="sort"]:checked');
            if (checkedRadio) {
                checkedRadio.checked = false; // Uncheck the selected radio button
            }
            sendFilterData(); // Call your filter function
        });
    }

    const cancelFilter = document.querySelector('[data-materials-filter="clearFilter"]');
    if (cancelFilter) {
        cancelFilter.addEventListener('click', () => {

            document.querySelectorAll('.category-filter input[type="checkbox"]:checked').forEach((checkbox) => {
                checkbox.checked = false;
            });
    
            document.querySelectorAll('.status-filter input[type="checkbox"]:checked').forEach((checkbox) => {
                checkbox.checked = false;
            });
    
            document.querySelectorAll('.type-filter input[type="checkbox"]:checked').forEach((checkbox) => {
                checkbox.checked = false;
            });
    
            sendFilterData(); 
        });
    }

    const cancelSearch = document.querySelector('[data-material-filter="clearSearch"]')      
    if (cancelSearch){
        cancelSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = ''; 
            }
            sendFilterData()
        })

    }

    // Close dropdowns on clicking outside card
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.card')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
            document.querySelectorAll('.arrow-down').forEach(arrow => {
                arrow.classList.remove('arrow-up');
            });
        }
    });

    // Sort and Filter dropdown buttons
    const dropdownButton = document.querySelectorAll('#dropdownSort, #dropdownFilter');
    const dropdownMenu = document.querySelectorAll('#dropdownSortMenu, #dropdownFilterMenu');
    dropdownButton.forEach((button, index) => {
        button.addEventListener('click', () => {
            dropdownMenu[index].classList.toggle('hidden');
        });
    });

    // Close dropdown on clicking outside
    window.addEventListener('click', (e) => {
        dropdownButton.forEach((button, index) => {
            const menu = dropdownMenu[index];
            if (!button.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    });

});

window.onpopstate = function(e) {
    window.location.reload();
};