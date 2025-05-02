// Data for trips (could be fetched from API)
const trips = [
    {
      id: 1,
      bookingId: 1,
      from: 'Cairo',
      to: 'Alexandria',
      date: 'Wednesday, April 29, 2025',
      price: '250 EGP',
      busType: 'VIP Air-conditioned',
      departureTime: '08:00 AM',
      seatsAvailable: 12,
    },
    {
      id: 2,
      bookingId: 2,
      from: 'Giza',
      to: 'Luxor',
      date: 'Friday, May 10, 2025',
      price: '400 EGP',
      busType: 'Regular Air-conditioned',
      departureTime: '10:30 AM',
      seatsAvailable: 20,
    },
    {
      id: 3,
      bookingId: 3,
      from: 'Alexandria',
      to: 'Sharm El Sheikh',
      date: 'Sunday, May 18, 2025',
      price: '600 EGP',
      busType: 'VIP Air-conditioned with WiFi',
      departureTime: '07:00 PM',
      seatsAvailable: 8,
    },
    {
      id: 4,
      bookingId: 4,
      from: 'Aswan',
      to: 'Cairo',
      date: 'Tuesday, June 3, 2025',
      price: '550 EGP',
      busType: 'Regular Air-conditioned',
      departureTime: '06:00 AM',
      seatsAvailable: 15,
    },
    {
      id: 5,
      bookingId: 5,
      from: 'Luxor',
      to: 'Giza',
      date: 'Saturday, June 15, 2025',
      price: '420 EGP',
      busType: 'VIP Air-conditioned',
      departureTime: '09:00 AM',
      seatsAvailable: 10,
    },
    {
      id: 6,
      bookingId: 6,
      from: 'Sharm El Sheikh',
      to: 'Alexandria',
      date: 'Wednesday, June 25, 2025',
      price: '620 EGP',
      busType: 'VIP Air-conditioned with WiFi',
      departureTime: '08:00 PM',
      seatsAvailable: 5,
    },
  ];

  // Modal elements
  const bookingModal = document.getElementById('bookingModal');
  const modalContent = document.getElementById('modalContent');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');
  const cancelBookingBtn = document.getElementById('cancelBookingBtn');

  let selectedTrip = null;

  // Show modal with trip details
  function openBookingModal(tripId) {
    selectedTrip = trips.find((trip) => trip.id === tripId);
    if (!selectedTrip) return;

    modalContent.innerHTML = `
      <p><strong>Trip ID:</strong> ${selectedTrip.id}</p>
      <p><strong>Booking ID:</strong> ${selectedTrip.bookingId}</p>
      <p><strong>From:</strong> ${selectedTrip.from}</p>
      <p><strong>To:</strong> ${selectedTrip.to}</p>
      <p><strong>Date:</strong> ${selectedTrip.date}</p>
      <p><strong>Price:</strong> ${selectedTrip.price}</p>
      <p><strong>Bus Type:</strong> ${selectedTrip.busType}</p>
      <p><strong>Departure Time:</strong> ${selectedTrip.departureTime}</p>
      <p><strong>Seats Available:</strong> ${selectedTrip.seatsAvailable}</p>
    `;

    bookingModal.style.display = 'flex';
    bookingModal.focus();
  }

  // Close modal
  function closeBookingModal() {
    bookingModal.style.display = 'none';
    selectedTrip = null;
  }

  // Confirm booking action
  function confirmBooking() {
    if (!selectedTrip) return;
    alert(
      `Your trip from ${selectedTrip.from} to ${selectedTrip.to} on ${selectedTrip.date} has been successfully booked!`
    );
    closeBookingModal();
  }

  // Event delegation for all "Book Now" buttons
  document.querySelectorAll('.book-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const tripId = parseInt(e.currentTarget.getAttribute('data-trip-id'));
      openBookingModal(tripId);
    });
  });

  // Close modal events
  closeModalBtn.addaEventListener('click', closeBookingModal);
  cancelBookingBtn.addEventListener('click', closeBookingModal);

  // Confirm booking event
  confirmBookingBtn.addEventListener('click', confirmBooking);

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.style.display !== 'none') {
      closeBookingModal();
    }
  });

  // Logout button interaction
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      // Redirect to logout or home page
      window.location.href = 'logout.html';
    }
  });