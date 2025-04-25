// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Generate report
document.querySelector('.generate-btn').addEventListener('click', function() {
    alert('Report generated based on selected filters');
});

// Export buttons
document.querySelector('.export-pdf').addEventListener('click', function() {
    alert('PDF export initiated');
});

document.querySelector('.export-excel').addEventListener('click', function() {
    alert('Excel export initiated');
});

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}