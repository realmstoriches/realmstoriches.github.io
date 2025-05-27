      
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
    const leadCaptureFormIndex = document.getElementById('lead-capture-form-index');
    const leadCaptureFormCheckout = document.getElementById('lead-capture-form-checkout');


    // --- Shopify Offer Page CTA Elements ---
    const shopifyCta = document.getElementById('shopify-offer-cta');
    const triggerLeadPopupBtn = document.getElementById('trigger-lead-popup');

    // --- Cart Count Elements ---
    const cartCountElement = document.getElementById('cart-count');
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');

    // Load cart from localStorage or initialize as empty array
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // --- Stripe Payment Elements (for checkout.html) ---
    const paymentForm = document.getElementById('payment-form');
    const paymentElementContainer = document.getElementById('payment-element');
    const paymentErrorMessageDiv = document.getElementById('error-message');
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    const paymentSuccessMessage = document.getElementById('payment-success-message');
    const productPriceElement = document.getElementById('product-price'); // From checkout.html

    // --- Helper function to show/hide the main popup container ---
    function showPopup(contentToShow) {
        if (mainPopupContainer) {
            // Hide all content types first
            if (cookieConsentContent) cookieConsentContent.style.display = 'none';
            if (leadCaptureContent) leadCaptureContent.style.display = 'none';

            // Show the specific content
            if (contentToShow === 'cookie' && cookieConsentContent) {
                cookieConsentContent.style.display = 'block';
            } else if (contentToShow === 'lead' && leadCaptureContent) {
                leadCaptureContent.style.display = 'block';
            }

            // Make the overlay visible and handle transitions
            mainPopupContainer.style.display = 'flex'; // Ensure display is flex for centering
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
            }, 300); // Wait for transition to complete before hiding
        }
    }

    // --- Cookie Consent Logic ---
    function handleCookieConsent() {
        if (!localStorage.getItem('cookiesAccepted')) {
            showPopup('cookie');
            console.log("Cookie popup shown.");
        } else {
            handleLeadCaptureDisplay(); // Cookies already accepted, proceed to show lead form
        }
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            hidePopup(); // Hide cookie popup immediately
            handleLeadCaptureDisplay(); // Then, attempt to show lead capture form
            console.log("Cookies accepted, attempting to show lead capture.");
        });
    }

    // --- Lead Capture Form Display Logic ---
    function handleLeadCaptureDisplay() {
        // Only show lead capture if cookies accepted AND lead not already captured this session
        if (localStorage.getItem('cookiesAccepted') === 'true' && !sessionStorage.getItem('leadCapturedThisSession')) {
            // Do NOT show if on payment-success.html or shopify-offer.html#thank-you (after redirect)
            if (window.location.pathname === '/payment-success.html' || window.location.hash === '#thank-you') {
                console.log("Lead capture popup suppressed on success/thank-you page.");
                return;
            }
            showPopup('lead');
            console.log("Lead capture popup shown.");
            sessionStorage.setItem('leadCapturedThisSession', 'true'); // Mark as shown for the session
        } else {
            console.log("Lead capture popup suppressed: cookies not accepted, or already shown this session, or on special page.");
            hidePopup();
        }
    }

    if (closeLeadFormBtn) {
        closeLeadFormBtn.addEventListener('click', function() {
            hidePopup();
            console.log("Lead capture popup closed by user.");
        });
    }

    // --- Formspree Lead Capture Form Submission Logic ---
    // Function to handle form submission for any lead capture form
    async function handleLeadCaptureFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const formAction = form.action;

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
            const response = await fetch(formAction, {
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
    if (leadCaptureFormIndex) {
        leadCaptureFormIndex.addEventListener('submit', handleLeadCaptureFormSubmit);
    }
    if (leadCaptureFormCheckout) {
        leadCaptureFormCheckout.addEventListener('submit', handleLeadCaptureFormSubmit);
    }


    // --- Initial call to start the popup sequence on page load ---
    // Delay initial check to allow all DOM elements to be ready
    setTimeout(handleCookieConsent, 1000); // Wait 1 second before checking cookies/showing popup

    // --- Shopify Offer Page CTA Conditional Display and Trigger ---
    // Ensure this logic correctly triggers the general lead capture popup
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


    // --- Cart Functionality ---
    function updateCartCount() {
        if (cartCountElement) {
            let totalItems = 0;
            cart.forEach(item => {
                totalItems += item.quantity;
            });
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
            // If item already in cart, increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
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

    if (buyNowButtons.length > 0) {
        buyNowButtons.forEach(button => {
            button.addEventListener('click', function() {
                const serviceId = this.dataset.serviceId;
                const serviceName = this.dataset.serviceName;
                const servicePrice = this.dataset.servicePrice;
                addToCart(serviceId, serviceName, servicePrice);
            });
        });
    } else {
        console.log("No 'Buy Now' buttons found for cart functionality.");
    }

    // Initial cart count update on page load
    updateCartCount();
    console.log("Cart script initialized.");


    // --- Stripe Payment Integration (for checkout.html) ---
    // Only run this block if the payment form and its related elements exist on the page
    if (paymentForm && paymentElementContainer && submitPaymentBtn && paymentSuccessMessage) {
        console.log("Stripe checkout elements found. Initializing Stripe.");
        // Initialize Stripe.js with your **PUBLISHABLE KEY**.
        // Get this from your Stripe Dashboard -> Developers -> API keys (starts with 'pk_live_').
        const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ');

        let elements;
        let clientSecret;

        // Function to fetch the client secret from your Render.com backend
        async function fetchPaymentIntentClientSecret() {
            try {
                // This is the URL to your Render.com backend API for creating a PaymentIntent
                const backendUrl = 'https://my-stripe-backend-api.onrender.com';
                const createIntentEndpoint = `${backendUrl}/create-payment-intent`;

                // Ensure productPriceElement exists and has content before parsing
                let amountValue = 10000; // Default to $100.00 (in cents) if element not found/parsed
                if (productPriceElement && productPriceElement.textContent) {
                    const priceText = productPriceElement.textContent.trim();
                    const parsedPrice = parseFloat(priceText);
                    if (!isNaN(parsedPrice)) {
                        amountValue = parsedPrice * 100; // Convert to cents
                        console.log(`Using product price: $${parsedPrice} (amount: ${amountValue} cents)`);
                    } else {
                        console.warn(`Could not parse product price from element text: "${priceText}". Using default of $100.`);
                    }
                } else {
                    console.warn("Product price element not found or empty. Using default of $100.");
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

            const customerNameInput = document.getElementById('customer-name');
            const customerEmailInput = document.getElementById('customer-email');
            const customerName = customerNameInput ? customerNameInput.value : null;
            const customerEmail = customerEmailInput ? customerEmailInput.value : null;

            const { error } = await stripe.confirmPayment({
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

            if (error) {
                if (paymentErrorMessageDiv) {
                    paymentErrorMessageDiv.textContent = error.message;
                    paymentErrorMessageDiv.style.display = 'block';
                }
                if (submitPaymentBtn) {
                    submitPaymentBtn.disabled = false;
                    submitPaymentBtn.textContent = 'Pay Now';
                }
                console.error("Stripe confirmPayment error:", error);
            } else {
                // Payment succeeded on the client side (e.g., no 3D Secure redirect needed)
                paymentForm.style.display = 'none';
                if (paymentSuccessMessage) {
                    paymentSuccessMessage.style.display = 'block';
                }
                console.log("Payment confirmed successfully (no redirect).");
                // You might want to clear the cart or perform other post-purchase actions here
            }
        });
    }

    // --- Handle return from Stripe (e.g., after 3D Secure) on payment-success.html ---
    // This part should be on your payment-success.html page or run conditionally
    // if script.js is loaded on payment-success.html as well.
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretFromUrl = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (clientSecretFromUrl && redirectStatus && window.location.pathname === '/payment-success.html') {
        console.log("Processing Stripe redirect on payment-success.html.");
        // Re-initialize Stripe on the success page
        const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ'); // *** Use your LIVE PUBLISHABLE KEY here too! ***

        const successMessageDiv = document.getElementById('payment-success-message');
        const errorMessageDiv = document.getElementById('error-message');

        stripe.retrievePaymentIntent(clientSecretFromUrl).then(({ paymentIntent }) => {
            if (successMessageDiv && errorMessageDiv) {
                if (paymentIntent.status === 'succeeded') {
                    successMessageDiv.style.display = 'block';
                    errorMessageDiv.style.display = 'none';
                    console.log('Payment Succeeded:', paymentIntent);
                    // Clear cart or perform post-purchase actions here
                    localStorage.removeItem('shoppingCart'); // Example: clear cart after successful payment
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

    
