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

    // Form validation
    const form = document.getElementById('destinationForm');
    const requiredFields = [
        { id: 'destinationName', errorId: 'nameError' },
        { id: 'city', errorId: 'cityError' },
        { id: 'country', errorId: 'countryError' }
    ];

    // Validate on submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // Validate required fields
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            const errorElement = document.getElementById(field.errorId);
            
            if (!element.value) {
                errorElement.style.display = 'block';
                element.style.borderColor = 'var(--error-color)';
                isValid = false;
            } else {
                errorElement.style.display = 'none';
                element.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
            }
        });

        if (isValid) {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            // In a real app, you would submit to server here
            console.log('Form submitted:', {
                name: document.getElementById('destinationName').value,
                city: document.getElementById('city').value,
                country: document.getElementById('country').value,
                landmark: document.getElementById('landmark').value,
                description: document.getElementById('description').value
            });
            
            // Redirect after 2 seconds (simulate success)
            setTimeout(() => {
                window.location.href = 'view-all-destinations.html'; // Replace with your destinations list page
            }, 2000);
        }
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            window.location.href = 'view-all-destinations.html'; // Replace with your destinations list page
        }
    });

    // Real-time validation for required fields
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const errorElement = document.getElementById(field.errorId);
        
        element.addEventListener('input', function() {
            if (this.value) {
                errorElement.style.display = 'none';
                this.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
            }
        });
    });
});

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}