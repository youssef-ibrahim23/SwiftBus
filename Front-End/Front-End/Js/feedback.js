document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingValue = document.getElementById('ratingValue');
    const feedbackForm = document.getElementById('feedbackForm');
    const successMessage = document.getElementById('successMessage');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    // Check user authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) {
        alert("Please login to submit feedback");
        window.location.href = 'login.html';
        return;
    }

    // Initialize star rating system
    function initStarRating() {
        let currentRating = 0;
        let hoverRating = 0;

        // Add event listeners to each star
        ratingStars.forEach(star => {
            // Click event to set rating
            star.addEventListener('click', function() {
                currentRating = parseInt(this.getAttribute('data-rating'));
                ratingValue.value = currentRating;
                updateStarDisplay();
            });

            // Mouse enter to show hover effect
            star.addEventListener('mouseenter', function() {
                hoverRating = parseInt(this.getAttribute('data-rating'));
                updateStarDisplay();
            });

            // Mouse leave to clear hover effect
            star.addEventListener('mouseleave', function() {
                hoverRating = 0;
                updateStarDisplay();
            });
        });

        // Update star appearance based on current/hover state
        function updateStarDisplay() {
            ratingStars.forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
        
                if (hoverRating > 0) {
                    star.classList.toggle('active', starRating <= hoverRating);
                } else {
                    star.classList.toggle('active', starRating <= currentRating);
                }
            });
        }
    }       

    // Handle form submission
    async function submitFeedback(e) {
        e.preventDefault();

        // Get form values
        const tripId = document.getElementById('tripId').value;
        const rating = parseInt(ratingValue.value);
        const comment = document.getElementById('comment').value.trim();

        // Validate form
        if (!rating || rating < 1 || rating > 5) {
            alert("Please select a rating between 1 and 5 stars");
            return;
        }

        if (!comment) {
            alert("Please enter your feedback comments");
            return;
        }

        // Prepare feedback data
        const feedbackData = {
            user: {userId: user.userId},
            trip: {tripId: parseInt(tripId)},
            rating: rating,
            comment: comment
        };

        try {
            // Show loading state on button
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            // Send feedback to server
            const response = await fetch('http://localhost:8081/api/traveler/submit-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                throw new Error(await response.text() || "Failed to submit feedback");
            }

            // Show success message
            successMessage.style.display = 'block';
            feedbackForm.reset();
            resetRatingStars();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error("Feedback submission error:", error);
            alert(error.message || "An error occurred. Please try again.");
        } finally {
            // Reset button state
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
            }
        }
    }

    // Reset star ratings
    function resetRatingStars() {
        ratingValue.value = 0;
        ratingStars.forEach(star => {
            star.classList.remove('selected', 'hovered');
        });
    }

    // Mobile menu toggle
    function toggleMobileMenu() {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    }

    // Initialize event listeners
    initStarRating();
    feedbackForm.addEventListener('submit', submitFeedback);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
});