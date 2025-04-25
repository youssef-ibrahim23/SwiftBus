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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        showError(emailError, 'Please enter a valid email.');
        isValid = false;
    } else {
        emailError.style.display = 'none';
    }

    if (passwordInput.value.trim() === '') {
        showError(passwordError, 'Password required.');
        isValid = false;
    } else {
        passwordError.style.display = 'none';
    }

    if(isValid){
        if (emailInput.value === 'admin@gmail.com'){
            window.location.href = 'HomePage.html';
        }

        else{
            window.location.href = 'home.html';
        }
    }

    // if (isValid) {
    //     loginBtn.textContent = 'Logging in...';
    //     loginBtn.disabled = true;
    //     loginBtn.style.opacity = '0.7';

    //     try {
    //         const response = await fetch('http://localhost:8081/users/login', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 email: emailInput.value,
    //                 password: passwordInput.value
    //             })
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             showToast('Login successful!');
    //             localStorage.setItem('user', JSON.stringify(data));
                
    //             // Check user role and redirect accordingly
    //             setTimeout(() => {
    //                 if (data.role === 'ADMIN') {
    //                     window.location.href = 'HomePage.html';
    //                 } else if (data.role === 'TRAVELER') {
    //                     window.location.href = 'home.html';
    //                 } else {
    //                     // Default fallback for unknown roles
    //                     window.location.href = 'home.html';
    //                 }
    //             }, 1000);
    //         } else {
    //             const error = await response.json();
    //             showToast(error.message || 'Login failed!', false);
    //         }
    //     } catch (err) {
    //         showToast('Server error. Try again later.', false);
    //     }

    //     loginBtn.textContent = 'Login';
    //     loginBtn.disabled = false;
    //     loginBtn.style.opacity = '1';
    // }
});

emailInput.addEventListener('input', () => emailError.style.display = 'none');
passwordInput.addEventListener('input', () => passwordError.style.display = 'none');