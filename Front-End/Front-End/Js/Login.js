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

function resetLoginButton() {
    loginBtn.textContent = 'Login';
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
}

function validateForm() {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
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

    return isValid;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Disable the button and show loading state
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.7';

    try {
        const response = await fetch('http://localhost:8081/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        if (response.ok) {
            const data = await response.json();
            showToast('Login successful!');
            localStorage.setItem('user', JSON.stringify(data));

            setTimeout(() => {
                if (data.role === 'ADMIN') {
                    window.location.href = 'HomePage.html';
                } else if (data.role === 'TRAVELER') {
                    window.location.href = 'home.html';
                } else {
                    window.location.href = 'home.html'; // Default fallback
                }
            }, 1000);
        } else {
            const error = await response.json();
            showToast(error.message || 'Invalid credentials!', false);
        }
    } catch (err) {
        console.error('Login error:', err);
        showToast('Server error. Try again later.', false);
    }

    resetLoginButton();
});

// Reset errors on input change
emailInput.addEventListener('input', () => emailError.style.display = 'none');
passwordInput.addEventListener('input', () => passwordError.style.display = 'none');
