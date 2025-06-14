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
    const form = document.getElementById('scheduleForm');
    const requiredFields = [
        { id: 'busSelect', errorId: 'busError' },
        { id: 'driverSelect', errorId: 'driverError' },
        { id: 'departureSelect', errorId: 'departureError' },
        { id: 'destinationSelect', errorId: 'destinationError' },
        { id: 'departureDate', errorId: 'dateError' },
        { id: 'departureTime', errorId: 'timeError' },
        { id: 'duration', errorId: 'durationError' },
        { id: 'price', errorId: 'priceError' }
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
                element.style.borderColor = 'var(--border-color)';
            }
        });

        // Additional validation for date (must be today or future)
        const dateInput = document.getElementById('departureDate');
        const dateError = document.getElementById('dateError');
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            dateError.textContent = 'Date must be today or in the future';
            dateError.style.display = 'block';
            dateInput.style.borderColor = 'var(--error-color)';
            isValid = false;
        }

        // Additional validation for destination != departure
        const departureSelect = document.getElementById('departureSelect');
        const destinationSelect = document.getElementById('destinationSelect');
        const destinationError = document.getElementById('destinationError');
        
        if (departureSelect.value && departureSelect.value === destinationSelect.value) {
            destinationError.textContent = 'Destination must be different from departure';
            destinationError.style.display = 'block';
            destinationSelect.style.borderColor = 'var(--error-color)';
            isValid = false;
        }

        if (isValid) {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            // In a real app, you would submit to server here
            console.log('Form submitted:', {
                bus: document.getElementById('busSelect').value,
                driver: document.getElementById('driverSelect').value,
                departure: document.getElementById('departureSelect').value,
                destination: document.getElementById('destinationSelect').value,
                date: document.getElementById('departureDate').value,
                time: document.getElementById('departureTime').value,
                duration: document.getElementById('duration').value,
                price: document.getElementById('price').value,
                notes: document.getElementById('notes').value
            });
            
            // Redirect after 2 seconds (simulate success)
            setTimeout(() => {
                window.location.href = 'manage-schedule.html'; // Replace with your schedules list page
            }, 2000);
        }
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            window.location.href = 'manage-schedule.html'; // Replace with your schedules list page
        }
    });

    // Real-time validation for some fields
    document.getElementById('duration').addEventListener('input', function() {
        const errorElement = document.getElementById('durationError');
        if (this.value < 1 || this.value > 24) {
            errorElement.style.display = 'block';
            this.style.borderColor = 'var(--error-color)';
        } else {
            errorElement.style.display = 'none';
            this.style.borderColor = 'var(--border-color)';
        }
    });

    document.getElementById('price').addEventListener('input', function() {
        const errorElement = document.getElementById('priceError');
        if (this.value <= 0) {
            errorElement.style.display = 'block';
            this.style.borderColor = 'var(--error-color)';
        } else {
            errorElement.style.display = 'none';
            this.style.borderColor = 'var(--border-color)';
        }
    });
});

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}