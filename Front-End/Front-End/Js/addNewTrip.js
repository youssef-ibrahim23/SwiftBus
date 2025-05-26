document.addEventListener('DOMContentLoaded', function() {
    const tripForm = document.getElementById('tripForm');
    const messageDiv = document.getElementById('message');

    tripForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = tripForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        messageDiv.textContent = '';
        messageDiv.className = 'message';

        try {
            // Get form values
            const origin = document.getElementById('origin').value.trim();
            const destination = document.getElementById('destination').value.trim();
            const dateInput = document.getElementById('date').value;
            const duration = parseInt(document.getElementById('duration').value);
            const price = parseFloat(document.getElementById('price').value);
            const busId = parseInt(document.getElementById('busId').value);

            // Validate inputs
            if (!origin || !destination || !dateInput || isNaN(duration) || isNaN(price) || isNaN(busId)) {
                throw new Error('Please fill all fields with valid values');
            }

            // Create the trip object
            const tripData = {
                origin: origin,
                destination: destination,
                date: dateInput, // Already in YYYY-MM-DD format
                duration: duration,
                price: price,
                bus: {
                    busId: busId
                }
            };

            // Replace with your actual API endpoint
            const apiUrl = 'http://localhost:8081/api/admin/trips';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer your-token' // Uncomment if needed
                },
                body: JSON.stringify(tripData)
            });

            // Handle both JSON and text responses
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                const errorMsg = typeof responseData === 'object' 
                    ? (responseData.message || responseData.error || 'Failed to add trip')
                    : responseData;
                throw new Error(errorMsg);
            }

            // Success - handle both JSON and text responses
            const successMsg = typeof responseData === 'object'
                ? (responseData.message || 'Trip added successfully!')
                : responseData || 'Trip added successfully!';
            
            showMessage(successMsg, 'success');
            tripForm.reset();
        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message || 'Failed to add trip. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Trip';
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        
        setTimeout(() => {
            if (messageDiv.textContent === text) {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }
        }, 5000);
    }

    // Menu toggle function
    window.toggleMenu = function(menuId) {
        const menu = document.getElementById(menuId + '-menu');
        menu.classList.toggle('show');
        
        const icon = menu.previousElementSibling.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    };
});