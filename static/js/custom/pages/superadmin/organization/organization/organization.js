// Dropdown functionality
const dropdownButton = [
    document.getElementById('dropdownStatus'),
    document.getElementById('dropdownSort'),
    document.getElementById('dropdownFilter')
];
const dropdownMenu = [
    document.getElementById('dropdownStatusMenu'),
    document.getElementById('dropdownSortMenu'),
    document.getElementById('dropdownFilterMenu')
];

// Toggle dropdown menus
dropdownButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        dropdownMenu[index].classList.toggle('hidden');
    });
});

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    dropdownButton.forEach((button, index) => {
        const menu = dropdownMenu[index];
        if (!button.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
});

