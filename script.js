// --- Global Variables & Constants ---
// IMPORTANT: Replace 'pk_test_YOUR_PUBLISHABLE_KEY' with your actual Stripe Publishable Key.
// You can find this in your Stripe Dashboard under Developers > API keys.
const stripe = Stripe('pk_test_51RSfPkFYrMlSfWVNwGvjB13ZoMIGx9TB7FORRVYm3piKN3UHwTlk0LYvhcB4Z7GFKHdrk6w4XOnjCwQjJFRj9nzH00Rr96P6ze'); 
let elements; // For Stripe Elements

// IMPORTANT: Replace this with the actual URL of your deployed Render.com backend.
// For local testing, it might be 'http://localhost:3001'.
// For Render.com, it will look like 'https://your-service-name.onrender.com'.
const BACKEND_URL = 'https://my-stripe-backend-api.onrender.com'; 

// --- DOM Element References ---
const cookiePopup = document.getElementById('cookie-popup');
const acceptButton = document.getElementById('accept-cookies');

const hubspotPopupOverlay = document.getElementById('hubspot-popup-overlay');
const closeHubspotPopupButton = document.getElementById('close-hubspot-popup-btn');
// Ensure this correctly targets the form inside the popup
const formspreeLeadForm = document.getElementById('hubspot-popup-overlay') ? document.getElementById('hubspot-popup-overlay').querySelector('form') : null; 
const formMessage = document.getElementById('form-message'); 

const cartCountElement = document.getElementById('cart-count'); 
const buyNowButtons = document.querySelectorAll('.buy-now-btn'); 

// Checkout page specific elements
const cartSummaryItemsContainer = document.getElementById('cart-summary-items');
const cartTotalPriceElement = document.getElementById('total-price'); 
const paymentForm = document.getElementById('payment-form');
const submitPaymentBtn = document.getElementById('submit-button'); 
const spinner = document.getElementById('spinner');
const buttonText = document.getElementById('button-text');
const errorMessageElement = document.getElementById('payment-message'); 
const paymentSuccessMessage = document.getElementById('success-container'); 


// --- Helper Functions ---
function showElement(element) {
    if (element) {
        element.style.display = 'flex'; // Or 'block' depending on desired layout (e.g., popup-overlay is flex)
        // Force a reflow/repaint to ensure 'display' is applied before 'visible' class transitions
        element.offsetHeight; 
        element.classList.add('visible'); 
        console.log(`[UI] Showing element: #${element.id || element.className}`);
    }
}

function hideElement(element) {
    if (element) {
        element.classList.remove('visible');
        setTimeout(() => {
            element.style.display = 'none';
            console.log(`[UI] Hiding element: #${element.id || element.className}`);
        }, 300); // Wait for fade-out transition
    }
}

function showSpinner() {
    if (spinner && buttonText && submitPaymentBtn) {
        spinner.classList.remove('hidden');
        buttonText.classList.add('hidden');
        submitPaymentBtn.disabled = true; // Disable button during submission
        console.log("[UI] Spinner shown, button disabled.");
    }
}

function hideSpinner() {
    if (spinner && buttonText && submitPaymentBtn) {
        spinner.classList.add('hidden');
        buttonText.classList.remove('hidden');
        submitPaymentBtn.disabled = false; // Re-enable button
        console.log("[UI] Spinner hidden, button enabled.");
    }
}

function displayMessage(message, isError = false, element = errorMessageElement) {
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        element.style.display = 'block';
        console.log(`[Message] ${isError ? 'ERROR' : 'SUCCESS'}: ${message}`);
    }
}

function clearMessage(element = errorMessageElement) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        console.log("[Message] Cleared.");
    }
}

// --- Cookie Consent Logic ---
function initCookieConsent() {
    console.log("[Init] Initializing cookie consent.");
    if (cookiePopup && acceptButton) {
        if (!localStorage.getItem('cookiesAccepted')) {
            console.log("[Cookie] Cookies not yet accepted, scheduling popup.");
            setTimeout(() => { showElement(cookiePopup); }, 1500);
        } else {
            console.log("[Cookie] Cookies already accepted, ensuring popup is hidden.");
            hideElement(cookiePopup);
        }
        acceptButton.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            hideElement(cookiePopup);
            console.log("[Cookie] User accepted cookies.");
            // After accepting cookies, check if lead popup should show
            if (hubspotPopupOverlay && !sessionStorage.getItem('leadPopupShownThisSession')) {
                setTimeout(showLeadCapturePopup, 500); // Small delay after cookie accepts
            }
        });
    } else {
        console.warn("[Cookie] Cookie popup or accept button not found in DOM (expected on index.html).");
    }
}

