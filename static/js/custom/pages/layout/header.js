const hamburgerMenu = document.getElementById('hamburger-menu');
const responsiveSidenav = document.getElementById('sidenav');
const content = document.getElementsByClassName('main-content');
const closeBtn = document.getElementById('closeBtn');
const headerMenuButton = document.getElementById('user-avatar-dropdown');
const headerDropdownIcon = document.getElementById('header-dropdown-icon');
const headerDropdown = document.getElementById('header-dropdown');

// Header dropdown functionality
function toggleDropdown() {
  headerDropdownIcon.classList.toggle('rotate-180');
  headerMenuButton.classList.toggle('bg-zinc-100');
  headerDropdown.classList.toggle('hidden');

  const userInfoWrapper = headerMenuButton.closest('.user-info-wrapper');
  userInfoWrapper?.classList.remove('bg-active');
}

// Close dropdown
function closeDropdown(event) {
  if (!headerMenuButton.contains(event.target) && !headerDropdown.contains(event.target)) {
    headerDropdown.classList.add('hidden');
    headerDropdownIcon.classList.remove('rotate-180');
    headerMenuButton.classList.remove('bg-zinc-100');
    const userInfoWrapper = headerMenuButton.closest('.user-info-wrapper');
    userInfoWrapper?.classList.remove('bg-active');
  }
}

headerMenuButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleDropdown();
});

// Hamburger menu functionality
function toggleSidenav() {
  responsiveSidenav.classList.toggle('sidenav-open');
  Array.from(content).forEach((el) => el.classList.toggle('overlay-active'));
}

// Close sidenav
function closeSidenav() {
  responsiveSidenav.classList.remove('sidenav-open');
  Array.from(content).forEach((el) => el.classList.remove('overlay-active'));
}

hamburgerMenu.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleSidenav();
});

// Close sidenav with close button
closeBtn.addEventListener('click', (event) => {
  event.stopPropagation(); 
  closeSidenav();  
});

// Close dropdown and sidenav on clicking outside
window.addEventListener('click', (event) => {
  closeDropdown(event);
});
