const sidenavToggleButtons = [
  document.getElementById('organizationToggle'),
  document.getElementById('usersToggle'),
  document.getElementById('observationsToggle'),
  document.getElementById('familyToggle'),
  // document.getElementById('learningToggle'),
  // document.getElementById('callAnalysisToggle')
];

const sidenavMenus = [
  document.getElementById('organizationMenu'),
  document.getElementById('usersMenu'),
  document.getElementById('observationsMenu'),
  document.getElementById('familyMenu'),
  // document.getElementById('learningMenu'),
  // document.getElementById('callAnalysisMenu')
];

const collapseBtn = document.getElementById('collapseBtn');
const sidenav = document.getElementById('sidenav');
const navMenus = Array.from(document.querySelectorAll('.nav-menu'));
const navMenuImages = document.querySelectorAll('.nav-menu img');
const menuTexts = document.querySelectorAll('.menu-text');
const sidenavDropdownIcon = document.getElementById('sidenav-dropdown-icon');

let isCollapsed = false;

// Toggle dropdown menus
function toggleSidenavDropdown(buttons, menus) {
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const isOpen = menus[index].classList.contains('menu-open');
      closeAllDropdowns(menus);

      if (!isOpen) {
        menus[index].classList.remove('hidden');
        menus[index].classList.add('menu-open');
        sidenavDropdownIcon.classList.add('rotate-180');
      }
    });
  });
}

function closeAllDropdowns(menus) {
  menus.forEach(menu => {
    menu.classList.add('hidden');
    menu.classList.remove('menu-open');
  });
}

// Keep active dropdown open based on active submenu
function openActiveDropdown(menus) {
  menus.forEach((menu, index) => {
    const activeSubmenu = menu.querySelector('.active'); // Check if any submenu has the active class
    if (activeSubmenu) {
      menu.classList.remove('hidden'); // Open the dropdown menu
      menu.classList.add('menu-open');
    } else {
      sidenavToggleButtons[index].classList.remove('active'); // Ensure dropdown button doesn't have active
    }
  });
}

// Collapse sidebar
function collapseSidebar() {
  applyClassList(sidenav, 'add', 'collapsed');
  toggleClassList(menuTexts, 'add', 'hidden');
  toggleClassList(navMenus, 'add', 'collapsed-menu');
  toggleClassList(navMenuImages, 'add', 'centered-img');
  closeAllDropdowns(sidenavMenus);
  applyClassList(collapseBtn, 'add', 'hidden');
  isCollapsed = true;
}

// Expand sidebar with transition effect
function expandSidebar() {
  applyClassList(sidenav, 'remove', 'collapsed');
  toggleClassList(menuTexts, 'remove', 'hidden');
  toggleClassList(navMenus, 'remove', 'collapsed-menu');
  toggleClassList(navMenuImages, 'remove', 'centered-img');
  applyClassList(collapseBtn, 'remove', 'hidden');
  isCollapsed = false;
}

function applyClassList(element, action, className) {
  action === 'add' ? element.classList.add(className) : element.classList.remove(className);
}

function toggleClassList(elements, action, className) {
  elements.forEach(element => applyClassList(element, action, className));
}

function initSidebar() {
  toggleSidenavDropdown(sidenavToggleButtons, sidenavMenus);

  // Keep open any active dropdown on page load
  openActiveDropdown(sidenavMenus);

  collapseBtn.addEventListener('click', () => {
    isCollapsed ? expandSidebar() : collapseSidebar();
  });

  sidenav.addEventListener('mouseenter', () => {
    if (isCollapsed) expandSidebar();
  });
}

// Initialize the sidebar functionality
initSidebar();
