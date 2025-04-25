// Sample trips data
let trips = [
    { id: 101, departure: "Cairo", destination: "Luxor", date: "25 APR", availableSeats: 32, totalSeats: 50 },
    { id: 109, departure: "Cairo", destination: "Oswan", date: "14 Mar", availableSeats: 40, totalSeats: 44 }
];

// DOM elements
const tripsTableBody = document.getElementById('tripsTableBody');
const addTripBtn = document.getElementById('addTripBtn');
const tripModal = document.getElementById('tripModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const tripForm = document.getElementById('tripForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Current action (add or edit)
let currentAction = 'add';
let currentTripId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load trips
    renderTripsTable();
    
    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add Trip button click
    addTripBtn.addEventListener('click', function() {
        currentAction = 'add';
        modalTitle.textContent = 'Add New Trip';
        tripForm.reset();
        document.getElementById('tripId').value = '';
        tripModal.style.display = 'flex';
    });

    // Close modal buttons
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);

    // Form submission
    tripForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tripData = {
            departure: document.getElementById('departure').value,
            destination: document.getElementById('destination').value,
            date: formatDate(document.getElementById('tripDate').value),
            availableSeats: parseInt(document.getElementById('availableSeats').value),
            totalSeats: parseInt(document.getElementById('totalSeats').value)
        };
        
        if (currentAction === 'add') {
            // Generate new ID (in a real app, this would come from the server)
            const newId = trips.length > 0 ? Math.max(...trips.map(t => t.id)) + 1 : 101;
            tripData.id = newId;
            trips.push(tripData);
        } else {
            // Update existing trip
            const index = trips.findIndex(t => t.id === currentTripId);
            if (index !== -1) {
                tripData.id = currentTripId;
                trips[index] = tripData;
            }
        }
        
        renderTripsTable();
        closeModalFunc();
    });

    // Search functionality
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            const filteredTrips = trips.filter(trip => 
                trip.departure.toLowerCase().includes(searchTerm) || 
                trip.destination.toLowerCase().includes(searchTerm)
            );
            renderTripsTable(filteredTrips);
        } else {
            renderTripsTable();
        }
    });

    // Press Enter in search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
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

// Render trips table
function renderTripsTable(tripsToRender = trips) {
    tripsTableBody.innerHTML = '';
    
    tripsToRender.forEach(trip => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${trip.id}</td>
            <td>${trip.departure}</td>
            <td>${trip.destination}</td>
            <td>${trip.date}</td>
            <td>
                <div class="seats-info">
                    <span class="seats-available">${trip.availableSeats}</span>
                    <span class="seats-total">\\${trip.totalSeats}</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" data-id="${trip.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${trip.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tripsTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editTrip(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteTrip(parseInt(this.getAttribute('data-id')));
        });
    });
}

// Edit trip
function editTrip(tripId) {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
        currentAction = 'edit';
        currentTripId = tripId;
        modalTitle.textContent = 'Edit Trip';
        
        document.getElementById('tripId').value = trip.id;
        document.getElementById('departure').value = trip.departure;
        document.getElementById('destination').value = trip.destination;
        
        // Convert date format (assuming format like "25 APR")
        const dateParts = trip.date.split(' ');
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'APR': '04', 
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const formattedDate = `2023-${monthMap[dateParts[1]]}-${dateParts[0].padStart(2, '0')}`;
        document.getElementById('tripDate').value = formattedDate;
        
        document.getElementById('totalSeats').value = trip.totalSeats;
        document.getElementById('availableSeats').value = trip.availableSeats;
        
        tripModal.style.display = 'flex';
    }
}

// Delete trip
function deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
        trips = trips.filter(trip => trip.id !== tripId);
        renderTripsTable();
    }
}

// Close modal
function closeModalFunc() {
    tripModal.style.display = 'none';
}

// Format date from YYYY-MM-DD to "DD MMM" format
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'APR', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    
    return `${day} ${month}`;
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}