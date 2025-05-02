// Constants
const API_BASE_URL = 'http://localhost:8081/api/admin';
const DRIVERS_ENDPOINT = `${API_BASE_URL}/users`;

// State
const driverManager = {
    allDrivers: [],
    currentDriverId: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        await fetchAndDisplayDrivers();
        setupEventListeners();
        setupModals();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application. Please try again later.');
    }
}

// API Functions
async function fetchDrivers() {
    try {
        const response = await fetch(DRIVERS_ENDPOINT);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        const users = await response.json();
        // Filter users to only include those with DRIVER role
        const drivers = users.filter(user => user.role === 'DRIVER');
        
        return drivers;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
}

async function updateDriver(driverData) {
    try {
        const response = await fetch(`http://localhost:8081/api/admin/drivers`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(driverData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update driver');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating driver:', error);
        throw error;
    }
}

async function deleteDriver(driverId) {
    try {
        const response = await fetch(`http://localhost:8081/api/admin/drivers/${driverId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete driver');
        }

        return true;
    } catch (error) {
        console.error('Error deleting driver:', error);
        throw error;
    }
}

// DOM Functions
async function fetchAndDisplayDrivers() {
    showLoadingState();
    
    try {
        driverManager.allDrivers = await fetchDrivers();
        renderDriversTable(driverManager.allDrivers);
    } catch (error) {
        showError(error.message);
    }
}

function renderDriversTable(drivers) {
    const tableBody = document.querySelector('#driverTable tbody');
    tableBody.innerHTML = drivers.length > 0 
        ? drivers.map(createDriverRow).join('')
        : '<tr><td colspan="6" class="no-data">No drivers found</td></tr>';
    
    attachEventListenersToActions();
}

function createDriverRow(driver) {
    return `
        <tr data-driver-id="${driver.userId}">
            <td>${driver.userId}</td>
            <td>${driver.userName}</td>
            <td>${driver.email}</td>
            <td class="actions">
                <button class="btn-action btn-view" data-driver-id="${driver.userId}" aria-label="View details of driver ${driver.userId}">
                    <i class="fas fa-eye"></i> Details
                </button>
                <button class="btn-action btn-edit" data-driver-id="${driver.userId}" aria-label="Edit driver ${driver.userId}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action btn-delete" data-driver-id="${driver.userId}" aria-label="Delete driver ${driver.userId}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `;
}

// Modal Functions
function setupModals() {
    // Close modals when clicking X or outside
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => closeModal(closeBtn.closest('.modal')));
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                closeModal(modal);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first interactive element
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
}

function closeModal(modal) {
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }
    
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    driverManager.currentDriverId = null;
}

async function showViewModal(driverId) {
    const driver = driverManager.allDrivers.find(d => d.userId == driverId);
    if (!driver) {
        showError('Driver not found');
        return;
    }

    document.getElementById('viewDriverId').textContent = driver.userId || 'N/A';
    document.getElementById('viewDriverName').textContent = driver.userName || 'N/A';
    document.getElementById('viewDriverEmail').textContent = driver.email || 'N/A';
    document.getElementById('viewDriverLicense').textContent = driver.licenseNumber || 'N/A';
    document.getElementById('viewDriverStatus').textContent = driver.status || 'N/A';

    openModal('viewDriverModal');
}

async function showEditModal(driverId) {
    const driver = driverManager.allDrivers.find(d => d.userId == driverId);
    if (!driver) {
        showError('Driver not found');
        return;
    }

    driverManager.currentDriverId = driverId;
    const form = document.getElementById('editDriverForm');
    
    // Populate form fields
    document.getElementById('editDriverId').value = driverId;
    document.getElementById('editDriverName').value = driver.userName || '';
    document.getElementById('editDriverEmail').value = driver.email || '';
    document.getElementById('editDriverPassword').value = driver.password || '';
    document.getElementById('editDriverStatus').value = driver.status || 'ACTIVE';
    
    openModal('editDriverModal');
}

function showDeleteModal(driverId) {
    const driver = driverManager.allDrivers.find(d => d.userId == driverId);
    if (!driver) {
        showError('Driver not found');
        return;
    }

    driverManager.currentDriverId = driverId;
    document.getElementById('deleteDriverId').textContent = driver.userId;
    document.getElementById('deleteDriverName').textContent = driver.userName;
    openModal('deleteDriverModal');
}

// Event Handlers
function setupEventListeners() {
    // Form submission
    const editForm = document.getElementById('editDriverForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmit);
    }
    
    // Delete confirmation
    const deleteBtn = document.getElementById('confirmDeleteDriverBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteDriver);
    }
}

async function handleEditFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        userId: parseInt(document.getElementById('editDriverId').value),
        userName: form.querySelector('#editDriverName').value.trim(),
        email: form.querySelector('#editDriverEmail').value.trim(),
        password: form.querySelector('#editDriverPassword').value,
        role: "DRIVER" // Ensure this matches your enum exactly
    };

    // Disable submit button during processing
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        await updateDriver(formData);
        showSuccess('Driver updated successfully');
        closeModal('editDriverModal');
        await fetchAndDisplayDrivers();
    } catch (error) {
        console.error('Error updating driver:', error);
        showError(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Save Changes';
    }
}

async function handleDeleteDriver() {
    const deleteButton = document.getElementById('confirmDeleteDriverBtn');
    deleteButton.disabled = true;
    deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

    try {
        await deleteDriver(driverManager.currentDriverId);
        showSuccess('Driver deleted successfully');
        closeModal('deleteDriverModal');
        await fetchAndDisplayDrivers();
    } catch (error) {
        console.error('Error deleting driver:', error);
        showError(error.message);
    } finally {
        deleteButton.disabled = false;
        deleteButton.innerHTML = 'Delete Driver';
    }
}

function attachEventListenersToActions() {
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => showViewModal(e.currentTarget.dataset.driverId));
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => showEditModal(e.currentTarget.dataset.driverId));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => showDeleteModal(e.currentTarget.dataset.driverId));
    });
}

// Utility Functions
function showLoadingState() {
    const tableBody = document.querySelector('#driverTable tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="loading"><i class="fas fa-spinner fa-spin"></i> Loading drivers...</td></tr>';
}

function showError(message) {
    const tableBody = document.querySelector('#driverTable tbody');
    tableBody.innerHTML = `<tr><td colspan="6" class="error"><i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
}

function showSuccess(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.classList.add('fade-out');
        setTimeout(() => successDiv.remove(), 500);
    }, 3000);
}

// Global functions (called from HTML)
window.toggleMenu = function(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
};

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
};

window.logout = function() {
    window.location.href = 'login.html';
};

// Make functions available to window for HTML onclick handlers
window.fetchAndDisplayDrivers = fetchAndDisplayDrivers;
window.closeModal = closeModal;