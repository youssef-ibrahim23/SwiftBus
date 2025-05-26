// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Get driver ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const driverId = urlParams.get('id');
    
    // In a real app, you would fetch driver details based on ID
    // fetchDriverDetails(driverId);
    
    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Edit button functionality
    const editBtn = document.querySelector('.edit-btn');
    const textFields = document.querySelectorAll('.text-field');
    
    let isEditing = false;
    
    editBtn.addEventListener('click', function() {
        isEditing = !isEditing;
        
        if (isEditing) {
            this.textContent = 'Save Changes';
            textFields.forEach(field => {
                field.removeAttribute('readonly');
                field.style.backgroundColor = 'white';
            });
        } else {
            this.textContent = 'Edit info';
            textFields.forEach(field => {
                field.setAttribute('readonly', true);
                field.style.backgroundColor = 'var(--input-bg)';
            });
            // Here you would save the changes to your database
            alert('Changes saved successfully!');
        }
    });

    // Initially set fields to readonly
    textFields.forEach(field => {
        field.setAttribute('readonly', true);
    });
});

// Function to fetch driver details (for your backend)
async function fetchDriverDetails(driverId) {
    /*
    try {
        const response = await fetch(`/api/drivers/${driverId}`);
        const driverData = await response.json();
        displayDriverDetails(driverData);
    } catch (error) {
        console.error('Error fetching driver details:', error);
    }
    */
}

// Function to display driver details
function displayDriverDetails(driver) {
    document.querySelector('.driver-name').textContent = driver.name;
    document.querySelector('input[value="01234567"]').value = driver.phone;
    // Update all other fields similarly
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