      
// --- Global Variables & Constants ---
// REPLACE 'pk_test_TYooMQauvdEDq5PCxOjGlggCUJ8sHQpt58' WITH YOUR ACTUAL STRIPE PUBLISHABLE KEY
// You can get this from your Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ'); 
let elements; // For Stripe Elements

// --- DOM Element References ---
const cookiePopup = document.getElementById('cookie-popup');
const acceptButton = document.getElementById('accept-cookies');

const hubspotPopupOverlay = document.getElementById('hubspot-popup-overlay');
const closeHubspotPopupButton = document.getElementById('close-hubspot-popup-btn');
// Ensure this correctly targets the form inside the popup
const formspreeLeadForm = document.getElementById('hubspot-popup-overlay') ? document.getElementById('hubspot-popup-overlay').querySelector('form') : null; 
const formMessage = document.getElementById('form-message'); // For Formspree messages

const cartCountElement = document.getElementById('cart-count'); // For header cart count
const buyNowButtons = document.querySelectorAll('.buy-now-btn'); // For index.html services

// Checkout page specific elements
const cartSummaryItemsContainer = document.getElementById('cart-summary-items');
const cartTotalPriceElement = document.getElementById('total-price'); // Corrected ID to match checkout.html
const paymentForm = document.getElementById('payment-form');
const submitPaymentBtn = document.getElementById('submit-button'); // Corrected ID to match checkout.html
const spinner = document.getElementById('spinner');
const buttonText = document.getElementById('button-text');
const errorMessageElement = document.getElementById('payment-message'); // Corrected ID to match checkout.html
const paymentSuccessMessage = document.getElementById('success-container'); // Corrected ID to match checkout.html


// --- Helper Functions ---
function showElement(element) {
    if (element) {
        element.style.display = 'flex'; // Or 'block' depending on desired layout (e.g., popup-overlay is flex)
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
        if (submitPaymentBtn) submitPaymentBtn.disabled = true; // Disable button during submission
    }
}

function hideSpinner() {
    if (spinner && buttonText) {
        spinner.classList.add('hidden');
        buttonText.classList.remove('hidden');
        if (submitPaymentBtn) submitPaymentBtn.disabled = false; // Re-enable button
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
            // Show the cookie popup after a delay if not accepted
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
    sessionStorage.setItem('leadPopupShownThisSession', 'true'); // Mark as shown for the session
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

    // Ensure cart is not empty before initializing Stripe elements
    if (cart.length === 0 || parseFloat(cartTotalPriceElement.textContent) <= 0) {
        displayMessage("Your cart is empty or total is zero. Please add items before checking out.", true);
        if (paymentForm) paymentForm.style.display = 'none'; // Hide form if cart is empty
        return;
    }

    try {
        // 1. Fetch client secret from your backend
        // THIS IS A PLACEHOLDER. Replace with a real API call to your server.
        // Your server should create a PaymentIntent and return its client_secret.
        // Example: POST to /create-payment-intent with the total amount
        const response = await fetch('/create-payment-intent', { // Make sure this URL is correct for your backend
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send the total amount (in cents) to your backend
            body: JSON.stringify({ amount: Math.round(parseFloat(cartTotalPriceElement.textContent) * 100) }) 
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const { clientSecret } = await response.json();

        const appearance = {
            theme: 'stripe', 
            variables: {
                colorPrimary: '#00FFFF', // Cyan
                colorBackground: '#1a1a1a', // Dark gray
                colorText: '#fff', // White
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
        displayMessage("Could not initialize payment. Please try again later. Error: " + error.message, true);
        if (submitPaymentBtn) submitPaymentBtn.disabled = true; // Disable button if Stripe fails
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        displayMessage("Stripe is not loaded. Please try again.", true);
        return;
    }

    showSpinner();
    clearMessage(); // Clear previous error messages

    const customerName = document.getElementById('name').value; // Corrected ID
    const customerEmail = document.getElementById('email').value; // Corrected ID

    if (!customerName || !customerEmail) {
        displayMessage("Please enter your full name and email.", true);
        hideSpinner();
        return;
    }

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // Make sure to change this to your payment completion page on your server
            return_url: window.location.origin + "/payment-success.html", 
            receipt_email: customerEmail,
            shipping: { // Example shipping data, adjust as needed or remove if not applicable
                name: customerName,
                address: {
                    line1: 'N/A', // Placeholder
                    postal_code: 'N/A', // Placeholder
                    city: 'N/A', // Placeholder
                    state: 'N/A', // Placeholder
                    country: 'US', // Placeholder, ideally collected from user
                },
            },
        },
        // IMPORTANT: Use 'if_required' for client-side redirection after payment intent status is updated
        // For a full server-side redirect, you'd handle return_url in your backend.
        redirect: 'if_required' 
    });

    // This point is reached if there was an immediate error (e.g., card error, validation error)
    // or if `redirect: 'if_required'` and no redirect happened.
    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
            displayMessage(error.message, true);
        } else {
            displayMessage("An unexpected error occurred. Please try again.", true);
        }
        hideSpinner();
    } else {
        // This means the payment was confirmed client-side without immediate error,
        // but it might still be pending or require further action.
        // For 'if_required', you need to check the PaymentIntent status on your backend
        // after the return_url is hit.
        // On success, the return_url should typically lead to a success page that
        // verifies the paymentIntent status from the URL parameters.
        // If not redirecting, you might handle it here (though less common for full payments).
        displayMessage("Payment processing. Please do not close this page...", false);
        // If your backend handles the redirection, this client-side block might be minimal.
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
    // Only show if cookies are accepted and not explicitly opted out/shown this session
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
    // Add a class to the body or a specific container on checkout.html for conditional logic
    if (document.body.classList.contains('checkout-page')) { 
        renderCartSummaryOnCheckout();
        // Only initialize Stripe if cart has items and total is positive
        if (cart.length > 0 && parseFloat(cartTotalPriceElement.textContent) > 0) { 
            initializeStripe();
        } else {
            displayMessage("Your cart is empty. Please add items before checking out.", true);
            if (paymentForm) paymentForm.style.display = 'none'; // Hide form if cart is empty
        }
    }
});
