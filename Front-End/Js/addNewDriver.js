// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Photo upload functionality
    const uploadBtn = document.getElementById('uploadBtn');
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');

    uploadBtn.addEventListener('click', function() {
        photoInput.click();
    });

    photoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                photoPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                photoPreview.appendChild(img);
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Form submission would be handled here
    // You would add event listeners for the form submission
    // and connect to your backend
});

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}