// viewAllBuses.js
class BusManager {
    constructor() {
        this.API_BASE_URL = 'http://localhost:8081/api/admin';
        this.BUSES_ENDPOINT = `${this.API_BASE_URL}/buses`;
        this.DRIVERS_ENDPOINT = `${this.API_BASE_URL}/users`;

        // DOM Elements
        this.elements = {
            busTable: document.querySelector('#busTable tbody'),
            busSearch: document.getElementById('busSearch'),
            viewBusModal: document.getElementById('viewBusModal'),
            editBusModal: document.getElementById('editBusModal'),
            deleteBusModal: document.getElementById('deleteBusModal'),
            editBusForm: document.getElementById('editBusForm'),
            refreshBtn: document.querySelector('.btn-primary[onclick="fetchAndDisplayBuses()"]')
        };

        // State
        this.state = {
            allBuses: [],
            currentBusId: null,
            isLoading: false,
            abortController: null
        };

        // Initialize the application
        this.init();
    }

    async init() {
        try {
            await this.fetchAndDisplayBuses();
            this.setupEventListeners();
            this.setupModals();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize application. Please try again later.');
        }
    }

    // API Functions
    async fetchBuses() {
        // Cancel previous request if still pending
        if (this.state.abortController) {
            this.state.abortController.abort();
        }

        this.state.abortController = new AbortController();
        this.state.isLoading = true;

        try {
            const response = await fetch(this.BUSES_ENDPOINT, {
                signal: this.state.abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching buses:', error);
                throw error;
            }
        } finally {
            this.state.isLoading = false;
            this.state.abortController = null;
        }
    }

    async fetchDrivers() {
        try {
            const response = await fetch(this.DRIVERS_ENDPOINT);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const users = await response.json();
            return users.filter(user => user.role === 'DRIVER');
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    }

    async updateBus(busData) {
        try {
            const response = await fetch(`${this.BUSES_ENDPOINT}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(busData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update bus');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating bus:', error);
            throw error;
        }
    }

    async deleteBus(busId) {
        try {
            const response = await fetch(`${this.BUSES_ENDPOINT}/${busId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete bus');
            }

            return true;
        } catch (error) {
            console.error('Error deleting bus:', error);
            throw error;
        }
    }

    // DOM Functions
    async fetchAndDisplayBuses() {
        this.showLoadingState();

        try {
            this.state.allBuses = await this.fetchBuses();
            this.renderBusTable(this.state.allBuses);
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.showError(error.message);
            }
        }
    }

    renderBusTable(buses) {
        this.elements.busTable.innerHTML = buses.length > 0
            ? buses.map(bus => this.createBusRow(bus)).join('')
            : '<tr><td colspan="5" class="no-data">No buses found</td></tr>';

        this.attachEventListenersToActions();
    }

    createBusRow(bus) {
        return `
            <tr data-bus-id="${bus.busId}">
                <td>${bus.busId}</td>
                <td>${bus.model}</td>
                <td>${bus.capacity}</td>
                <td>${bus.driver?.userId ? `${bus.driver.userName} (ID: ${bus.driver.userId})` : 'N/A'}</td>
                <td class="actions">
                    <button class="btn-action btn-view" data-bus-id="${bus.busId}" aria-label="View details of bus ${bus.busId}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-action btn-edit" data-bus-id="${bus.busId}" aria-label="Edit bus ${bus.busId}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-delete" data-bus-id="${bus.busId}" aria-label="Delete bus ${bus.busId}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }

    filterBuses(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderBusTable(this.state.allBuses);
            return;
        }

        const filteredBuses = this.state.allBuses.filter(bus => {
            const searchLower = searchTerm.toLowerCase();
            return (
                bus.busId.toString().includes(searchTerm) ||
                bus.model.toLowerCase().includes(searchLower) ||
                bus.capacity.toString().includes(searchTerm) ||
                (bus.driver?.userName && bus.driver.userName.toLowerCase().includes(searchLower))
            );
        });

        this.renderBusTable(filteredBuses);
    }

    // Modal Functions
    setupModals() {
        // Close modals when clicking X or outside
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModal(closeBtn.closest('.modal')));
        });

        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.closeModal(event.target);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    this.closeModal(modal);
                });
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');

        // Focus first interactive element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
    }

    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }

        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        this.state.currentBusId = null;
    }

    async showViewModal(busId) {
        const bus = this.state.allBuses.find(b => b.busId == busId);
        if (!bus) {
            this.showError('Bus not found');
            return;
        }

        document.getElementById('viewBusId').textContent = bus.busId || 'N/A';
        document.getElementById('viewModel').textContent = bus.model || 'N/A';
        document.getElementById('viewCapacity').textContent = bus.capacity || 'N/A';
        document.getElementById('viewDriver').textContent = bus.driver?.userName ? `${bus.driver.userName} (ID: ${bus.driver.userId})` : 'N/A';

        this.openModal('viewBusModal');
    }

    async showEditModal(busId) {
        const bus = this.state.allBuses.find(b => b.busId == busId);
        if (!bus) {
            this.showError('Bus not found');
            return;
        }

        this.state.currentBusId = busId;
        
        document.getElementById('editBusId').value = busId;
        document.getElementById('editModel').value = bus.model || '';
        document.getElementById('editCapacity').value = bus.capacity || '';

        try {
            await this.populateDriverOptions(bus.driver?.userId);
            this.openModal('editBusModal');
        } catch (error) {
            console.error('Error preparing edit form:', error);
            this.showError('Failed to load driver information');
        }
    }

    async populateDriverOptions(selectedDriverId) {
        try {
            const drivers = await this.fetchDrivers();
            const driverSelect = document.getElementById('editDriverId');
            
            // Clear existing options except the first one
            while (driverSelect.options.length > 1) {
                driverSelect.remove(1);
            }
            
            // Add new options
            drivers.forEach(driver => {
                const option = document.createElement('option');
                option.value = driver.userId;
                option.textContent = driver.userName;
                if (selectedDriverId === driver.userId) option.selected = true;
                driverSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    }

    showDeleteModal(busId) {
        const bus = this.state.allBuses.find(b => b.busId == busId);
        if (!bus) {
            this.showError('Bus not found');
            return;
        }

        this.state.currentBusId = busId;
        document.getElementById('deleteBusId').textContent = bus.busId;
        document.getElementById('deleteBusModel').textContent = bus.model;
        this.openModal('deleteBusModal');
    }

    // Event Handlers
    setupEventListeners() {
        // Debounced search
        let searchTimeout;
        this.elements.busSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.filterBuses(e.target.value), 300);
        });
        
        // Form submission
        this.elements.editBusForm.addEventListener('submit', (e) => this.handleEditFormSubmit(e));
        
        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.handleDeleteBus());
        
        // Refresh button
        this.elements.refreshBtn.addEventListener('click', () => this.fetchAndDisplayBuses());
    }

    async handleEditFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = {
            busId: parseInt(form.querySelector('#editBusId').value),
            model: form.querySelector('#editModel').value.trim(),
            capacity: parseInt(form.querySelector('#editCapacity').value),
            driver: { userId: form.querySelector('#editDriverId').value || null}
        };

        // Validate form data
        if (!formData.model || isNaN(formData.capacity)) {
            this.showError('Please fill all required fields with valid data');
            return;
        }

        // Disable submit button during processing
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            await this.updateBus(formData);
            this.showSuccess('Bus updated successfully');
            this.closeModal('editBusModal');
            await this.fetchAndDisplayBuses();
        } catch (error) {
            console.error('Error updating bus:', error);
            this.showError(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Save Changes';
        }
    }

    async handleDeleteBus() {
        const deleteButton = document.getElementById('confirmDeleteBtn');
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

        try {
            await this.deleteBus(this.state.currentBusId);
            this.showSuccess('Bus deleted successfully');
            this.closeModal('deleteBusModal');
            await this.fetchAndDisplayBuses();
        } catch (error) {
            console.error('Error deleting bus:', error);
            this.showError(error.message);
        } finally {
            deleteButton.disabled = false;
            deleteButton.innerHTML = 'Delete Bus';
        }
    }

    attachEventListenersToActions() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => this.showViewModal(e.currentTarget.dataset.busId));
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditModal(e.currentTarget.dataset.busId));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.showDeleteModal(e.currentTarget.dataset.busId));
        });
    }

    // Utility Functions
    showLoadingState() {
        this.elements.busTable.innerHTML = '<tr><td colspan="5" class="loading"><i class="fas fa-spinner fa-spin"></i> Loading buses...</td></tr>';
    }

    showError(message) {
        this.elements.busTable.innerHTML = `<tr><td colspan="5" class="error"><i class="fas fa-exclamation-circle"></i> ${message}</td></tr>`;
    }

    showSuccess(message) {
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const busManager = new BusManager();
    
    // Make methods available globally if needed
    window.fetchAndDisplayBuses = () => busManager.fetchAndDisplayBuses();
    window.closeModal = (modalId) => busManager.closeModal(modalId);
    
    // Menu toggle functions
    window.toggleMenu = function(menuId) {
        const menu = document.getElementById(`${menuId}-menu`);
        const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')"] i`);
        
        menu.classList.toggle('show');
        icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
        
        // Update aria-expanded attribute
        const button = document.querySelector(`[onclick="toggleMenu('${menuId}')"]`);
        button.setAttribute('aria-expanded', menu.classList.contains('show'));
    };

    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebar.classList.toggle('show');
        mainContent.classList.toggle('shrink');
    };

    window.logout = function() {
        // In a real app, you would clear session/token here
        window.location.href = 'login.html';
    };
});