const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginBtn = document.querySelector('.login-btn');

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.previousElementSibling.classList.add('shake');
    setTimeout(() => {
        element.previousElementSibling.classList.remove('shake');
    }, 400);
}

function showToast(message, success = true) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = success ? '#38b000' : '#e63946';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        showError(emailError, 'Please enter a valid email.');
        isValid = false;
    } else {
        emailError.style.display = 'none';
    }

    // Password validation
    if (passwordInput.value.trim() === '') {
        showError(passwordError, 'Password required.');
        isValid = false;
    } else {
        passwordError.style.display = 'none';
    }

    if (isValid) {
        loginBtn.textContent = 'Resetting...';
        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.7';

        try {
            // Send request to the backend with RequestParam via URL
            const apiUrl = `http://localhost:8081/users/reset-password?email=${encodeURIComponent(emailInput.value)}&newPassword=${encodeURIComponent(passwordInput.value)}`;

            // Change method to GET as the backend expects RequestParam
            const response = await fetch(apiUrl, {
                method: 'PUT', // Use GET as expected by the backend
            });

            if (response.ok) {
                const data = await response.json();
                showToast('Password reset successful!');
                localStorage.setItem('user', JSON.stringify(data));
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                const error = await response.json();
                showToast(error.message || 'Password reset failed!', false);
            }
        } catch (err) {
            showToast('Server error. Try again later.', false);
        }

        loginBtn.textContent = 'Reset password';
        loginBtn.disabled = false;
        loginBtn.style.opacity = '1';
    }
});

// Remove error messages when the user starts typing
emailInput.addEventListener('input', () => emailError.style.display = 'none');
passwordInput.addEventListener('input', () => passwordError.style.display = 'none');
