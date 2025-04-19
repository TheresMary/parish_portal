// Dropdown functionality
const countryDropdownButton = [
    document.getElementById('countrydropdownStatus'),
    document.getElementById('countrydropdownSort'),
    document.getElementById('countrykebabMenuButton')
];
const countryDropdownMenu = [
    document.getElementById('countrydropdownStatusMenu'),
    document.getElementById('countrydropdownSortMenu'),
    document.getElementById('countrykebabMenu')
];

// Toggle dropdown menus
countryDropdownButton.forEach((button, index) => {
    button.onclick = () => {
        countryDropdownMenu[index].classList.toggle('hidden');
    };
});

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    countryDropdownButton.forEach((button, index) => {
        const menu = countryDropdownMenu[index];
        if (!button.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
});