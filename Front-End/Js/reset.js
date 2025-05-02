document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
    
    // Create and add loading spinner
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.innerHTML = '&nbsp;';
    submitBtn.appendChild(spinner);
    spinner.style.display = 'none';

    // Add CSS for spinner (can also be in your CSS file)
    const style = document.createElement('style');
    style.textContent = `
        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Reset previous error messages
        resetErrorMessages();
        
        // Validate inputs
        if (!validateInputs(email, password)) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        spinner.style.display = 'inline-block';
        
        try {
            const response = await fetch('http://localhost:8081/api/users/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    newPassword: password
                })
            });
            
            // Handle response
            const responseText = await response.text();
            
            if (!response.ok) {
                // Handle different error statuses
                if (response.status === 400) {
                    showError('emailError', responseText.includes('missing') ? 
                        'Email and password are required' : responseText);
                } else if (response.status === 404) {
                    showError('emailError', responseText);
                } else {
                    throw new Error(responseText || 'Password reset failed');
                }
                return;
            }
            
            // Success case
            showSuccessMessage(responseText || 'Password reset successfully! Redirecting to login...');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });

    function validateInputs(email, password) {
        let isValid = true;
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password length
        if (password.length < 8) {
            showError('passwordError', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        return isValid;
    }

    function resetErrorMessages() {
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
            msg.textContent = '';
        });
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function showErrorMessage(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Add notification styles (can also be in your CSS file)
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        }
        .success {
            background-color: #4CAF50;
        }
        .error {
            background-color: #F44336;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(notificationStyle);
});