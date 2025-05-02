// HomePage.js
document.addEventListener('DOMContentLoaded', function() {
    // Fetch dashboard stats when page loads
    fetchDashboardStats();
    fetchPendingBookings();
});

// Function to toggle menu items
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    menu.classList.toggle('show');
}

// Fetch dashboard statistics from API
async function fetchDashboardStats() {
    try {
        const response = await fetch('http://localhost:8081/api/dashboard/stats');
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        
        // Update the dashboard cards with real data
        document.getElementById('totalUsers').textContent = data.totalUsers;
        document.getElementById('totalTrips').textContent = data.totalTrips;
        document.getElementById('pendingBookings').textContent = data.pendingBookings;
        document.getElementById('totalFeedback').textContent = data.totalFeedbacks;
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // You might want to show an error message to the user here
    }
}

// Fetch pending bookings from API
async function fetchPendingBookings() {
    try {
        const response = await fetch('http://localhost:8081/api/dashboard/bookings/pending');
        if (!response.ok) {
            throw new Error('Failed to fetch pending bookings');
        }
        const bookings = await response.json();
        
        // Clear the existing table rows (except header)
        const tableBody = document.querySelector('#bookingTable tbody');
        tableBody.innerHTML = '';
        
        // Populate the table with the fetched bookings
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${booking.id || 'N/A'}</td>
                <td>${booking.user.userName}</td>
                <td>${booking.trip.origin} to ${booking.trip.destination}</td>
                <td>${formatDate(booking.booking_date)}</td>
                <td><span class="status-pending">Pending</span></td>
                <td>
                    <button class="action-btn btn-confirm" onclick="updateBookingStatus('${booking.id}', 'approve')">Confirm</button>
                    <button class="action-btn btn-cancel" onclick="updateBookingStatus('${booking.id}', 'reject')">Cancel</button>
                    <button class="action-btn btn-view" onclick="viewBookingDetails('${booking.id}')">View</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error fetching pending bookings:', error);
        // You might want to show an error message to the user here
    }
}

// Function to update booking status
async function updateBookingStatus(bookingId, newStatus) {
    try {
        // You'll need to implement this endpoint in your backend
        const response = await fetch(`http://localhost:8081/api/admin/bookings/${bookingId}/${newStatus}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to update booking status');
        }
        
        // Refresh the pending bookings list
        fetchPendingBookings();
        // Refresh dashboard stats (pending bookings count might have changed)
        fetchDashboardStats();
        
        // Show success message
        alert(`Booking ${bookingId} has been ${newStatus.toLowerCase()}`);
        
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status');
    }
}

// Function to view booking details
function viewBookingDetails(bookingId) {
    // You can implement this to show more details in a modal or navigate to a details page
    alert(`Viewing details for booking ${bookingId}`);
    // window.location.href = `/booking-details.html?id=${bookingId}`;
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}