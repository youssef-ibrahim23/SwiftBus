// Sample driver data (in a real app, this would come from your database)
const driverData = [
    {
        id: 1,
        name: "John Doe",
        rating: 4,
        status: "active"
    },
    {
        id: 2,
        name: "Camicon John",
        rating: 3,
        status: "active"
    },
    {
        id: 3,
        name: "William Gad",
        rating: 5,
        status: "active"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load driver data
    loadDriverData(driverData);

    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Load driver data into the list
function loadDriverData(data) {
    const driversList = document.getElementById('driversList');
    driversList.innerHTML = '';

    data.forEach(driver => {
        const driverElement = document.createElement('div');
        driverElement.className = 'driver-card';
        
        // Create star rating string
        const stars = '★'.repeat(driver.rating) + '☆'.repeat(5 - driver.rating);
        
        driverElement.innerHTML = `
            <div class="driver-info">
                <div class="driver-name">${driver.name}</div>
                <div class="driver-rating">${stars}</div>
            </div>
            <div class="driver-actions">
                <button class="action-btn" onclick="editDriver(${driver.id})">💬</button>
                <button class="action-btn delete" onclick="deleteDriver(${driver.id})">🔴</button>
            </div>
        `;
        
        driversList.appendChild(driverElement);
    });
}

// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Driver actions
function editDriver(driverId) {
    const driver = driverData.find(d => d.id === driverId);
    alert(`Edit driver: ${driver.name}\nID: ${driver.id}`);
    // In a real app, this would open an edit modal/form
}

function deleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver?')) {
        // In a real app, this would make an API call to delete from database
        const index = driverData.findIndex(d => d.id === driverId);
        if (index !== -1) {
            driverData.splice(index, 1);
            loadDriverData(driverData);
            alert('Driver deleted successfully');
        }
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}

// Database integration functions (for your backend)
async function fetchDriversFromDatabase() {
    // In a real app, you would fetch from your backend API
    /*
    try {
        const response = await fetch('/api/drivers');
        const data = await response.json();
        loadDriverData(data);
    } catch (error) {
        console.error('Error fetching drivers:', error);
    }
    */
}

async function saveDriverToDatabase(driverData) {
    // In a real app, you would send to your backend API
    /*
    try {
        const response = await fetch('/api/drivers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(driverData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving driver:', error);
    }
    */
}