// Sample destinations data
let destinations = [
    { id: 123, name: "Alexandria", city: "Cairo", activeRoutes: 5 },
    { id: 209, name: "Alexandria", city: "Giza", activeRoutes: 2 },
    { id: 300, name: "Alexandria", city: "Aswan", activeRoutes: 3 }
];

// DOM elements
const destinationsTableBody = document.getElementById('destinationsTableBody');
const addDestinationBtn = document.getElementById('addDestinationBtn');
const destinationModal = document.getElementById('destinationModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const destinationForm = document.getElementById('destinationForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Current action (add or edit)
let currentAction = 'add';
let currentDestinationId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load destinations
    renderDestinationsTable();
    
    // Set active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add Destination button click
    addDestinationBtn.addEventListener('click', function() {
        currentAction = 'add';
        modalTitle.textContent = 'Add New Destination';
        destinationForm.reset();
        document.getElementById('destinationId').value = '';
        destinationModal.style.display = 'flex';
    });

    // Close modal buttons
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);

    // Form submission
    destinationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const destinationData = {
            name: document.getElementById('destinationName').value,
            city: document.getElementById('city').value,
            activeRoutes: parseInt(document.getElementById('activeRoutes').value)
        };
        
        if (currentAction === 'add') {
            // Generate new ID (in a real app, this would come from the server)
            const newId = destinations.length > 0 ? Math.max(...destinations.map(d => d.id)) + 1 : 100;
            destinationData.id = newId;
            destinations.push(destinationData);
        } else {
            // Update existing destination
            const index = destinations.findIndex(d => d.id === currentDestinationId);
            if (index !== -1) {
                destinationData.id = currentDestinationId;
                destinations[index] = destinationData;
            }
        }
        
        renderDestinationsTable();
        closeModalFunc();
    });

    // Search functionality
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            const filteredDestinations = destinations.filter(destination => 
                destination.name.toLowerCase().includes(searchTerm) || 
                destination.city.toLowerCase().includes(searchTerm)
            );
            renderDestinationsTable(filteredDestinations);
        } else {
            renderDestinationsTable();
        }
    });

    // Press Enter in search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});

// Toggle menu categories
function toggleMenu(menuId) {
    const menu = document.getElementById(`${menuId}-menu`);
    const icon = document.querySelector(`[onclick="toggleMenu('${menuId}')] i`);
    
    menu.classList.toggle('show');
    icon.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Render destinations table
function renderDestinationsTable(destinationsToRender = destinations) {
    destinationsTableBody.innerHTML = '';
    
    destinationsToRender.forEach(destination => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${destination.id}</td>
            <td>${destination.name}</td>
            <td>${destination.city}</td>
            <td>${destination.activeRoutes}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" data-id="${destination.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${destination.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        destinationsTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editDestination(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteDestination(parseInt(this.getAttribute('data-id')));
        });
    });
}

// Edit destination
function editDestination(destinationId) {
    const destination = destinations.find(d => d.id === destinationId);
    if (destination) {
        currentAction = 'edit';
        currentDestinationId = destinationId;
        modalTitle.textContent = 'Edit Destination';
        
        document.getElementById('destinationId').value = destination.id;
        document.getElementById('destinationName').value = destination.name;
        document.getElementById('city').value = destination.city;
        document.getElementById('activeRoutes').value = destination.activeRoutes;
        
        destinationModal.style.display = 'flex';
    }
}

// Delete destination
function deleteDestination(destinationId) {
    if (confirm('Are you sure you want to delete this destination?')) {
        destinations = destinations.filter(destination => destination.id !== destinationId);
        renderDestinationsTable();
    }
}

// Close modal
function closeModalFunc() {
    destinationModal.style.display = 'none';
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('shrink');
}