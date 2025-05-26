document.addEventListener('DOMContentLoaded', async function() {
    // Initialize form submission
    const addBusForm = document.getElementById('addBusForm');
    if (addBusForm) {
        addBusForm.addEventListener('submit', handleFormSubmit);
    }

    // Initialize cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = 'ViewAllBuses.html';
        });
    }

    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load available drivers when page loads
    await populateDriverOptions();
});

async function populateDriverOptions() {
    const driverSelect = document.getElementById('assigned_driver');
    
    // Show loading state
    driverSelect.classList.add('select-loading');
    driverSelect.disabled = true;
    
    try {
        const response = await fetch('http://localhost:8081/api/admin/users');
        if (!response.ok) {
            throw new Error('Failed to fetch drivers');
        }

        const users = await response.json();
        const drivers = users.filter(user => user.role === 'DRIVER');
        
        // Clear existing options except the first one
        while (driverSelect.options.length > 1) {
            driverSelect.remove(1);
        }
        
        // Add new options
        drivers.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.userId;
            option.textContent = `${driver.userName} (ID: ${driver.userId})`;
            driverSelect.appendChild(option);
        });

        // If no drivers available, show a message
        if (drivers.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No available drivers';
            option.disabled = true;
            option.selected = true;
            driverSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error fetching drivers:', error);
        showAlert('Failed to load driver information', 'error');
        
        // Add error option
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Error loading drivers';
        option.disabled = true;
        option.selected = true;
        driverSelect.appendChild(option);
    } finally {
        // Remove loading state
        driverSelect.classList.remove('select-loading');
        driverSelect.disabled = false;
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const busData = {
        model: document.getElementById('model').value.trim(),
        capacity: parseInt(document.getElementById('capacity').value),
        driver: {
            userId: parseInt(document.getElementById('assigned_driver').value)
        }
    };

    // Validate form
    if (!validateForm(busData)) {
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    try {
        // Make API call to add new bus
        const response = await fetch('http://localhost:8081/api/admin/buses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(busData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add bus');
        }

        const result = await response.json();
        showAlert('Bus added successfully!', 'success');

        // Wait 1.3 seconds before redirecting
        setTimeout(() => {
            window.location.href = 'ViewAllBuses.html';
        }, 1300);
        
    } catch (error) {
        console.error('Error adding bus:', error);
        showAlert(error.message || 'Failed to add bus. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

function validateForm(busData) {
    // Basic validation
    if (!busData.model || busData.model.length < 2) {
        showAlert('Please enter a valid bus model (at least 2 characters)', 'error');
        return false;
    }

    if (isNaN(busData.capacity)) {
        showAlert('Please enter a valid capacity number', 'error');
        return false;
    }

    if (busData.capacity <= 0) {
        showAlert('Capacity must be greater than 0', 'error');
        return false;
    }

    if (isNaN(busData.driver.userId) || busData.driver.userId <= 0) {
        showAlert('Please select a valid driver', 'error');
        return false;
    }

    return true;
}

// Show alert message
function showAlert(message, type) {
    // Remove any existing alerts first
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Style the alert
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '12px 24px';
    alertDiv.style.borderRadius = '4px';
    alertDiv.style.color = 'white';
    alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                   type === 'error' ? '#F44336' : '#2196F3';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    alertDiv.style.animation = 'fadeIn 0.3s ease-out';
    
    document.body.appendChild(alertDiv);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: fadeIn 0.3s ease-out;
    }
    
    .alert-success {
        background-color: #4CAF50;
    }
    
    .alert-error {
        background-color: #F44336;
    }
    
    .fa-spinner {
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .select-loading {
        position: relative;
        color: transparent;
    }
    
    .select-loading::after {
        content: "";
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);