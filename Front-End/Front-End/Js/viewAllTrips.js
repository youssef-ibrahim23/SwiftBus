// State management
const tripManager = {
    allTrips: [],
    currentPage: 1,
    tripsPerPage: 10,
    currentFilter: '',
    buses: [],
    drivers: []
  };

  document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    fetchAndDisplayTrips();
    setupEventListeners();
  });

  async function fetchAndDisplayTrips() {
    const tableBody = document.getElementById('tripsTableBody');
    showLoadingState(tableBody);
    
    try {
      // Fetch trips, buses, and drivers in parallel
      const [tripsResponse, busesResponse, driversResponse] = await Promise.all([
        fetch('http://localhost:8081/api/admin/trips'),
        fetch('http://localhost:8081/api/admin/buses'),
        fetch('http://localhost:8081/api/admin/users')
      ]);

      if (!tripsResponse.ok) throw new Error(`Failed to fetch trips: ${tripsResponse.status}`);
      if (!busesResponse.ok) throw new Error(`Failed to fetch buses: ${busesResponse.status}`);
      if (!driversResponse.ok) throw new Error(`Failed to fetch drivers: ${driversResponse.status}`);

      tripManager.allTrips = await tripsResponse.json();
      tripManager.buses = await busesResponse.json();
      tripManager.drivers = await driversResponse.json();

      if (!Array.isArray(tripManager.allTrips)) {
        throw new Error('Invalid trips data format from API');
      }

      renderTripsTable(tripManager.allTrips);
      
    } catch (error) {
      showErrorState(tableBody, error);
      console.error('Error loading trips:', error);
    }
  }

  function showLoadingState(container) {
    container.innerHTML = `
      <tr>
        <td colspan="9" class="loading">
          <div class="spinner"></div>
          Loading trips...
        </td>
      </tr>`;
  }

  function showErrorState(container, error) {
    container.innerHTML = `
      <tr>
        <td colspan="9" class="error">
          <i class="fas fa-exclamation-circle"></i>
          Error loading trips: ${error.message}
          <button class="btn-retry" onclick="fetchAndDisplayTrips()">Retry</button>
        </td>
      </tr>`;
  }

  function renderTripsTable(trips) {
    const tableBody = document.getElementById('tripsTableBody');
    tableBody.innerHTML = '';

    if (trips.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="no-data">
            <i class="fas fa-info-circle"></i>
            No trips found
          </td>
        </tr>`;
      return;
    }

    trips.forEach(trip => {
      const row = document.createElement('tr');
      row.dataset.tripId = trip.tripId;

      // Format date and time
      const tripDate = new Date(trip.date);
      const formattedDate = tripDate.toLocaleDateString();
      const formattedTime = tripDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      // Format duration
      const durationHours = Math.floor(trip.duration / 60);
      const durationMinutes = trip.duration % 60;
      const formattedDuration = `${durationHours}h ${durationMinutes}m`;
      
      // Format status
      const statusBadge = trip.status ? 
        '<span class="status-badge status-active">Active</span>' : 
        '<span class="status-badge status-inactive">Inactive</span>';

      row.innerHTML = `
        
        <td>${trip.origin}</td>
        <td>${trip.destination}</td>
        <td>
          <div>${formattedDate}</div>
          <div class="text-muted">${formattedTime}</div>
        </td>
        <td>${formattedDuration}</td>
        <td>${trip.price.toFixed(2)} EGP</td>
        <td>${trip.availableSeats} / ${trip.totalSeats}</td>
        <td>${statusBadge}</td>
        <td class="actions">
          <button class="btn-action btn-view" data-trip-id="${trip.tripId}" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-action btn-edit" data-trip-id="${trip.tripId}" title="Edit Trip">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" data-trip-id="${trip.tripId}" title="Delete Trip">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchBtn.addEventListener('click', () => {
      const searchTerm = searchInput.value.toLowerCase();
      filterTrips(searchTerm);
    });
    
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        filterTrips(searchInput.value.toLowerCase());
      }
    });

    // Modal close buttons
    document.getElementById('closeModal')?.addEventListener('click', () => closeModal('tripModal'));
    document.getElementById('cancelBtn')?.addEventListener('click', () => closeModal('tripModal'));

    // Form submission
    const tripForm = document.getElementById('tripForm');
    if (tripForm) {
      tripForm.addEventListener('submit', handleTripFormSubmit);
    }

    // Event delegation for action buttons
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-action');
      if (!btn) return;

      const tripId = btn.dataset.tripId;
      if (!tripId) return;

      if (btn.classList.contains('btn-view')) {
        showTripDetails(tripId);
      } else if (btn.classList.contains('btn-edit')) {
        showEditTripModal(tripId);
      } else if (btn.classList.contains('btn-delete')) {
        showDeleteConfirmation(tripId);
      }
    });
  }

  function filterTrips(searchTerm) {
    tripManager.currentFilter = searchTerm;
    
    const filteredTrips = tripManager.allTrips.filter(trip => 
      trip.tripId.toString().includes(searchTerm) ||
      trip.origin.toLowerCase().includes(searchTerm) ||
      trip.destination.toLowerCase().includes(searchTerm) ||
      trip.busId.toString().includes(searchTerm) ||
      trip.driverId.toString().includes(searchTerm)
    );
    
    renderTripsTable(filteredTrips);
  }

  // Update the showTripDetails function
