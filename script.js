// Sample bird data
const birds = [
    {
        id: 1,
        name: "Broiler Chicken",
        description: "Fast-growing chickens raised for meat production. Tender and flavorful.",
        price: 12.99,
        image: " broiler chicken.jpg",
        category: "chicken"
    },
    {
        id: 2,
        name: "Layer Hens",
        description: "Productive egg-laying chickens that provide fresh eggs daily.",
        price: 15.99,
        image: "layer hen.jpg",
        category: "chicken"
    },
    {
        id: 3,
        name: "Turkey",
        description: "Large birds perfect for special occasions and holiday feasts.",
        price: 45.99,
        image: "turkey.jpg",
        category: "turkey"
    },
    {
        id: 4,
        name: "Ducks",
        description: "Rich, flavorful meat perfect for gourmet cooking.",
        price: 22.50,
        image: "ducks.jpg",
        category: "duck"
    },
    {
        id: 5,
        name: "Guinea Fowl",
        description: "Lean, tender meat with a slightly gamey flavor.",
        price: 28.75,
        image: "Guinea fowl.jpg",
        category: "other"
    },
    {
        id: 6,
        name: "Quail",
        description: "Small game birds with delicate, tender meat.",
        price: 8.50,
        image: "quail.jpg",
        category: "other"
    }
];

// Sample orders data
const orders = [
    { id: 1001, birdType: "Broiler Chicken", quantity: 5, date: "2023-06-15", status: "Completed" },
    { id: 1002, birdType: "Layer Hens", quantity: 3, date: "2023-07-20", status: "Pending" },
    { id: 1003, birdType: "Ducks", quantity: 2, date: "2023-08-05", status: "Completed" }
];

// Sample payments data
const payments = [
    { id: 2001, orderId: 1001, amount: 64.95, date: "2023-06-15", status: "Paid" },
    { id: 2002, orderId: 1002, amount: 47.97, date: "2023-07-20", status: "Pending" },
    { id: 2003, orderId: 1003, amount: 45.00, date: "2023-08-05", status: "Paid" }
];

