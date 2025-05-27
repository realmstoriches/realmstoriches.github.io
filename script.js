// --- Global Variables & Constants ---
const stripe = Stripe('pk_test_TYooMQauvdEDq5PCxOjGlggCUJ8sHQpt58'); // Replace with your actual Stripe Publishable Key
let elements; // For Stripe Elements

// --- DOM Element References ---
const cookiePopup = document.getElementById('cookie-popup');
const acceptButton = document.getElementById('accept-cookies');

const hubspotPopupOverlay = document.getElementById('hubspot-popup-overlay');
const closeHubspotPopupButton = document.getElementById('close-hubspot-popup-btn');
const formspreeLeadForm = document.getElementById('form-container') ? document.getElementById('form-container').querySelector('form') : null;
const formMessage = document.getElementById('form-message'); // For Formspree messages if added to HTML

const cartCountElement = document.getElementById('cart-count'); // For header cart count
const buyNowButtons = document.querySelectorAll('.buy-now-btn'); // For index.html services

// Checkout page specific elements
const cartSummaryItemsContainer = document.getElementById('cart-summary-items');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const paymentForm = document.getElementById('payment-form');
const submitPaymentBtn = document.getElementById('submit-payment-btn');
const spinner = document.getElementById('spinner');
const buttonText = document.getElementById('button-text');
const errorMessageElement = document.getElementById('error-message');
const paymentSuccessMessage = document.getElementById('payment-success-message');

// --- Helper Functions ---
function showElement(element) {
    if (element) {
        element.style.display = 'flex'; // Or 'block' depending on desired layout
        setTimeout(() => element.classList.add('visible'), 50); // For fade-in effect
    }
}

function hideElement(element) {
    if (element) {
        element.classList.remove('visible');
        setTimeout(() => element.style.display = 'none', 300); // Wait for fade-out
    }
}

function showSpinner() {
    if (spinner && buttonText) {
        spinner.classList.remove('hidden');
        buttonText.classList.add('hidden');
    }
}

function hideSpinner() {
    if (spinner && buttonText) {
        spinner.classList.add('hidden');
        buttonText.classList.remove('hidden');
    }
}

function displayMessage(message, isError = false, element = errorMessageElement) {
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        element.style.display = 'block';
    }
}

function clearMessage(element = errorMessageElement) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

// --- Cookie Consent Logic ---
function initCookieConsent() {
    if (cookiePopup && acceptButton) {
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => { showElement(cookiePopup); }, 1500);
        }
        acceptButton.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            hideElement(cookiePopup);
        });
    }
}

// --- Lead Capture (Formspree) Popup Logic ---
function showLeadCapturePopup() {
    // Only show if cookies are accepted and not shown this session
    if (localStorage.getItem('cookiesAccepted') && !sessionStorage.getItem('leadPopupShownThisSession')) {
        showElement(hubspotPopupOverlay);
    }
}

function hideLeadCapturePopup() {
    hideElement(hubspotPopupOverlay);
    sessionStorage.setItem('leadPopupShownThisSession', 'true');
}

async function handleFormspreeSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    if (!formspreeLeadForm) return;

    showSpinner();
    clearMessage(formMessage); // Clear previous messages

    const formData = new FormData(formspreeLeadForm);
    try {
        const response = await fetch(formspreeLeadForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            displayMessage("Thank you for signing up!", false, formMessage);
            formspreeLeadForm.reset(); // Clear the form
            // Optionally close the popup after a delay
            setTimeout(() => {
                hideLeadCapturePopup();
            }, 2000);
        } else {
            const data = await response.json();
            if (data.errors) {
                displayMessage(data.errors.map(error => error.message).join(', '), true, formMessage);
            } else {
                displayMessage("Oops! There was a problem submitting your form.", true, formMessage);
            }
        }
    } catch (error) {
        console.error('Formspree submission error:', error);
        displayMessage("Network error. Please try again.", true, formMessage);
    } finally {
        hideSpinner();
    }
}


// --- Shopping Cart Logic ---
let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

function updateCartCount() {
    if (cartCountElement) {
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(serviceId, serviceName, servicePrice) {
    const price = parseFloat(servicePrice);
    const existingItemIndex = cart.findIndex(item => item.id === serviceId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: serviceId,
            name: serviceName,
            price: price,
            quantity: 1
        });
    }
    saveCart();
    alert(serviceName + " has been added to your cart!");
}

function renderCartSummaryOnCheckout() {
    if (!cartSummaryItemsContainer || !cartTotalPriceElement) return;

    cartSummaryItemsContainer.innerHTML = ''; // Clear previous content
    let totalCartPrice = 0;

    if (cart.length === 0) {
        cartSummaryItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item-summary');
            itemElement.innerHTML = `
                <p>${item.name} (x${item.quantity})</p>
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
            `;
            cartSummaryItemsContainer.appendChild(itemElement);
            totalCartPrice += (item.price * item.quantity);
        });
    }
    cartTotalPriceElement.textContent = totalCartPrice.toFixed(2);
}

