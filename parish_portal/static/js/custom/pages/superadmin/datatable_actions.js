// Table Dropdown functionality
const dropdownItems = [
    {
        button: document.getElementById('dropdownStatus'),
        menu: document.getElementById('dropdownStatusMenu')
    },
    {
        button: document.getElementById('dropdownSort'),
        menu: document.getElementById('dropdownSortMenu')
    },
    {
        button: document.getElementById('kebabMenuButton'),
        menu: document.getElementById('kebabMenu')
    },
    {
        button: document.getElementById('dropdownFilter'),
        menu: document.getElementById('dropdownFilterMenu')
    }
].filter(item => item.button && item.menu);

// Toggle dropdown menus
dropdownItems.forEach(({ button, menu }) => {
    button.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
});

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    dropdownItems.forEach(({ button, menu }) => {
        if (!button.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
});

// Modal.js
// Show the modal
function showModal() {
    const modalContainer = document.querySelector('.swal2-container');
    modalContainer.classList.remove('hidden');
}