// Initialize cart
let cart = JSON.parse(localStorage.getItem('poultryCart')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Render bird grid
    renderBirdGrid();
    
    // Populate bird type dropdown
    populateBirdDropdown();
    
    // Render dashboard data
    renderDashboard();
    
    // Update cart count
    updateCartCount();
    
    // Update cart modal
    updateCartModal();
    
    // Update order summary
    updateOrderSummary();
    
    // Event listeners
    document.getElementById('add-to-cart').addEventListener('click', addToCart);
    document.getElementById('checkout-btn').addEventListener('click', showPaymentModal);
    document.getElementById('modal-checkout-btn').addEventListener('click', showPaymentModal);
    document.getElementById('confirm-payment').addEventListener('click', processPayment);
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Render bird grid
function renderBirdGrid() {
    const gridContainer = document.getElementById('bird-grid');
    gridContainer.innerHTML = '';
    
    birds.forEach(bird => {
        const birdCard = `
            <div class="col-md-4 mb-4">
                <div class="card bird-card">
                    <img src="${bird.image}" class="card-img-top bird-img" alt="${bird.name}">
                    <div class="card-body">
                        <h5 class="card-title">${bird.name}</h5>
                        <p class="card-text">${bird.description}</p>
                        <p class="price">$${bird.price.toFixed(2)}</p>
                        <button class="btn btn-primary add-to-cart-btn" data-bird-id="${bird.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        gridContainer.innerHTML += birdCard;
    });
    
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const birdId = parseInt(this.getAttribute('data-bird-id'));
            addBirdToCart(birdId);
        });
    });
}

// Populate bird dropdown
function populateBirdDropdown() {
    const dropdown = document.getElementById('birdType');
    dropdown.innerHTML = '<option selected disabled>Choose a bird type</option>';
    
    birds.forEach(bird => {
        const option = document.createElement('option');
        option.value = bird.id;
        option.textContent = bird.name;
        dropdown.appendChild(option);
    });
}

// Add bird to cart from grid
function addBirdToCart(birdId) {
    const bird = birds.find(b => b.id === birdId);
    if (bird) {
        const existingItem = cart.find(item => item.birdId === birdId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                birdId: bird.id,
                name: bird.name,
                price: bird.price,
                quantity: 1
            });
        }
        
        updateLocalStorage();
        updateCartCount();
        updateCartModal();
        showToast(`${bird.name} added to cart!`);
    }
}

// Add to cart from order form
function addToCart() {
    const birdId = parseInt(document.getElementById('birdType').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!birdId || isNaN(quantity) || quantity < 1) {
        showToast('Please select a bird type and quantity', 'error');
        return;
    }
    
    const bird = birds.find(b => b.id === birdId);
    if (bird) {
        const existingItem = cart.find(item => item.birdId === birdId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                birdId: bird.id,
                name: bird.name,
                price: bird.price,
                quantity: quantity
            });
        }
        
        updateLocalStorage();
        updateCartCount();
        updateCartModal();
        updateOrderSummary();
        showToast(`${quantity} ${bird.name}(s) added to cart!`);
    }
}

// Update cart modal
function updateCartModal() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('modal-checkout-btn');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-muted text-center py-3">Your cart is empty</p>';
        cartTotalElement.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${item.name}</h6>
                        <p class="mb-0">Quantity: ${item.quantity}</p>
                        <p class="mb-0 price">$${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="text-end">
                        <p class="mb-0 fw-bold">$${subtotal.toFixed(2)}</p>
                        <span class="remove-from-cart" data-bird-id="${item.birdId}">
                            <i class="fas fa-trash"></i> Remove
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotalElement.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function() {
            const birdId = parseInt(this.getAttribute('data-bird-id'));
            removeFromCart(birdId);
        });
    });
}

// Remove item from cart
function removeFromCart(birdId) {
    const itemIndex = cart.findIndex(item => item.birdId === birdId);
    if (itemIndex !== -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateLocalStorage();
        updateCartCount();
        updateCartModal();
        updateOrderSummary();
        showToast(`${item.name} removed from cart`);
    }
}

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('poultryCart', JSON.stringify(cart));
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
        container.appendChild(toast);
    } else {
        toastContainer.appendChild(toast);
    }
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Render dashboard data
function renderDashboard() {
    // Render orders table
    const ordersTableBody = document.getElementById('orders-table-body');
    ordersTableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.birdType}</td>
            <td>${order.quantity}</td>
            <td>${order.date}</td>
            <td><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    // Render payments table
    const paymentsTableBody = document.getElementById('payments-table-body');
    paymentsTableBody.innerHTML = '';
    
    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${payment.id}</td>
            <td>#${payment.orderId}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td>${payment.date}</td>
            <td><span class="order-status status-${payment.status.toLowerCase()}">${payment.status}</span></td>
        `;
        paymentsTableBody.appendChild(row);
    });
    
    // Render inventory table
    const inventoryTableBody = document.getElementById('inventory-table-body');
    inventoryTableBody.innerHTML = '';
    
    birds.forEach(bird => {
        const row = document.createElement('tr');
        const available = Math.floor(Math.random() * 100) + 20; // Random availability
        row.innerHTML = `
            <td>${bird.name}</td>
            <td>${available}</td>
            <td>$${bird.price.toFixed(2)}</td>
            <td>${available > 30 ? 'In Stock' : 'Low Stock'}</td>
        `;
        inventoryTableBody.appendChild(row);
    });
}

// Show payment modal
function showPaymentModal() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
}

// Process payment
function processPayment() {
    // Simple validation
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('card-name').value;
    
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
        showToast('Please fill all payment fields', 'error');
        return;
    }
    
    // Simulate payment processing
    setTimeout(() => {
        // Close modals
        const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
        paymentModal.hide();
        
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (cartModal) {
            cartModal.hide();
        }
        
        // Clear cart
        cart = [];
        updateLocalStorage();
        updateCartCount();
        updateCartModal();
        updateOrderSummary();
        
        // Show success message
        showToast('Payment successful! Your order has been placed.');
    }, 1000);
}

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (name && email && message) {
        showToast('Message sent successfully!');
        document.getElementById('contact-form').reset();
    } else {
        showToast('Please fill all fields', 'error');
    }
}

// Update order summary
function updateOrderSummary() {
    const summaryContainer = document.getElementById('order-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p class="text-muted">Your cart is empty</p>';
        checkoutBtn.disabled = true;
        return;
    }
    
    let total = 0;
    summaryContainer.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="cart-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <h6>${item.name}</h6>
                        <p class="mb-0">Quantity: ${item.quantity}</p>
                    </div>
                    <div class="text-end">
                        <p class="mb-0">$${subtotal.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    summaryContainer.innerHTML += `
        <div class="d-flex justify-content-between mt-3">
            <h5>Total:</h5>
            <h5>$${total.toFixed(2)}</h5>
        </div>
    `;
    
    checkoutBtn.disabled = false;
}