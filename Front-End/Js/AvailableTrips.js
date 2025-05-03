document.addEventListener("DOMContentLoaded", () => {
  const tripContainer = document.getElementById("tripContainer");
  const searchParams = JSON.parse(localStorage.getItem("searchParams")) || {};
  const filterControls = document.getElementById("filterControls");
  const searchSummary = document.getElementById("searchSummary");

  let trips = JSON.parse(sessionStorage.getItem("searchedTrips")) || 
              JSON.parse(localStorage.getItem("filteredTrips")) || [];

              let passengers = localStorage.getItem("passengers");

  const errorContainer = createErrorContainer();

  init();

  function init() {
    if (trips.length === 0) {
      showNoTripsMessage();
      return;
    }
    displaySearchSummary(searchParams);
    setupFilters();
    renderTrips(trips);
  }

  function createErrorContainer() {
    let container = document.getElementById("errorContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "errorContainer";
      container.className = "error-container";
      container.setAttribute("role", "alert");
      container.setAttribute("aria-live", "assertive");
      document.body.appendChild(container);
    }
    return container;
  }

  function showErrorToUser(message) {
    errorContainer.textContent = message;
    errorContainer.classList.add("visible");
    setTimeout(() => {
      errorContainer.classList.remove("visible");
    }, 5000);
  }

  function showNoTripsMessage() {
    tripContainer.innerHTML = `
      <div class="no-trips-message">
        <i class="fas fa-bus-slash"></i>
        <h2>No trips found</h2>
        <p>We couldn't find any trips matching your search criteria.</p>
        <a href="home.html" class="return-home-btn">
          <i class="fas fa-arrow-left"></i> Modify Search
        </a>
      </div>
    `;
  }

  function displaySearchSummary(params) {
    if (!searchSummary) return;

    searchSummary.innerHTML = `
      <h3>Your Search</h3>
      <div class="search-summary-details">
        ${params.origin ? `<p><strong>From:</strong> ${params.origin}</p>` : ''}
        ${params.destination ? `<p><strong>To:</strong> ${params.destination}</p>` : ''}
        ${params.date ? `<p><strong>Date:</strong> ${formatDate(params.date)}</p>` : ''}
        ${params.returnDate ? `<p><strong>Return:</strong> ${formatDate(params.returnDate)}</p>` : ''}
        ${params.passengers ? `<p><strong>Passengers:</strong> ${params.passengers}</p>` : ''}
      </div>
      <button id="modifySearchBtn" class="modify-search-btn">
        <i class="fas fa-edit"></i> Modify Search
      </button>
    `;

    document.getElementById("modifySearchBtn")?.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

  function setupFilters() {
    if (!filterControls) return;

    const busTypes = [...new Set(trips.map(trip => trip.bus?.type || "Standard"))];
    const maxPrice = getMaxPrice();

    filterControls.innerHTML = `
      <div class="filter-group">
        <label for="busTypeFilter">Bus Type:</label>
        <select id="busTypeFilter">
          <option value="">All Types</option>
          ${busTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="priceFilter">Max Price:</label>
        <input type="range" id="priceFilter" min="0" max="${maxPrice}" value="${maxPrice}">
        <span id="priceFilterValue">${maxPrice} EGP</span>
      </div>
      <div class="filter-group">
        <label for="sortBy">Sort By:</label>
        <select id="sortBy">
          <option value="departure-asc">Departure (Earliest First)</option>
          <option value="departure-desc">Departure (Latest First)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="duration-asc">Duration (Shortest First)</option>
        </select>
      </div>
    `;

    document.getElementById("busTypeFilter").addEventListener("change", applyFilters);
    document.getElementById("priceFilter").addEventListener("input", (e) => {
      document.getElementById("priceFilterValue").textContent = `${e.target.value} EGP`;
      applyFilters();
    });
    document.getElementById("sortBy").addEventListener("change", applyFilters);
  }

  function getMaxPrice() {
    return Math.max(...trips.map(t => t.price || 0), 1000);
  }

  function applyFilters() {
    const busType = document.getElementById("busTypeFilter").value;
    const price = parseInt(document.getElementById("priceFilter").value) || getMaxPrice();
    const sortBy = document.getElementById("sortBy").value;

    let filtered = [...trips];

    if (busType) {
      filtered = filtered.filter(trip => trip.bus?.type === busType);
    }

    filtered = filtered.filter(trip => trip.price <= price);
    filtered = sortTrips(filtered, sortBy);

    renderTrips(filtered);

    if (filtered.length === 0) {
      tripContainer.innerHTML = `<p class="no-results-message">No trips match your filters.</p>`;
    }
  }

  function sortTrips(arr, sortBy) {
    return arr.sort((a, b) => {
      switch (sortBy) {
        case "departure-asc":
          return new Date(a.departureTime) - new Date(b.departureTime);
        case "departure-desc":
          return new Date(b.departureTime) - new Date(a.departureTime);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "duration-asc":
          return getTripDuration(a) - getTripDuration(b);
        default:
          return 0;
      }
    });
  }

  function renderTrips(tripsToRender) {
    tripContainer.innerHTML = "";
    tripsToRender.forEach(trip => {
      const card = document.createElement("div");
      card.className = "trip-card";

      card.innerHTML = `
        <div class="trip-title">${trip.title || `${trip.origin} → ${trip.destination}`}</div>
        <div class="trip-details">
          <p><strong>From:</strong> ${trip.origin}</p>
          <p><strong>To:</strong> ${trip.destination}</p>
          <p><strong>Date:</strong> ${formatDate(trip.date)}</p>
          <p><strong>Duration:</strong> ${trip.duration || 'N/A'} h</p>
          <p><strong>Price:</strong> $${trip.price}</p>
        </div>
        <button class="book-btn" data-trip-id="${trip.tripId}">Book Now</button>
      `;

      tripContainer.appendChild(card);
    });

    document.querySelectorAll(".book-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tripId = e.target.getAttribute("data-trip-id");
        openBookingModal(tripId);
      });
    });
  }

  function openBookingModal(tripId) {
    const modal = document.getElementById("bookingModal");
    const modalContent = document.getElementById("modalContent");
    const passengers = localStorage.getItem("passengers");
    console.log("Selected tripId:", tripId);
  
    const trip = trips.find(t => t.tripId == tripId); // <-- FIX
    if (!trip) {
      showErrorToUser("Trip not found.");
      return;
    }
  
    modalContent.innerHTML = `
      <p><strong>Trip:</strong> ${trip.origin} → ${trip.destination}</p>
      <p><strong>Date:</strong> ${trip.date}</p>
      <p><strong>Price:</strong> $${trip.price}</p>
      <p><strong>Passengers:</strong> $${passengers}</p>
    `;
  
    modal.style.display = "flex";
  
    document.getElementById("confirmBookingBtn").onclick = async () => {
      const userString = localStorage.getItem("user");
  
      if (!userString) {
        showErrorToUser("User not logged in.");
        return;
      }
  
      const user = JSON.parse(userString);
  
      if (!user || !trip || !passengers || passengers <= 0) {
        showErrorToUser("Missing or invalid booking data.");
        return;
      }
  
      const bookingData = {
        user: { userId: user.userId },
        trip: { tripId: trip.tripId },
        passengers: passengers
      };
  
      try {
        const response = await fetch("http://localhost:8081/api/traveler/book-trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bookingData)
        });
  
        const result = await response.text();
  
        if (response.ok) {
          
          alert(result);
          localStorage.removeItem("passengers");
        } else {
          showErrorToUser("Booking failed: " + result);
        }
      } catch (error) {
        showErrorToUser("Booking failed: " + error.message);
      } finally {
        modal.style.display = "none";
      }
    };
  
    document.getElementById("cancelBookingBtn").onclick = () => {
      modal.style.display = "none";
    };
    document.getElementById("closeModalBtn").onclick = () => {
      modal.style.display = "none";
    };  
    
    
    document.getElementById("cancelBookingBtn").onclick = () => {
      modal.style.display = "none";
    };
    document.getElementById("closeModalBtn").onclick = () => {
      modal.style.display = "none";
    };
  }

  function getTripDuration(trip) {
    const start = new Date(trip.departureTime);
    const end = new Date(trip.arrivalTime);
    return (end - start) / (1000 * 60 * 60); // hours
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  }
});
