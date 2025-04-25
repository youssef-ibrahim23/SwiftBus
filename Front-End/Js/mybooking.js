document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        filterBookings(this.dataset.filter);
      });
    });
    
    // Booking data - in a real app, this would come from an API
    const bookings = [
      {
        id: 1,
        from: 'Cairo',
        to: 'Alexandria',
        date: 'Wed, April 29, 2025',
        departureTime: '08:00 AM',
        arrivalTime: '11:30 AM',
        price: 250,
        passengers: 2,
        status: 'pending',
        busType: 'Volvo AC',
        busNumber: 'Swift-12',
        isExpress: true
      },
      {
        id: 2,
        from: 'Cairo',
        to: 'Alexandria',
        date: 'Wed, April 29, 2025',
        departureTime: '10:00 AM',
        arrivalTime: '01:30 PM',
        price: 200,
        passengers: 1,
        status: 'accepted',
        busType: 'Mercedes',
        busNumber: 'Swift-15'
      },
      {
        id: 3,
        from: 'Cairo',
        to: 'Alexandria',
        date: 'Wed, April 29, 2025',
        departureTime: '02:00 PM',
        arrivalTime: '05:30 PM',
        price: 220,
        passengers: 3,
        status: 'accepted',
        busType: 'Volvo AC',
        busNumber: 'Swift-18',
        isExpress: true
      },
      {
        id: 4,
        from: 'Cairo',
        to: 'Alexandria',
        date: 'Wed, April 29, 2025',
        departureTime: '06:00 PM',
        arrivalTime: '09:30 PM',
        price: 280,
        passengers: 2,
        status: 'pending',
        busType: 'VIP Luxury',
        busNumber: 'Swift-22'
      },
      {
        id: 5,
        from: 'Cairo',
        to: 'Alexandria',
        date: 'Wed, April 29, 2025',
        departureTime: '11:00 PM',
        arrivalTime: '02:30 AM',
        price: 300,
        passengers: 1,
        status: 'cancelled',
        busType: 'Sleeper Bus',
        busNumber: 'Swift-25'
      }
    ];
    
    // Render bookings
    const bookingsContainer = document.getElementById('bookingsContainer');
    
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
        if (booking.isExpress) {
          badges += '<span class="trip-badge express-badge">Express</span>';
        }
        
        let actionButton = '';
        if (booking.status === 'pending') {
          actionButton = `
            <button class="action-btn cancel-btn" data-id="${booking.id}">
              <i class="fas fa-times"></i> Cancel
            </button>
          `;
        } else if (booking.status === 'accepted') {
          actionButton = `
            <button class="action-btn download-btn" data-id="${booking.id}">
              <i class="fas fa-download"></i> Download Ticket
            </button>
          `;
        }
        
        bookingCard.innerHTML = `
          ${badges}
          <div class="route-title">
            ${booking.from} <i class="fas fa-arrow-right arrow"></i> ${booking.to}
          </div>
          <div class="booking-info">
            <div class="info-row">
              <i class="fas fa-clock"></i>
              <span>${booking.departureTime} - ${booking.arrivalTime}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-calendar-day"></i>
              <span>${booking.date}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-bus"></i>
              <span>${booking.busType} (${booking.busNumber})</span>
            </div>
            <div class="info-row">
              <i class="fas fa-user"></i>
              <span>${booking.passengers} passenger${booking.passengers > 1 ? 's' : ''}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-info-circle"></i>
              <span>Status: <span class="status-text">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></span>
            </div>
          </div>
          <div class="booking-footer">
            <span class="price">${booking.price * booking.passengers} EGP</span>
            ${actionButton}
          </div>
        `;
        
        bookingsContainer.appendChild(bookingCard);
      });
      
      // Add event listeners to action buttons
      document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
          const bookingId = parseInt(this.dataset.id);
          openConfirmationModal(bookingId);
        });
      });
      
      document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', function() {
          const bookingId = parseInt(this.dataset.id);
          alert(`Downloading ticket for booking #${bookingId}`);
        });
      });
    }
    
    // Filter bookings
    function filterBookings(filter) {
      if (filter === 'all') {
        renderBookings(bookings);
        return;
      }
      
      const filteredBookings = bookings.filter(booking => booking.status === filter);
      renderBookings(filteredBookings);
    }
    
    // Confirmation modal
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
    
    closeModal.addEventListener('click', closeConfirmationModal);
    cancelModalBtn.addEventListener('click', closeConfirmationModal);
    
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeConfirmationModal();
      }
    });
    
    confirmCancelBtn.addEventListener('click', function() {
      // In a real app, this would send a request to the server
      const bookingIndex = bookings.findIndex(b => b.id === currentBookingId);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'cancelled';
        renderBookings(bookings);
        alert(`Booking #${currentBookingId} has been cancelled.`);
      }
      closeConfirmationModal();
    });
    
    // Initial render
    renderBookings(bookings);
  });