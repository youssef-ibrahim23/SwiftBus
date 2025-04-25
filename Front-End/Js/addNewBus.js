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
    const form = document.getElementById('addBusForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.nextElementSibling.style.display = 'block';
            } else {
                this.nextElementSibling.style.display = 'none';
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (input.value.trim() === '') {
                isValid = false;
                input.style.borderColor = '#e74c3c';
            } else {
                input.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');                    }
        });
        
        if (isValid) {
            // Prepare bus data
            const busData = {
                from: document.getElementById('from').value,
                to: document.getElementById('to').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                type: document.getElementById('type').value,
                price: document.getElementById('price').value
            };
            
            // In a real app, you would save this to your database
            saveBus(busData);
        } else {
            alert('Please fill in all required fields');
        }
    });

    // Cancel button
    document.querySelector('.btn-cancel').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            // Reset form
            form.reset();
            document.querySelectorAll('.check-mark').forEach(mark => {
                mark.style.display = 'none';
            });
        }
    });
});

// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Save bus to database
function saveBus(busData) {
    // In a real app, you would make an API call to your backend
    console.log('Saving bus:', busData);
    
    // Show success message
    alert('Bus added successfully!');
    
    // Reset form
    document.getElementById('addBusForm').reset();
    document.querySelectorAll('.check-mark').forEach(mark => {
        mark.style.display = 'none';
    });
    
    // Here you would typically redirect or update the bus list
    // window.location.href = 'manage-buses.html';
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}