// --- Lead Capture (Formspree) Popup Logic ---
function showLeadCapturePopup() {
    console.log("[Lead Popup] Attempting to show lead capture popup...");
    // Only show if cookies are accepted and not shown this session
    if (localStorage.getItem('cookiesAccepted') && !sessionStorage.getItem('leadPopupShownThisSession')) {
        showElement(hubspotPopupOverlay);
        console.log("[Lead Popup] Conditions met, showing lead capture popup.");
    } else {
        console.log("[Lead Popup] Conditions not met (cookies not accepted or already shown this session), not showing popup.");
    }
}

function hideLeadCapturePopup() {
    hideElement(hubspotPopupOverlay);
    sessionStorage.setItem('leadPopupShownThisSession', 'true'); // Mark as shown for the session
    console.log("[Lead Popup] Hidden and marked as shown for session.");
}

async function handleFormspreeSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    console.log("[Formspree] Submission initiated.");

    if (!formspreeLeadForm) {
        console.error("[Formspree] Form element not found.");
        return;
    }

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
            setTimeout(() => {
                hideLeadCapturePopup();
            }, 2000);
            console.log("[Formspree] Submission successful.");
        } else {
            const errorText = await response.text(); // Read raw text for debugging
            console.error("[Formspree] Submission failed. Status:", response.status, "Response text:", errorText);
            try {
                const errorData = JSON.parse(errorText); // Try to parse as JSON
                const errorMessage = errorData.errors ? errorData.errors.map(err => err.message).join(', ') : "Unknown error from Formspree.";
                displayMessage(`Oops! ${errorMessage}`, true, formMessage);
            } catch (jsonError) {
                displayMessage("Oops! There was a problem submitting your form. (Non-JSON response from Formspree, check Formspree dashboard)", true, formMessage);
            }
        }
    } catch (error) {
        console.error('[Formspree] Network error or invalid Formspree setup:', error);
        displayMessage("Network error or invalid Formspree setup. Please try again.", true, formMessage);
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
        console.log(`[Cart] Count updated: ${totalItems}`);
    }
}

function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
    console.log("[Cart] Saved to local storage.");
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
    alert(`"${serviceName}" has been added to your cart!`);
    console.log(`[Cart] Added "${serviceName}". Current cart:`, cart);
}

function renderCartSummaryOnCheckout() {
    console.log("[Checkout] Rendering cart summary.");
    if (!cartSummaryItemsContainer || !cartTotalPriceElement) {
        console.error("[Checkout] Cart summary container or total price element not found. Skipping render.");
        return;
    }

    cartSummaryItemsContainer.innerHTML = ''; // Clear previous content
    let totalCartPrice = 0;

    if (cart.length === 0) {
        cartSummaryItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        console.log("[Checkout] Cart is empty.");
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
        console.log("[Checkout] Cart items rendered.");
    }
    cartTotalPriceElement.textContent = totalCartPrice.toFixed(2);
    console.log(`[Checkout] Total cart price: $${totalCartPrice.toFixed(2)}`);
}

