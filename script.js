      
document.addEventListener('DOMContentLoaded', function() {
    console.log("script.js DOMContentLoaded: All scripts loaded.");

    // --- Common DOM Elements (used across functionalities) ---
    const mainPopupContainer = document.getElementById('main-popup-container');
    const formMessage = document.getElementById('form-message'); // Used for Formspree form status

    // --- Cookie Consent Elements ---
    const cookieConsentContent = document.getElementById('cookie-consent-content');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    // --- Lead Capture (Formspree) Elements ---
    const leadCaptureContent = document.getElementById('lead-capture-content');
    const closeLeadFormBtn = document.getElementById('close-lead-form');
    // Select both Formspree forms by their specific IDs
    const leadCaptureFormMain = document.getElementById('lead-capture-form-main'); // For index.html
    const leadCaptureFormCheckout = document.getElementById('lead-capture-form-checkout'); // For checkout.html (now uses the same form structure)
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvgajnqr"; // Your Formspree endpoint


    // --- Shopify Offer Page CTA Elements ---
    const shopifyCta = document.getElementById('shopify-offer-cta');
    const triggerLeadPopupBtn = document.getElementById('trigger-lead-popup');

    // --- Cart Elements ---
    const cartCountElement = document.getElementById('cart-count'); // Universal cart count in header
    const buyNowButtons = document.querySelectorAll('.buy-now-btn'); // On index.html

    // Cart elements specific to view-cart.html
    const cartItemsListElement = document.getElementById('cart-items-list');
    const cartTotalDisplayElement = document.getElementById('cart-total-display');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const emptyCartMessage = document.querySelector('.empty-cart-message');


    // Load cart from localStorage or initialize as empty array
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // --- Stripe Payment Elements (for checkout.html) ---
    const paymentForm = document.getElementById('payment-form');
    const paymentElementContainer = document.getElementById('payment-element');
    const paymentErrorMessageDiv = document.getElementById('error-message');
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    const paymentSuccessMessage = document.getElementById('payment-success-message');
    // For checkout, we will get the total directly from the cart in localStorage
    const checkoutCartTotalDisplayElement = document.getElementById('cart-total-price'); // On checkout.html, renamed from product-price


    // --- Helper function to show/hide the main popup container ---
    function showPopup(contentToShow) {
        if (mainPopupContainer) {
            // Hide all content types first
            if (cookieConsentContent) cookieConsentContent.style.display = 'none';
            if (leadCaptureContent) leadCaptureContent.style.display = 'none';

            // Show the specific content
            if (contentToShow === 'cookie' && cookieConsentContent) {
                cookieConsentContent.style.display = 'flex'; // Use flex for cookie popup as per original style
            } else if (contentToShow === 'lead' && leadCaptureContent) {
                leadCaptureContent.style.display = 'block';
            }

            // Make the overlay visible and handle transitions
            mainPopupContainer.style.display = 'flex'; // Ensure display is flex for centering the popup-content
            setTimeout(() => {
                mainPopupContainer.classList.add('visible');
            }, 50); // Small delay for transition
        }
    }

    function hidePopup() {
        if (mainPopupContainer) {
            mainPopupContainer.classList.remove('visible');
            setTimeout(() => {
                mainPopupContainer.style.display = 'none';
                // Reset content display after hiding to avoid flicker if shown again
                if (cookieConsentContent) cookieConsentContent.style.display = 'none';
                if (leadCaptureContent) leadCaptureContent.style.display = 'none';
            }, 300); // Wait for transition to complete before hiding
        }
    }

    // --- Cookie Consent Logic ---
    function handleCookieConsent() {
        // If cookies haven't been accepted and it's not the checkout page
        // (to prevent cookie popup from interfering with payment on checkout load)
        if (!localStorage.getItem('cookiesAccepted') && window.location.pathname !== '/checkout.html') {
             showPopup('cookie');
             console.log("Cookie popup shown.");
        } else {
            // If cookies accepted, or on checkout page, proceed to lead capture logic
            handleLeadCaptureDisplay();
        }
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            hidePopup(); // Hide cookie popup immediately
            // Short delay before showing lead capture to make transition smoother
            setTimeout(handleLeadCaptureDisplay, 300);
            console.log("Cookies accepted, attempting to show lead capture.");
        });
    }

    // --- Lead Capture Form Display Logic ---
    function handleLeadCaptureDisplay() {
        // Only show lead capture if cookies accepted AND lead not already captured this session
        // AND not on payment success page
        if (localStorage.getItem('cookiesAccepted') === 'true' && !sessionStorage.getItem('leadCapturedThisSession') && window.location.pathname !== '/payment-success.html') {
            showPopup('lead');
            console.log("Lead capture popup shown.");
            sessionStorage.setItem('leadCapturedThisSession', 'true'); // Mark as shown for the session
        } else {
            console.log("Lead capture popup suppressed: conditions not met.");
            hidePopup(); // Ensure popup is hidden if conditions not met
        }
    }

    if (closeLeadFormBtn) {
        closeLeadFormBtn.addEventListener('click', function() {
            hidePopup();
            console.log("Lead capture popup closed by user.");
        });
    }

    // --- Formspree Lead Capture Form Submission Logic ---
    async function handleLeadCaptureFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        form.action = FORMSPREE_ENDPOINT; // Ensure the action attribute is correctly set

        if (formMessage) {
            formMessage.style.display = 'none';
            formMessage.classList.remove('success', 'error');
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
        if (submitButton) {
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                if (formMessage) {
                    formMessage.textContent = "Thank you! Your strategies are on their way. Check your inbox.";
                    formMessage.classList.add('success');
                    formMessage.style.display = 'block';
                }
                form.reset();
                localStorage.setItem('leadCaptured', 'true'); // Persist lead capture status
                sessionStorage.setItem('leadCapturedThisSession', 'true'); // Mark for current session

                setTimeout(() => {
                    hidePopup(); // Hide the popup
                    window.location.href = '/shopify-offer.html#thank-you'; // Redirect after a delay
                }, 1500); // Delay redirect slightly for message to be seen

            } else {
                const data = await response.json();
                if (formMessage) {
                    formMessage.textContent = data.errors ? data.errors.map(err => err.message).join(', ') : 'Oops! Something went wrong. Please try again later.';
                    formMessage.classList.add('error');
                    formMessage.style.display = 'block';
                }
                console.error('Formspree submission error:', data);
            }
        } catch (error) {
            console.error('Network error during form submission:', error);
            if (formMessage) {
                formMessage.textContent = 'Network error. Please check your connection and try again.';
                formMessage.classList.add('error');
                formMessage.style.display = 'block';
            }
        } finally {
            if (submitButton) {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        }
    }

    // Add event listeners to all Formspree lead capture forms
    if (leadCaptureFormMain) {
        leadCaptureFormMain.addEventListener('submit', handleLeadCaptureFormSubmit);
    }
    if (leadCaptureFormCheckout) {
        leadCaptureFormCheckout.addEventListener('submit', handleLeadCaptureFormSubmit);
    }


    // --- Initial call to start the popup sequence on page load ---
    // Delay initial check to allow all DOM elements to be ready
    setTimeout(handleCookieConsent, 1000); // Wait 1 second before checking cookies/showing popup

    // --- Shopify Offer Page CTA Conditional Display and Trigger ---
    if (shopifyCta) {
        // Only show CTA if lead has NOT been captured (across sessions)
        if (localStorage.getItem('leadCaptured') === 'true') {
            shopifyCta.style.display = 'none';
        } else {
            shopifyCta.style.display = 'block';
        }

        if (triggerLeadPopupBtn) {
            triggerLeadPopupBtn.addEventListener('click', function() {
                // When this button is clicked, force show the lead capture popup
                showPopup('lead');
            });
        }
    }


    // --- Cart Functionality (Universal for all pages) ---
    function updateCartCount() {
        if (cartCountElement) {
            let totalItems = 0;
            cart.forEach(item => {
                totalItems += item.quantity;
            });
            cartCountElement.textContent = totalItems;
        }
    }

    function calculateCartTotal() {
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });
        return total;
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
        alert(serviceName + " has been added to your cart!"); // Simple feedback
        console.log("Cart updated:", cart);
    }

    // Add event listeners for "Buy Now" buttons on index.html
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

    // --- Cart Page Specific Functionality (view-cart.html) ---
    function renderCartItems() {
        if (cartItemsListElement && cartTotalDisplayElement) {
            if (cart.length === 0) {
                cartItemsListElement.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
                if (proceedToCheckoutBtn) proceedToCheckoutBtn.disabled = true;
            } else {
                cartItemsListElement.innerHTML = ''; // Clear existing items
                if (emptyCartMessage) emptyCartMessage.style.display = 'none'; // Hide empty message
                if (proceedToCheckoutBtn) proceedToCheckoutBtn.disabled = false;

                cart.forEach((item, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('cart-item');
                    itemDiv.innerHTML = `
                        <div class="cart-item-info">
                            <h3>${item.name}</h3>
                            <p>Price: $${item.price.toFixed(2)}</p>
                            <p>Quantity: ${item.quantity}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="btn btn-remove-item" data-index="${index}">Remove</button>
                        </div>
                    `;
                    cartItemsListElement.appendChild(itemDiv);
                });
            }
            cartTotalDisplayElement.textContent = calculateCartTotal().toFixed(2);
        }
    }

    function removeFromCart(index) {
        if (index > -1 && index < cart.length) {
            cart.splice(index, 1); // Remove item at index
            saveCart();
            renderCartItems(); // Re-render cart after removal
        }
    }

    // Event listener for "Remove" buttons on cart page
    if (cartItemsListElement) {
        cartItemsListElement.addEventListener('click', function(event) {
            if (event.target.classList.contains('btn-remove-item')) {
                const indexToRemove = parseInt(event.target.dataset.index);
                removeFromCart(indexToRemove);
            }
        });
    }

    // Handle "Proceed to Checkout" button click on view-cart.html
    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                window.location.href = '/checkout.html';
            } else {
                alert("Your cart is empty. Please add items before proceeding to checkout.");
            }
        });
    }

    // Initialize cart items rendering if on view-cart.html
    if (window.location.pathname === '/view-cart.html') {
        renderCartItems();
    }


    // Initial cart count update on page load (for header)
    updateCartCount();
    console.log("Cart script initialized.");


    // --- Stripe Payment Integration (for checkout.html) ---
    // Only run this block if the payment form and its related elements exist on the page
    if (paymentForm && paymentElementContainer && submitPaymentBtn && paymentSuccessMessage) {
        console.log("Stripe checkout elements found. Initializing Stripe.");

        // On checkout.html, update the cart total price element
        if (checkoutCartTotalDisplayElement) {
            const total = calculateCartTotal();
            checkoutCartTotalDisplayElement.textContent = total.toFixed(2); // Display total with 2 decimal places
            console.log("Checkout page: Cart total displayed as $", total.toFixed(2));
        }

        // Initialize Stripe.js with your **PUBLISHABLE KEY**.
        // Get this from your Stripe Dashboard -> Developers -> API keys (starts with 'pk_live_' or 'pk_test_').
        const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ');

        let elements;
        let clientSecret;

        // Function to fetch the client secret from your Render.com backend
        async function fetchPaymentIntentClientSecret() {
            try {
                const backendUrl = 'https://my-stripe-backend-api.onrender.com';
                const createIntentEndpoint = `${backendUrl}/create-payment-intent`;

                // Use the calculated cart total for the payment intent
                const total = calculateCartTotal();
                let amountValue = total * 100; // Convert to cents

                if (amountValue <= 0) { // Prevent creating intent for $0 or less
                    console.error("Cart total is zero or negative. Cannot create payment intent.");
                    if (paymentErrorMessageDiv) {
                        paymentErrorMessageDiv.textContent = "Cannot process an empty or zero-value order. Please add items to your cart.";
                        paymentErrorMessageDiv.style.display = 'block';
                    }
                    return null;
                }

                const currency = 'usd'; // Assuming USD

                const response = await fetch(createIntentEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: amountValue, currency: currency })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create payment intent on backend.');
                }

                const data = await response.json();
                return data.clientSecret;

            } catch (error) {
                console.error('Error fetching client secret:', error.message);
                if (paymentErrorMessageDiv) {
                    paymentErrorMessageDiv.textContent = `Payment initialization failed: ${error.message}. Please refresh and try again.`;
                    paymentErrorMessageDiv.style.display = 'block';
                }
                return null;
            }
        }

        async function initializeStripeElements() {
            clientSecret = await fetchPaymentIntentClientSecret();

            if (clientSecret) {
                elements = stripe.elements({ clientSecret });
                const paymentElement = elements.create('payment');
                paymentElement.mount('#payment-element');
                paymentForm.style.display = 'block';
                console.log("Stripe Payment Element mounted.");
            } else {
                paymentForm.style.display = 'none';
                console.error("Could not get client secret, hiding payment form.");
            }
        }

        initializeStripeElements();

        paymentForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (!elements || !clientSecret) {
                if (paymentErrorMessageDiv) {
                    paymentErrorMessageDiv.textContent = 'Payment system not ready. Please wait a moment and try again.';
                    paymentErrorMessageDiv.style.display = 'block';
                }
                return;
            }

            if (paymentErrorMessageDiv) {
                paymentErrorMessageDiv.style.display = 'none';
                paymentErrorMessageDiv.textContent = '';
            }
            if (submitPaymentBtn) {
                submitPaymentBtn.disabled = true;
                submitPaymentBtn.textContent = 'Processing...';
            }

            // --- FIX FOR STRIPE elements.submit() ERROR ---
            // 1. First, submit the Payment Element itself for validation
            const { error: submitError } = await elements.submit();

            if (submitError) {
                // Show error message from Payment Element validation
                if (paymentErrorMessageDiv) {
                    paymentErrorMessageDiv.textContent = submitError.message;
                    paymentErrorMessageDiv.style.display = 'block';
                }
                if (submitPaymentBtn) {
                    submitPaymentBtn.disabled = false;
                    submitPaymentBtn.textContent = 'Pay Now';
                }
                console.error("Stripe elements.submit() error:", submitError);
                return; // Stop further processing
            }

            // 2. If elements.submit() succeeded, then confirm the payment
            const customerNameInput = document.getElementById('customer-name');
            const customerEmailInput = document.getElementById('customer-email');
            const customerName = customerNameInput ? customerNameInput.value : null;
            const customerEmail = customerEmailInput ? customerEmailInput.value : null;

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success.html`,
                    payment_method_data: {
                        billing_details: {
                            name: customerName,
                            email: customerEmail,
                        },
                    },
                },
                redirect: 'if_required' // Crucial for 3D Secure and other redirects
            });

            if (confirmError) {
                if (paymentErrorMessageDiv) {
                    paymentErrorMessageDiv.textContent = confirmError.message;
                    paymentErrorMessageDiv.style.display = 'block';
                }
                if (submitPaymentBtn) {
                    submitPaymentBtn.disabled = false;
                    submitPaymentBtn.textContent = 'Pay Now';
                }
                console.error("Stripe confirmPayment error:", confirmError);
            } else {
                // Payment succeeded on the client side (e.g., no 3D Secure redirect needed)
                paymentForm.style.display = 'none';
                if (paymentSuccessMessage) {
                    paymentSuccessMessage.style.display = 'block';
                }
                console.log("Payment confirmed successfully (no redirect).");
                localStorage.removeItem('shoppingCart'); // Clear cart after successful payment
                updateCartCount(); // Update cart display to show 0
            }
        });
    }

    // --- Handle return from Stripe (e.g., after 3D Secure) on payment-success.html ---
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretFromUrl = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (clientSecretFromUrl && redirectStatus && window.location.pathname === '/payment-success.html') {
        console.log("Processing Stripe redirect on payment-success.html.");
        // Re-initialize Stripe on the success page
        const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ'); // Use your LIVE PUBLISHABLE KEY here!

        const successMessageDiv = document.getElementById('payment-success-message');
        const errorMessageDiv = document.getElementById('error-message');

        stripe.retrievePaymentIntent(clientSecretFromUrl).then(({ paymentIntent }) => {
            if (successMessageDiv && errorMessageDiv) {
                if (paymentIntent.status === 'succeeded') {
                    successMessageDiv.style.display = 'block';
                    errorMessageDiv.style.display = 'none';
                    console.log('Payment Succeeded:', paymentIntent);
                    localStorage.removeItem('shoppingCart'); // Clear cart after successful payment
                    updateCartCount(); // Update cart display to show 0
                } else {
                    errorMessageDiv.textContent = `Payment failed: ${paymentIntent.status}. Please contact support.`;
                    errorMessageDiv.style.display = 'block';
                    successMessageDiv.style.display = 'none';
                    console.error('Payment Failed:', paymentIntent);
                }
            }
        }).catch(error => {
            console.error("Error retrieving PaymentIntent:", error);
            if (errorMessageDiv) {
                errorMessageDiv.textContent = 'Failed to verify payment status. Please contact support.';
                errorMessageDiv.style.display = 'block';
            }
        });
    }

}); // End of DOMContentLoaded listener

    
