// Sample bus data (in a real app, this would come from your database)
const busData = [
    {
        id: 1,
        name: "Global Coach",
        plateNumber: "MH 12 GU 1254",
        busId: "123456",
        type: "A/C Sleeper",
        from: "Mumbai",
        to: "Pune",
        status: "active"
    },
    {
        id: 2,
        name: "Purple Metrolink",
        plateNumber: "MH 14 GU 1253",
        busId: "123455",
        type: "Sleeper",
        from: "NA",
        to: "NA",
        status: "active"
    },
    {
        id: 3,
        name: "Orange Tours",
        plateNumber: "MH 16 GU 1252",
        busId: "123458",
        type: "Non A/C Sleeper",
        from: "Bengaluru",
        to: "Chennai",
        status: "active"
    },
    {
        id: 4,
        name: "Neeta Tours",
        plateNumber: "MH 18 GU 1245",
        busId: "123459",
        type: "Volvo A/C",
        from: "NA",
        to: "NA",
        status: "active"
    },
    {
        id: 5,
        name: "Shimeri",
        plateNumber: "MH 12 GU 1248",
        busId: "123445",
        type: "A/C Semi Sleeper",
        from: "Pune",
        to: "Mumbai",
        status: "active"
    },
    {
        id: 6,
        name: "✅️ & ✅️",
        plateNumber: "MH 16 GU 1243",
        busId: "123456",
        type: "A/C Sleeper",
        from: "Canada",
        to: "Pune",
        status: "active"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load bus data into the table
    loadBusData(busData);

    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Filter functionality
    document.getElementById('typeFilter').addEventListener('change', filterBuses);
    document.getElementById('fromFilter').addEventListener('change', filterBuses);
    document.getElementById('toFilter').addEventListener('change', filterBuses);
    document.querySelector('.search-input').addEventListener('input', filterBuses);
});

// Load bus data into the table
function loadBusData(data) {
    const tableBody = document.querySelector('#busTable tbody');
    tableBody.innerHTML = '';

    data.forEach(bus => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${bus.name}</td>
            <td>${bus.plateNumber}</td>
            <td>${bus.busId}</td>
            <td>${bus.type}</td>
            <td>${bus.from}</td>
            <td>${bus.to}</td>
            <td>
                <button class="action-btn" onclick="editBus(${bus.id})">💬️</button>
                <button class="action-btn delete" onclick="deleteBus(${bus.id})">🔴</button>
                <button class="action-btn" onclick="viewBus(${bus.id})">💬️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filter buses based on selections
function filterBuses() {
    const typeFilter = document.getElementById('typeFilter').value;
    const fromFilter = document.getElementById('fromFilter').value;
    const toFilter = document.getElementById('toFilter').value;
    const searchQuery = document.querySelector('.search-input').value.toLowerCase();

    const filteredData = busData.filter(bus => {
        // Filter by type
        if (typeFilter !== 'all') {
            const typeMap = {
                'ac-sleeper': 'A/C Sleeper',
                'sleeper': 'Sleeper',
                'non-ac-sleeper': 'Non A/C Sleeper',
                'volvo-ac': 'Volvo A/C',
                'ac-semi-sleeper': 'A/C Semi Sleeper'
            };
            if (bus.type !== typeMap[typeFilter]) return false;
        }

        // Filter by from location
        if (fromFilter !== 'all' && bus.from !== fromFilter) {
            if (fromFilter === 'na') {
                if (bus.from !== 'NA') return false;
            } else {
                if (bus.from.toLowerCase() !== fromFilter) return false;
            }
        }

        // Filter by to location
        if (toFilter !== 'all' && bus.to !== toFilter) {
            if (toFilter === 'na') {
                if (bus.to !== 'NA') return false;
            } else {
                if (bus.to.toLowerCase() !== toFilter) return false;
            }
        }

        // Filter by search query
        if (searchQuery) {
            const searchFields = [
                bus.name.toLowerCase(),
                bus.plateNumber.toLowerCase(),
                bus.busId.toLowerCase(),
                bus.type.toLowerCase(),
                bus.from.toLowerCase(),
                bus.to.toLowerCase()
            ];
            if (!searchFields.some(field => field.includes(searchQuery))) {
                return false;
            }
        }

        return true;
    });

    loadBusData(filteredData);
}

// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Bus actions
function editBus(busId) {
    const bus = busData.find(b => b.id === busId);
    alert(`Edit bus: ${bus.name}\nID: ${bus.busId}`);
    // In a real app, this would open an edit modal/form
}

function deleteBus(busId) {
    if (confirm('Are you sure you want to delete this bus?')) {
        // In a real app, this would make an API call to delete from database
        const index = busData.findIndex(b => b.id === busId);
        if (index !== -1) {
            busData.splice(index, 1);
            loadBusData(busData);
            alert('Bus deleted successfully');
        }
    }
}

function viewBus(busId) {
    const bus = busData.find(b => b.id === busId);
    alert(`Bus Details:\n\nName: ${bus.name}\nPlate Number: ${bus.plateNumber}\nBus ID: ${bus.busId}\nType: ${bus.type}\nRoute: ${bus.from} to ${bus.to}`);
    // In a real app, this would open a detailed view
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}

// Database integration functions (for your backend)
async function fetchBusesFromDatabase() {
    // In a real app, you would fetch from your backend API
    /*
    try {
        const response = await fetch('/api/buses');
        const data = await response.json();
        loadBusData(data);
    } catch (error) {
        console.error('Error fetching buses:', error);
    }
    */
}

async function saveBusToDatabase(busData) {
    // In a real app, you would send to your backend API
    /*
    try {
        const response = await fetch('/api/buses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(busData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving bus:', error);
    }
    */
}