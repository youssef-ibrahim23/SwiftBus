const form = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const userNameInput = document.getElementById('userName');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const userNameError = document.getElementById('userNameError');

// Function to show error messages
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Function to clear error messages
function clearError(element) {
    element.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate User Name
    if (userNameInput.value.trim() === '') {
        showError(userNameError, 'User Name required');
        isValid = false;
    } else {
        clearError(userNameError);
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        showError(emailError, 'Please enter a valid email.');
        isValid = false;
    } else {
        clearError(emailError);
    }

    // Validate Password
    if (passwordInput.value.trim() === '') {
        showError(passwordError, 'Password required');
        isValid = false;
    } else {
        clearError(passwordError);
    }

    if (isValid) {
        const user = {
            userName: userNameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        };

        // Send user data to backend for registration via API
        try {
            const response = await fetch('http://localhost:8081/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();
            if (response.ok) {
                alert('User registered successfully');
                form.reset(); // Reset the form after successful registration
                window.location.href = 'login.html';  // Optionally, redirect to login page
            } else {
                alert('Error: ' + data.message); // Show error message from the backend
            }
        } catch (error) {
            showError(userNameError, 'Server error. Please try again later.');
            console.error(error);
        }
    }
});

// Clear error messages when input changes
userNameInput.addEventListener('input', () => clearError(userNameError));
emailInput.addEventListener('input', () => clearError(emailError));
passwordInput.addEventListener('input', () => clearError(passwordError));
