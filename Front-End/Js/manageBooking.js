// State management
const bookingManager = {
    allBookings: [],
    currentFilter: ''
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.userId) {
    console.log(user);
    alert("You're not logged in.");
    window.location.href = 'login.html';
    return;
  }
    fetchAndDisplayBookings();
    setupEventListeners();
});

// Fetch bookings from API
async function fetchAndDisplayBookings() {
    const tableBody = document.getElementById('bookingTableBody');
    showLoadingState(tableBody);
    
    try {
        const response = await fetch('http://localhost:8081/api/admin/bookings');
        if (!response.ok) throw new Error(`Failed to fetch bookings: ${response.status}`);
        
        bookingManager.allBookings = await response.json();
        renderBookingsTable(bookingManager.allBookings);
        
    } catch (error) {
        showErrorState(tableBody, error);
        console.error('Error loading bookings:', error);
    }
}

// Show loading state
function showLoadingState(container) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <div class="spinner"></div>
                Loading bookings...
            </td>
        </tr>`;
}

// Show error state
function showErrorState(container, error) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="error">
                <i class="fas fa-exclamation-circle"></i>
                Error loading bookings: ${error.message}
                <button class="btn-retry" onclick="fetchAndDisplayBookings()">Retry</button>
            </td>
        </tr>`;
}

// Render bookings table
function renderBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingTableBody');
    tableBody.innerHTML = '';

    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="fas fa-info-circle"></i>
                    No bookings found
                </td>
            </tr>`;
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.dataset.bookingId = booking.bookingId;

        // Format booking date
        const bookingDate = new Date(booking.booking_date);
        const formattedDate = bookingDate.toLocaleDateString();
        const formattedTime = bookingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Format status
        let statusBadge;
        switch(booking.status.toLowerCase()) {
            case 'approved':
                statusBadge = '<span class="status-badge status-confirmed">Confirmed</span>';
                break;
            case 'pending':
                statusBadge = '<span class="status-badge status-pending">Pending</span>';
                break;
            case 'reject':
                statusBadge = '<span class="status-badge status-cancelled">Cancelled</span>';
                break;
            default:
                statusBadge = `<span>${booking.status}</span>`;
        }

        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.user.userId}</td>
            <td>${booking.trip.tripId}</td>
            <td>${statusBadge}</td>
            <td>
                <div>${formattedDate}</div>
                <div class="text-muted">${formattedTime}</div>
            </td>
            <td>${booking.passengers}</td>
            <td>${booking.price.toFixed(2)} EGP</td>
            <td class="actions">
                <button class="btn-action btn-view" data-booking-id="${booking.id}" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterBookings(searchInput.value.toLowerCase());
        }
    });

    // Event delegation for view buttons
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-view');
        if (!btn) return;

        const bookingId = btn.dataset.bookingId;
        if (!bookingId) return;

        showBookingDetails(bookingId);
    });
}

// Filter bookings
function filterBookings(searchTerm) {
    bookingManager.currentFilter = searchTerm;
    
    const filteredBookings = bookingManager.allBookings.filter(booking => 
        booking.id.toString().includes(searchTerm) ||
        booking.user.userId.toString().includes(searchTerm) ||
        booking.trip.tripId.toString().includes(searchTerm) ||
        booking.status.toLowerCase().includes(searchTerm)
    );
    
    renderBookingsTable(filteredBookings);
}

// Function to show booking details in modal
// Function to show booking details in modal
function showBookingDetails(bookingId) {
    // Find the booking in our data
    const booking = bookingManager.allBookings.find(b => b.id == bookingId);
    if (!booking) {
        console.error('Booking not found');
        return;
    }

    // Format the booking date
    const bookingDate = new Date(booking.booking_date);
    const formattedDate = bookingDate.toLocaleDateString();
    const formattedTime = bookingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Set status badge based on booking status
    let statusBadge;
    switch(booking.status.toLowerCase()) {
        case 'approved':
            statusBadge = '<span class="status-badge status-confirmed">Confirmed</span>';
            break;
        case 'pending':
            statusBadge = '<span class="status-badge status-pending">Pending</span>';
            break;
        case 'reject':
            statusBadge = '<span class="status-badge status-cancelled">Cancelled</span>';
            break;
        default:
            statusBadge = `<span>${booking.status}</span>`;
    }

    // Populate all modal fields with proper data from JSON structure
    document.getElementById('viewBookingId').textContent = booking.id;
    document.getElementById('viewUserId').textContent = booking.user.userName;
    document.getElementById('viewTripId').textContent = `${booking.trip.origin} → ${booking.trip.destination}`;
    document.getElementById('viewBus').textContent = `${booking.trip.bus.model} (ID: ${booking.trip.bus.busId})`;
    document.getElementById('viewDriver').textContent = `${booking.trip.driver.userName} (ID: ${booking.trip.driver.userId})`;
    document.getElementById('viewStatus').innerHTML = statusBadge;
    document.getElementById('viewBookingDate').textContent = `${formattedDate} at ${formattedTime}`;
    document.getElementById('viewPassengers').textContent = booking.passengers;
    document.getElementById('viewPrice').textContent = `${booking.price.toFixed(2)} EGP`;
    document.getElementById('viewPaymentMethod').textContent = 'Credit Card';

    // Show the modal
    document.getElementById('viewBookingModal').style.display = 'flex';
}

// Function to close any modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add click handler for the close button (alternative to inline onclick)
document.querySelector('#viewBookingModal .close').addEventListener('click', function() {
    closeModal('viewBookingModal');
});

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('viewBookingModal')) {
        closeModal('viewBookingModal');
    }
});