// --- Stripe Checkout Logic (specific to checkout.html) ---
async function initializeStripe() {
    if (!paymentForm) return; // Only run on checkout page

    try {
        // 1. Fetch client secret from your backend
        // THIS IS A PLACEHOLDER. Replace with a real API call to your server.
        // Your server should create a PaymentIntent and return its client_secret.
        const response = await fetch('/create-payment-intent', { // Replace with your actual backend endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // You might send cart items or the total amount here
            body: JSON.stringify({ items: cart, amount: parseFloat(cartTotalPriceElement.textContent) * 100 }) // amount in cents
        });
        const { clientSecret } = await response.json();

        const appearance = {
            theme: 'stripe', // 'stripe', 'flat', 'none'
            variables: {
                colorPrimary: '#6a0dad', // Purple button for example
                colorBackground: '#f9f9f9',
                colorText: '#333',
                colorDanger: '#df1b41',
                fontFamily: 'Arial, sans-serif',
                spacingUnit: '4px',
                borderRadius: '4px',
            }
        };

        elements = stripe.elements({ clientSecret, appearance });

        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

        paymentForm.addEventListener('submit', handleSubmit);

    } catch (error) {
        console.error("Error initializing Stripe:", error);
        displayMessage("Could not initialize payment. Please try again later.", true);
        submitPaymentBtn.disabled = true; // Disable button if Stripe fails
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        return;
    }

    showSpinner();
    clearMessage(); // Clear previous error messages

    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;

    if (!customerName || !customerEmail) {
        displayMessage("Please enter your full name and email.", true);
        hideSpinner();
        return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // Make sure to change this to your payment completion page
            return_url: window.location.origin + "/payment-success.html", // You might want a dedicated success page
            receipt_email: customerEmail,
            shipping: { // Example shipping data, adjust as needed
                name: customerName,
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',
                },
            },
        },
        redirect: 'if_required' // Only redirect if necessary for 3D Secure etc.
    });

    // This point will be reached if there is an immediate error or if redirect: 'if_required' was used
    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
            displayMessage(error.message, true);
        } else {
            displayMessage("An unexpected error occurred. Please try again.", true);
        }
        hideSpinner();
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        displayMessage("Payment successful!", false);
        paymentForm.style.display = 'none'; // Hide the form
        showElement(paymentSuccessMessage); // Show success message
        localStorage.removeItem('shoppingCart'); // Clear the cart after successful payment
        updateCartCount(); // Update the cart count in the header
    } else {
        displayMessage("Payment status: " + paymentIntent.status, true); // Handle other statuses
        hideSpinner();
    }
}


// --- Main DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("script.js: DOM fully loaded and parsed.");

    // Initialize core features
    initCookieConsent();
    updateCartCount(); // Always update cart count on page load

    // Setup event listeners for lead capture popup
    if (closeHubspotPopupButton) {
        closeHubspotPopupButton.addEventListener('click', hideLeadCapturePopup);
    }
    if (hubspotPopupOverlay) {
        // Close if clicking on the overlay itself, but not within the content
        hubspotPopupOverlay.addEventListener('click', function(event) {
            if (event.target === hubspotPopupOverlay) {
                hideLeadCapturePopup();
            }
        });
    }
    if (formspreeLeadForm) {
        formspreeLeadForm.addEventListener('submit', handleFormspreeSubmission);
    }

    // Schedule lead capture popup
    if (hubspotPopupOverlay && localStorage.getItem('cookiesAccepted') && !sessionStorage.getItem('leadPopupShownThisSession')) {
        setTimeout(showLeadCapturePopup, 5000); // Show after 5 seconds if conditions met
    }

    // Add to Cart buttons for index.html (services)
    if (buyNowButtons.length > 0) {
        buyNowButtons.forEach(button => {
            button.addEventListener('click', function() {
                const serviceId = this.dataset.serviceId;
                const serviceName = this.dataset.serviceName;
                const servicePrice = this.dataset.servicePrice;
                addToCart(serviceId, serviceName, servicePrice);
            });
        });
    }

    // Checkout page specific logic
    if (document.body.classList.contains('checkout-page-main')) { // Check if this is the checkout page
        renderCartSummaryOnCheckout();
        if (cart.length > 0) { // Only initialize Stripe if there are items in the cart
            initializeStripe();
        } else {
            displayMessage("Your cart is empty. Please add items before checking out.", true);
            if (paymentForm) paymentForm.style.display = 'none'; // Hide form if cart is empty
        }
    }
});
