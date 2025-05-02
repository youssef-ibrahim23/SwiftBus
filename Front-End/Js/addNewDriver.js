// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    if (menu && icon) {
        menu.classList.toggle('show');
        icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
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

    if (photoInput && photoPreview) {
        photoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    photoPreview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.classList.add('preview-image');
                    photoPreview.appendChild(img);
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // Cancel button functionality
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = 'ViewAllDrivers.html';
        });
    }

    // Add driver form submission
    const addDriverForm = document.getElementById('addDriverForm');
    if (addDriverForm) {
        addDriverForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data - fixed ID to match HTML (username -> userName)
            const driverData = {
                userName: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                role: 'DRIVER'
            };

            // Basic validation
            if (!driverData.userName || !driverData.email || !driverData.password) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }

            // Email validation
            if (!validateEmail(driverData.email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }

            // Make API call - ensure this matches your actual API endpoint
            fetch('http://localhost:8081/api/admin/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    // 'Authorization': 'Bearer ' + yourAuthToken
                },
                body: JSON.stringify(driverData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                console.log('Driver created:', data);
                showAlert('Driver added successfully!', 'success');
                addDriverForm.reset();
                if (photoPreview) photoPreview.innerHTML = '<i class="fas fa-user"></i>';
                
                // Redirect after success if needed
                // window.location.href = 'ViewAllDrivers.html';
            })
            .catch(error => {
                console.error('Error adding driver:', error);
                const errorMsg = error.message || 'Failed to add driver';
                showAlert(errorMsg, 'error');
            });
        });
    }

    // Helper function to show alerts
    function showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Style the alert
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '10px 20px';
        alertDiv.style.borderRadius = '5px';
        alertDiv.style.color = 'white';
        alertDiv.style.zIndex = '1000';
        alertDiv.style.animation = 'fadeIn 0.3s ease-in-out';
        
        // Set background color based on type
        alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
        
        document.body.appendChild(alertDiv);
        
        // Remove alert after 5 seconds
        setTimeout(() => {
            alertDiv.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    }

    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});

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
`;
document.head.appendChild(style);

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

    // Add Schedule button functionality

   });

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}