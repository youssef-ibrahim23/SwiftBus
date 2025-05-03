document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchBtn = document.getElementById('searchBtn');
  const fromSelect = document.getElementById('from');
  const toSelect = document.getElementById('to');
  const dateInput = document.getElementById('date');
  const passengerCount = document.getElementById('passengerCount');
  const decreasePassengers = document.getElementById('decreasePassengers');
  const increasePassengers = document.getElementById('increasePassengers');
  const oneWayBtn = document.getElementById('oneWayBtn');
  const roundTripBtn = document.getElementById('roundTripBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  // Create error container
  let errorContainer = document.getElementById('errorContainer');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'errorContainer';
    errorContainer.style.display = 'none';
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '20px';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translateX(-50%)';
    errorContainer.style.padding = '15px';
    errorContainer.style.backgroundColor = '#ff6b6b';
    errorContainer.style.color = 'white';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.zIndex = '1000';
    errorContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    document.body.appendChild(errorContainer);
  }

  let isRoundTrip = false;

  // Show error messages
  function showErrorToUser(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
  }

  // Fetch locations from API
  async function fetchLocations() {
    try {
      const [originsResponse, destinationsResponse] = await Promise.all([
        fetch('http://localhost:8081/api/traveler/trips/origins'),
        fetch('http://localhost:8081/api/traveler/trips/destinations')
      ]);
  
      if (!originsResponse.ok || !destinationsResponse.ok) {
        throw new Error('Failed to fetch location data');
      }
  
      const origins = await originsResponse.json();
      const destinations = await destinationsResponse.json();
  
      populateSelect(fromSelect, origins, '-- Select Origin --');
      populateSelect(toSelect, destinations, '-- Select Destination --');
    } catch (error) {
      console.error('Error fetching locations:', error);
      showErrorToUser('Failed to load locations.');
    }
  }
  

  // Populate select dropdown
  function populateSelect(selectElement, items, defaultText) {
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  }

  // Validate form
  function validateForm() {
    if (!fromSelect.value || !toSelect.value || !dateInput.value) {
      return false;
    }
    if (fromSelect.value === toSelect.value) {
      showErrorToUser('Origin and destination cannot be the same');
      return false;
    }
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showErrorToUser('Please select a future date');
      return false;
    }
    const passengers = parseInt(passengerCount.textContent);
    if (isNaN(passengers) || passengers < 1) {
      showErrorToUser('Invalid passenger count');
      return false;
    }
    return true;
  }

  function handleInputChange() {
    searchBtn.disabled = !validateForm();
  }

  function toggleTripType() {
    oneWayBtn.classList.toggle('active');
    oneWayBtn.classList.toggle('inactive');
    roundTripBtn.classList.toggle('active');
    roundTripBtn.classList.toggle('inactive');
    isRoundTrip = !isRoundTrip;
  }

  function handlePassengerChange(increment) {
    let count = parseInt(passengerCount.textContent) || 1;
    count = increment ? count + 1 : Math.max(1, count - 1);
    passengerCount.textContent = count;
    handleInputChange();
  }

  function toggleMobileMenu() {
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
  }

  async function searchTrips() {
    const searchParams = {
      origin: fromSelect.value.trim(),
      destination: toSelect.value.trim(),
      date: dateInput.value.trim(),
      passengers: parseInt(passengerCount.textContent) || 1
    };

    try {
      console.log(searchParams);
      const response = await fetch('http://localhost:8081/api/traveler/trips/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
      });

      console.log(response.json);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const trips = await response.json();

      if (trips.length === 0) {
        showErrorToUser('No trips found matching your criteria');
        return [];
      }

      return trips;
    } catch (error) {
      console.error('Search error:', error);
      showErrorToUser('Failed to search trips. Please try again later.');
      return [];
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const filteredTrips = await searchTrips();
      if (filteredTrips.length > 0) {
        localStorage.setItem('filteredTrips', JSON.stringify(filteredTrips));
        localStorage.setItem('passengers', parseInt(passengerCount.textContent));
        console.log(passengerCount.textContent);
        window.location.href = 'Avilabletrips.html';
      }
    } catch (error) {
      console.error('Search failed:', error);
      showErrorToUser('Error during trip search.');
    }
  }

  function init() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    handleInputChange();
    fetchLocations();
  }

  // Event listeners
  fromSelect.addEventListener('change', handleInputChange);
  toSelect.addEventListener('change', handleInputChange);
  dateInput.addEventListener('change', handleInputChange);
  searchBtn.addEventListener('click', handleSearch);
  decreasePassengers.addEventListener('click', () => handlePassengerChange(false));
  increasePassengers.addEventListener('click', () => handlePassengerChange(true));
  oneWayBtn.addEventListener('click', toggleTripType);
  roundTripBtn.addEventListener('click', toggleTripType);
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== mobileMenuBtn) {
      mobileMenu.style.display = 'none';
    }
  });

  init();
});