// --- Stripe Checkout Logic (specific to checkout.html) ---
async function initializeStripe() {
    console.log("[Stripe] Initializing Stripe.");
    if (!paymentForm) {
        console.warn("[Stripe] Payment form not found. Stripe initialization skipped.");
        return; 
    }

    const totalAmount = parseFloat(cartTotalPriceElement.textContent);

    if (cart.length === 0 || totalAmount <= 0) {
        displayMessage("Your cart is empty or total is zero. Please add items before checking out.", true);
        if (paymentForm) paymentForm.style.display = 'none'; 
        const paymentElementDiv = document.getElementById('payment-element');
        if(paymentElementDiv) paymentElementDiv.innerHTML = '<p style="color: red;">Your cart is empty. Please add items to checkout.</p>';
        console.log("[Stripe] Initialization skipped: cart empty or total zero.");
        return;
    }

    try {
        console.log(`[Stripe] Fetching client secret from backend at ${BACKEND_URL}/create-payment-intent...`);
        const response = await fetch(`${BACKEND_URL}/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Math.round(totalAmount * 100) }) // Amount in cents
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read raw text for debugging
            console.error(`[Stripe Error] Backend response not OK. Status: ${response.status}, Raw Response: "${errorText}"`);
            throw new Error(`Failed to fetch client secret: ${response.statusText || 'Server error'}. Raw response: "${errorText}"`);
        }

        const data = await response.json(); // Attempt to parse JSON
        if (!data.clientSecret) {
            throw new Error("Client secret not received from backend. Backend response was: " + JSON.stringify(data));
        }
        const { clientSecret } = data;
        console.log("[Stripe] Client secret received successfully.");

        const appearance = {
            theme: 'stripe', 
            variables: {
                colorPrimary: '#00FFFF', 
                colorBackground: '#1a1a1a', 
                colorText: '#fff', 
                colorDanger: '#df1b41',
                fontFamily: 'Arial, sans-serif',
                spacingUnit: '4px',
                borderRadius: '4px',
            }
        };

        elements = stripe.elements({ clientSecret, appearance });

        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        console.log("[Stripe] Payment Element mounted.");

        paymentForm.addEventListener('submit', handleSubmit);

    } catch (error) {
        console.error("[Stripe Error] Could not initialize Stripe (check backend, CORS, or network):", error);
        displayMessage("Could not initialize payment. Please try again later. Error: " + error.message, true);
        if (submitPaymentBtn) submitPaymentBtn.disabled = true;
        const paymentElementDiv = document.getElementById('payment-element');
        if(paymentElementDiv) paymentElementDiv.innerHTML = '<p style="color: red;">Failed to load payment options. Make sure backend is running and accessible.</p>';
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    console.log("[Stripe] Payment form submitted.");

    if (!stripe || !elements) {
        displayMessage("Stripe.js has not loaded. Please refresh the page.", true);
        console.error("[Stripe] Stripe.js or Elements not loaded.");
        return;
    }

    showSpinner();
    clearMessage();

    const customerName = document.getElementById('name').value; 
    const customerEmail = document.getElementById('email').value; 

    if (!customerName || !customerEmail) {
        displayMessage("Please enter your full name and email.", true);
        hideSpinner();
        console.log("[Stripe] Validation failed: Name or email missing.");
        return;
    }

    console.log("[Stripe] Confirming payment with Stripe...");
    const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: window.location.origin + "/payment-success.html", // Ensure you have this page
            receipt_email: customerEmail,
            shipping: { // Example shipping data, adjust as needed or remove if not applicable
                name: customerName,
                address: {
                    line1: 'N/A', 
                    postal_code: 'N/A', 
                    city: 'N/A', 
                    state: 'N/A', 
                    country: 'US', 
                },
            },
        },
        redirect: 'if_required' 
    });

    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
            displayMessage(error.message, true);
        } else {
            displayMessage("An unexpected error occurred. Please try again.", true);
        }
        hideSpinner();
        console.error("[Stripe Error] confirmPayment error:", error);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // This block might only be hit if redirect: 'never' was used, or on rare occasions
        // when the payment succeeds immediately without needing a redirect.
        // For 'if_required', usually a redirect happens.
        displayMessage("Payment successful!", false);
        paymentForm.style.display = 'none'; 
        showElement(paymentSuccessMessage); 
        localStorage.removeItem('shoppingCart'); 
        updateCartCount(); 
        console.log("[Stripe] Payment successful (client-side detected).");
    } else {
        // This case handles payments that require further action (e.g., 3D Secure)
        // but didn't trigger an immediate redirect. This is less common for simple flows.
        displayMessage(`Payment status: ${paymentIntent ? paymentIntent.status : 'unknown'}. Please check your email or transaction history.`, true);
        hideSpinner();
        console.warn("[Stripe] PaymentIntent status not 'succeeded' after confirmPayment (no redirect or pending action):", paymentIntent);
    }
}


// --- Main DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("script.js: DOM fully loaded and parsed.");

    // Initialize core features
    initCookieConsent();
    updateCartCount(); 

    // Setup event listeners for lead capture popup
    if (closeHubspotPopupButton) {
        closeHubspotPopupButton.addEventListener('click', hideLeadCapturePopup);
    }
    if (hubspotPopupOverlay) {
        hubspotPopupOverlay.addEventListener('click', function(event) {
            // Close popup only if clicking on the overlay itself, not the content
            if (event.target === hubspotPopupOverlay) {
                hideLeadCapturePopup();
            }
        });
    }
    if (formspreeLeadForm) {
        formspreeLeadForm.addEventListener('submit', handleFormspreeSubmission);
    }

    // Schedule lead capture popup to show after 5 seconds if conditions met
    // (cookies accepted AND not shown this session)
    if (hubspotPopupOverlay && localStorage.getItem('cookiesAccepted') && !sessionStorage.getItem('leadPopupShownThisSession')) {
        setTimeout(showLeadCapturePopup, 5000); 
    } else {
        console.log("[Lead Popup] Will not show on initial load (conditions not met).");
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
        console.log("[Cart] Buy Now buttons listeners attached.");
    }

    // Checkout page specific logic
    if (document.body.classList.contains('checkout-page')) { 
        console.log("[Page] On checkout page. Rendering cart summary and attempting Stripe initialization.");
        renderCartSummaryOnCheckout();
        const currentTotal = parseFloat(cartTotalPriceElement.textContent);
        if (cart.length > 0 && currentTotal > 0) { 
            initializeStripe();
        } else {
            displayMessage("Your cart is empty. Please add items before checking out.", true);
            if (paymentForm) paymentForm.style.display = 'none'; 
            const paymentElementDiv = document.getElementById('payment-element');
            if(paymentElementDiv) paymentElementDiv.innerHTML = '<p style="color: red;">Your cart is empty. Please add items to checkout.</p>';
            console.log("[Stripe] Initialization skipped on checkout page: cart is empty or total is zero.");
        }
    } else {
        console.log("[Page] Not on checkout page (index.html or other).");
    }
});
