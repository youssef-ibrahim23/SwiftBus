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

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) {
        alert("You're not logged in.");
        window.location.href = 'login.html';
        return;
    }

    // API endpoint to get all tickets
    const userId = user.userId;
    const apiUrl = `http://localhost:8081/api/traveler/tickets/${userId}`;
    let allTickets = []; // Store tickets for search functionality

    // Function to fetch tickets from the API
    function fetchTickets() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(tickets => {
                allTickets = tickets; // Store for search
                renderTickets(tickets);
            })
            .catch(error => {
                console.error('Error fetching tickets:', error);
            });
    }

    // Render tickets
    const ticketsContainer = document.getElementById('ticketsContainer');

    function renderTickets(ticketsToRender) {
        ticketsContainer.innerHTML = '';

        if (ticketsToRender.length === 0) {
            ticketsContainer.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No tickets available for download</h3>
                    <p>You don't have any confirmed bookings to download</p>
                </div>
            `;
            return;
        }

        ticketsToRender.forEach(ticket => {
            const ticketCard = document.createElement('div');
            ticketCard.className = `booking-card`;
            ticketCard.dataset.id = ticket.id;

            let badges = '';
            if (ticket.isExpress) {
                badges += '<span class="trip-badge express-badge">Express</span>';
            }

            ticketCard.innerHTML = `
                ${badges}
                <div class="route-title">
                    ${ticket.trip.origin} <i class="fas fa-arrow-right arrow"></i> ${ticket.trip.destination}
                </div>
                <div class="booking-info">
                    <div class="info-row">
                        <i class="fas fa-ticket"></i>
                        <span>Booking ID: ${ticket.booking.id}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-clock"></i>
                        <span>${ticket.trip.duration} - hours</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-calendar-day"></i>
                        <span>${ticket.trip.date}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-bus"></i>
                        <span>${ticket.trip.bus.model} (${ticket.trip.bus.busId})</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-user"></i>
                        <span>${ticket.booking.passengers} passenger${ticket.booking.passengers > 1 ? 's' : ''}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-check-circle"></i>
                        <span>Status: <span class="status-badge status-confirmed">Confirmed</span></span>
                    </div>
                </div>
                <div class="booking-footer">
                    <span class="price">${ticket.booking.price} EGP</span>
                    <button class="download-btn" data-id="${ticket.booking.id}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;

            ticketsContainer.appendChild(ticketCard);
        });

        // Add event listeners to download buttons
        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', function() {
                const bookingId = this.dataset.id;
                downloadTicket(bookingId);
            });
        });
    }

    // Initial fetch of tickets from API
    fetchTickets();

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredTickets = allTickets.filter(ticket => {
            return (
                ticket.trip.origin.toLowerCase().includes(searchTerm) ||
                ticket.trip.destination.toLowerCase().includes(searchTerm) ||
                ticket.trip.date.toLowerCase().includes(searchTerm) ||
                ticket.booking.id.toLowerCase().includes(searchTerm)
            );
        });
        renderTickets(filteredTickets);
    });

    // Direct download function
    async function downloadTicket(bookingId, userName, tripId) {
        try {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.textContent = 'Preparing your ticket...';
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '20px';
            loadingIndicator.style.right = '20px';
            loadingIndicator.style.padding = '10px';
            loadingIndicator.style.background = 'white';
            loadingIndicator.style.border = '1px solid #ccc';
            loadingIndicator.style.borderRadius = '5px';
            loadingIndicator.style.zIndex = '1000';
            document.body.appendChild(loadingIndicator);
    
            // Fetch the ticket
            const response = await fetch(`http://localhost:8081/api/traveler/download-ticket/${bookingId}`);
            
            // Remove loading indicator
            document.body.removeChild(loadingIndicator);
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Server responded with status ${response.status}`;
                throw new Error(errorMessage);
            }
    
            // Verify content type
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error(`Unexpected content type: ${contentType}. Expected PDF.`);
            }
    
            const pdfBlob = await response.blob();
    
            // Validate the blob
            if (!pdfBlob || pdfBlob.size === 0) {
                throw new Error("Received empty PDF file");
            }
            if (pdfBlob.type !== 'application/pdf') {
                throw new Error(`Received file type: ${pdfBlob.type}. Expected PDF.`);
            }
    
            // Try two different download methods for maximum compatibility
            try {
                // Method 1: Object URL approach
                const downloadUrl = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = downloadUrl;
    
                // Dynamic file name with user and trip details
                const ticketName = `SwiftBus_Ticket_${bookingId}_user_${userName}_trip_${tripId}.pdf`;
                link.download = ticketName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
    
                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(downloadUrl);
                }, 100);
            } catch (method1Error) {
                console.warn("Primary download method failed, trying alternative:", method1Error);
    
                // Method 2: FileReader approach (fallback)
                const reader = new FileReader();
                reader.onload = function() {
                    const link = document.createElement('a');
                    link.href = reader.result;
    
                    // Dynamic file name with user and trip details
                    const ticketName = `SwiftBus_Ticket_${bookingId}_user_${userName}_trip_${tripId}.pdf`;
                    link.download = ticketName;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => document.body.removeChild(link), 100);
                };
                reader.onerror = () => {
                    throw new Error("Failed to read PDF file");
                };
                reader.readAsDataURL(pdfBlob);
            }
    
            // Optional: Show success message
            const successMsg = document.createElement('div');
            successMsg.textContent = `Ticket for Booking ID ${bookingId} downloaded successfully!`;
            successMsg.style.position = 'fixed';
            successMsg.style.top = '20px';
            successMsg.style.right = '20px';
            successMsg.style.padding = '10px';
            successMsg.style.background = '#4CAF50';
            successMsg.style.color = 'white';
            successMsg.style.borderRadius = '5px';
            successMsg.style.zIndex = '1000';
            document.body.appendChild(successMsg);
            setTimeout(() => document.body.removeChild(successMsg), 3000);
    
        } catch (err) {
            console.error("Download error:", err);
    
            // Show user-friendly error message
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `Error: ${err.message}`;
            errorMsg.style.position = 'fixed';
            errorMsg.style.top = '20px';
            errorMsg.style.right = '20px';
            errorMsg.style.padding = '10px';
            errorMsg.style.background = '#f44336';
            errorMsg.style.color = 'white';
            errorMsg.style.borderRadius = '5px';
            errorMsg.style.zIndex = '1000';
            document.body.appendChild(errorMsg);
            setTimeout(() => document.body.removeChild(errorMsg), 5000);
        }
    }
    
});
