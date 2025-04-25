document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    
    // Trip Type Toggle
    const oneWayBtn = document.getElementById('oneWayBtn');
    const roundTripBtn = document.getElementById('roundTripBtn');
    
    oneWayBtn.addEventListener('click', function() {
        oneWayBtn.classList.remove('inactive');
        oneWayBtn.classList.add('active');
        roundTripBtn.classList.remove('active');
        roundTripBtn.classList.add('inactive');
    });
    
    roundTripBtn.addEventListener('click', function() {
        roundTripBtn.classList.remove('inactive');
        roundTripBtn.classList.add('active');
        oneWayBtn.classList.remove('active');
        oneWayBtn.classList.add('inactive');
    });
    
    // Passenger Counter
    const decreaseBtn = document.getElementById('decreasePassengers');
    const increaseBtn = document.getElementById('increasePassengers');
    const passengerCount = document.getElementById('passengerCount');
    let passengers = 1;
    
    decreaseBtn.addEventListener('click', function() {
        if (passengers > 1) {
            passengers--;
            passengerCount.textContent = passengers;
            validateForm();
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        if (passengers < 10) {
            passengers++;
            passengerCount.textContent = passengers;
            validateForm();
        } else {
            alert('Maximum 10 passengers per booking');
        }
    });
    
    // Date Input - Set minimum date to tomorrow
    const dateInput = document.getElementById('date');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formattedDate = tomorrow.toISOString().split('T')[0];
    dateInput.value = formattedDate;
    dateInput.min = formattedDate;
    
    // Form Validation
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const searchBtn = document.getElementById('searchBtn');
    
    fromSelect.addEventListener('change', validateForm);
    toSelect.addEventListener('change', validateForm);
    dateInput.addEventListener('change', validateForm);
    
    function validateForm() {
        if (fromSelect.value === toSelect.value) {
            searchBtn.disabled = true;
            searchBtn.classList.remove('enabled');
        } else {
            searchBtn.disabled = false;
            searchBtn.classList.add('enabled');
        }
    }
    
    // Search Button
    searchBtn.addEventListener('click', function(e) {
        if (searchBtn.disabled) {
            e.preventDefault();
            alert('Please select different departure and arrival locations');
        } else {
            // In a real app, this would redirect with search parameters
            window.location.href = 'Avilabletrips.html';
        }
    });
    
    // Initialize form validation
    validateForm();
});