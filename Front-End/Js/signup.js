document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const userName = document.getElementById('userName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Reset error messages
        resetErrorMessages();
        
        // Validate inputs
        if (!validateInputs(userName, email, password)) {
            return;
        }
        
        // Show loading spinner
        submitBtn.disabled = true;
        spinner.style.display = 'inline-block';
        
        try {
            // Create user object
            const user = {
                userName: userName,
                email: email,
                password: password,
                // Role will be set to TRAVELER by default in the backend
            };
            
            // Call the register API
            const response = await fetch('http://localhost:8081/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle API errors
                handleApiError(response.status, data);
                return;
            }
            
            // Registration successful
            showSuccessMessage('Registration successful! Redirecting to login page...');
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            // Hide loading spinner
            submitBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });
    
    function validateInputs(userName, email, password) {
        let isValid = true;
        
        // Validate username
        if (userName.length < 3) {
            showError('userNameError', 'Username must be at least 3 characters long');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (password.length < 8) {
            showError('passwordError', 'Password must be at least 8 characters long');
            isValid = false;
        }
        
        return isValid;
    }
    
    function resetErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.style.display = 'none';
            msg.textContent = '';
        });
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    function handleApiError(status, data) {
        switch(status) {
            case 409: // Email already exists
                showError('emailError', data || 'This email is already registered');
                break;
            case 400: // Bad request
                showErrorMessage(data || 'Invalid registration data');
                break;
            default:
                showErrorMessage(data || 'Registration failed. Please try again.');
        }
    }
    
    function showErrorMessage(message) {
        // You could create a global error display area or use alert for simplicity
        alert(message);
    }
    
    function showSuccessMessage(message) {
        // You could create a success message display area or use alert for simplicity
        alert(message);
    }
});