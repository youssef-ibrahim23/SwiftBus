document.addEventListener('DOMContentLoaded', async function () {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.userId) {
    console.log(user);
    alert("You're not logged in.");
    window.location.href = 'login.html';
    return;
  }

  console.log(user);
  const userId = user.userId;

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  mobileMenuBtn?.addEventListener('click', function () {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      filterBookings(this.dataset.filter);
    });
  });

  const bookingsContainer = document.getElementById('bookingsContainer');
  let bookings = [];

  // Fetch booking history from the backend
  async function fetchBookings() {
    try {
      const response = await fetch(`http://localhost:8081/api/traveler/booking-history/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");

      bookings = await response.json();
      renderBookings(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      bookingsContainer.innerHTML = `
        <div class="no-bookings">
          <i class="fas fa-ticket-alt"></i>
          <h3>Unable to load bookings</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  // Render booking cards in the container
  function renderBookings(bookingsToRender) {
    bookingsContainer.innerHTML = '';

    if (bookingsToRender.length === 0) {
      bookingsContainer.innerHTML = `
        <div class="no-bookings">
          <i class="fas fa-ticket-alt"></i>
          <h3>No bookings found</h3>
          <p>You don't have any bookings matching these filters</p>
        </div>
      `;
      return;
    }

    bookingsToRender.forEach(booking => {
      const bookingCard = document.createElement('div');
      bookingCard.className = `booking-card ${booking.status}`;
      bookingCard.dataset.id = booking.id;

      let badges = '';
      if (booking.express) {
        badges += '<span class="trip-badge express-badge">Express</span>';
      }

      let actionButton = '';
      if (booking.status === 'PENDING') {
        actionButton = `
          <button class="action-btn cancel-btn" data-id="${booking.id}">
            <i class="fas fa-times"></i> Cancel
          </button>
        `;
      } else if (booking.status === 'APPROVED') {
        actionButton = `
          <button class="action-btn download-btn" data-id="${booking.id}">
            <i class="fas fa-download"></i> Download Ticket
          </button>
        `;
      }

      bookingCard.innerHTML = `
        ${badges}
        <div class="route-title">
          ${booking.trip.origin} <i class="fas fa-arrow-right arrow"></i> ${booking.trip.destination}
        </div>
        <div class="booking-info">
          <div class="info-row"><i class="fas fa-clock"></i><span>${booking.trip.duration} - hours</span></div>
          <div class="info-row"><i class="fas fa-calendar-day"></i><span>${booking.trip.date}</span></div>
          <div class="info-row"><i class="fas fa-bus"></i><span>${booking.trip.bus.model} (${booking.trip.bus.busId})</span></div>
          <div class="info-row"><i class="fas fa-user"></i><span>${booking.passengers} passenger${booking.passengers > 1 ? 's' : ''}</span></div>
          <div class="info-row"><i class="fas fa-info-circle"></i><span>Status: <span class="status-text">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></span></div>
        </div>
        <div class="booking-footer">
          <span class="price">${booking.price * booking.passengers} EGP</span>
          ${actionButton}
        </div>
      `;

      bookingsContainer.appendChild(bookingCard);
    });

    // Add event listeners for the buttons in each booking card
    setupBookingCardButtons();
  }

  // Filter bookings based on the selected filter
  function filterBookings(filter) {
    let filteredBookings = [];
    if (filter === 'all') {
      filteredBookings = bookings; // Reset to all bookings
    } else if (['pending', 'approved', 'reject', 'canceled'].includes(filter)) {
      filteredBookings = bookings.filter(booking => booking.status.toLowerCase() === filter);
    }
    renderBookings(filteredBookings);
  }

  // Event listeners for cancel and download actions in the booking cards
  function setupBookingCardButtons() {
    document.querySelectorAll('.cancel-btn').forEach(button => {
      button.addEventListener('click', function () {
        const bookingId = parseInt(this.dataset.id);
        openConfirmationModal(bookingId);
      });
    });

    document.querySelectorAll('.download-btn').forEach(button => {
      button.addEventListener('click', function () {
        const bookingId = parseInt(this.dataset.id);
        downloadTicket(bookingId);
      });
    });
  }

  // Download ticket by calling the backend API
  async function downloadTicket(bookingId) {
    try {
      const response = await fetch(`http://localhost:8081/api/traveler/download-ticket/${bookingId}`);

      if (!response.ok) {
        throw new Error("Failed to download ticket.");
      }

      const pdfBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ticket_${bookingId}.pdf`; // Set filename
      link.click(); // Trigger download
      URL.revokeObjectURL(downloadUrl); // Clean up the URL object
    } catch (err) {
      alert("Error downloading the ticket: " + err.message);
    }
  }

  // Modal controls
  const modal = document.getElementById('confirmationModal');
  const closeModal = document.getElementById('closeModal');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');
  let currentBookingId = null;

  function openConfirmationModal(bookingId) {
    currentBookingId = bookingId;
    modal.style.display = 'flex';
  }

  function closeConfirmationModal() {
    modal.style.display = 'none';
  }

  closeModal?.addEventListener('click', closeConfirmationModal);
  cancelModalBtn?.addEventListener('click', closeConfirmationModal);

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeConfirmationModal();
    }
  });

  confirmCancelBtn?.addEventListener('click', async function () {
    try {
      const response = await fetch(`http://localhost:8081/api/traveler/cancel-booking/${currentBookingId}`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert(`Booking #${currentBookingId} has been cancelled.`);
        await fetchBookings(); // Refresh list
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (err) {
      console.log(currentBookingId);
      console.error(err);
      alert("Server error.");
    }
    closeConfirmationModal();
  });

  // Initial fetch
  fetchBookings();
});