function showTripDetails(tripId) {
  const trip = tripManager.allTrips.find(t => t.tripId == tripId);
  if (!trip) return;

  // Find related bus and driver
  const bus = tripManager.buses.find(b => b.busId == trip.busId);
  const driver = tripManager.drivers.find(d => d.userId == trip.driverId);

  const tripDate = new Date(trip.departureTime);
  const formattedDate = tripDate.toLocaleDateString();
  const formattedTime = tripDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  const durationHours = Math.floor(trip.duration / 60);
  const durationMinutes = trip.duration % 60;
  const formattedDuration = `${durationHours}h ${durationMinutes}m`;

  const modalHtml = `
    <div class="modal" id="tripDetailsModal">
      <div class="modal-content">
        <span class="close" onclick="closeModal('tripDetailsModal')">&times;</span>
        <div class="modal-header">
          <h2>Trip Details</h2>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Trip ID:</span>
            <span class="detail-value">${trip.tripId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Route:</span>
            <span class="detail-value">${trip.origin} → ${trip.destination}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Departure:</span>
            <span class="detail-value">${formattedDate} at ${formattedTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${formattedDuration}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">${trip.price.toFixed(2)} EGP</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Seats:</span>
            <span class="detail-value">${trip.availableSeats} / ${trip.totalSeats} available</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value ${trip.status ? 'status-active' : 'status-inactive'}">
              ${trip.status ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Bus:</span>
            <span class="detail-value">${bus?.model || 'N/A'} (ID: ${trip.busId})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Driver:</span>
            <span class="detail-value">${driver?.userName || 'N/A'} (ID: ${trip.driverId})</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="closeModal('tripDetailsModal')">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.getElementById('tripDetailsModal').style.display = 'block';
}

// Update the showEditTripModal function
function showEditTripModal(tripId) {
  const trip = tripManager.allTrips.find(t => t.tripId == tripId);
  if (!trip) return;

  const modal = document.getElementById('tripModal');
  const form = document.getElementById('tripForm');
  
  // Convert departure time to local date string for input
  const tripDate = new Date(trip.departureTime);
  const formattedDate = tripDate.toISOString().slice(0, 16);
  
  // Set form values
  form.querySelector('#tripId').value = trip.tripId;
  form.querySelector('#origin').value = trip.origin;
  form.querySelector('#destination').value = trip.destination;
  form.querySelector('#tripDate').value = trip.date;
  form.querySelector('#duration').value = trip.duration;
  form.querySelector('#price').value = trip.price.toFixed(2);
  form.querySelector('#totalSeats').value = trip.totalSeats;
  form.querySelector('#availableSeats').value = trip.availableSeats;
  form.querySelector('#status').value = trip.status ? 'true' : 'false';
  form.querySelector('#busId').value = trip.bus.busId;
  form.querySelector('#driverId').value = trip.driver.userId;
  
  // Update modal title
  document.getElementById('modalTitle').textContent = 'Edit Trip';
  
  // Show modal
  modal.style.display = 'block';
}

// Update the handleTripFormSubmit function
async function handleTripFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;

  try {
      const tripDate = new Date(form.querySelector('#tripDate').value);
      
      const formData = {
          tripId: parseInt(form.querySelector('#tripId').value),
          origin: form.querySelector('#origin').value,
          destination: form.querySelector('#destination').value,
          duration: parseInt(form.querySelector('#duration').value),
          price: parseFloat(form.querySelector('#price').value),
          totalSeats: parseInt(form.querySelector('#totalSeats').value),
          availableSeats: parseInt(form.querySelector('#availableSeats').value),
          status: form.querySelector('#status').value === 'true',
          busId: parseInt(form.querySelector('#busId').value),
          driverId: parseInt(form.querySelector('#driverId').value)
      };

      const method = formData.tripId ? 'PUT' : 'POST';
      const url = formData.tripId 
          ? 'http://localhost:8081/api/admin/trips'
          : 'http://localhost:8081/api/admin/trips';

      const response = await fetch(url, {
          method: method,
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save trip');
      }

      showNotification('Trip saved successfully', 'success');
      closeModal('tripModal');
      await fetchAndDisplayTrips();
  } catch (error) {
      console.error('Error saving trip:', error);
      showNotification(`Error: ${error.message}`, 'error');
  } finally {
      submitBtn.innerHTML = 'Save Changes';
      submitBtn.disabled = false;
  }
}

  function showDeleteConfirmation(tripId) {
    const trip = tripManager.allTrips.find(t => t.tripId == tripId);
    if (!trip) return;

    const modalHtml = `
      <div class="modal" id="deleteTripModal">
        <div class="modal-content">
          <span class="close" onclick="closeModal('deleteTripModal')">&times;</span>
          <div class="modal-header">
            <h2>Confirm Deletion</h2>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this trip?</p>
            <div class="detail-row">
              <span class="detail-label">Route:</span>
              <span class="detail-value">${trip.origin} → ${trip.destination}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(trip.departureTime).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Trip ID:</span>
              <span class="detail-value">${trip.tripId}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" onclick="closeModal('deleteTripModal')">Cancel</button>
            <button type="button" class="btn btn-danger" onclick="handleDeleteTrip('${tripId}')">Delete</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('deleteTripModal').style.display = 'block';
  }

  async function handleDeleteTrip(tripId) {
    const deleteBtn = document.querySelector('#deleteTripModal .btn-danger');
    
    // Show loading state
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    deleteBtn.disabled = true;

    try {
      const response = await fetch(`http://localhost:8081/api/admin/trips/${tripId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete trip');
      }

      showNotification('Trip deleted successfully', 'success');
      closeModal('deleteTripModal');
      await fetchAndDisplayTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      deleteBtn.innerHTML = 'Delete';
      deleteBtn.disabled = false;
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      // Remove modal from DOM after animation
      setTimeout(() => modal.remove(), 300);
    }
  }

  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

// Global functions (called from HTML)
window.toggleMenu = function(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
};

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
};

window.logout = function() {
    window.location.href = 'login.html';
};
