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
    // Select Formspree forms by their specific IDs (one for main, one for checkout if different HTML)
    const leadCaptureFormMain = document.getElementById('lead-capture-form-main'); // For index.html (and view-cart.html popup)
    const leadCaptureFormCheckout = document.getElementById('lead-capture-form-checkout'); // For checkout.html popup
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvgajnqr"; // Your Formspree endpoint


    // --- Shopify Offer Page CTA Elements ---
    const shopifyCta = document.getElementById('shopify-offer-cta');
    const triggerLeadPopupBtn = document.getElementById('trigger-lead-popup');

    // --- Cart Elements (Universal for header and other pages) ---
    const cartCountElement = document.getElementById('cart-count'); // Universal cart count in header
    const buyNowButtons = document.querySelectorAll('.buy-now-btn'); // On index.html

    // Cart elements specific to view-cart.html
    const cartItemsContainer = document.getElementById('cart-items-container-main'); // This holds the glowing container
    const cartTotalElement = document.getElementById('cart-total'); // This displays the total within the summary
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn'); // Button to checkout
    const emptyCartMessageElement = document.getElementById('empty-cart-message-main'); // Message for empty cart
    const cartSummarySectionElement = document.getElementById('cart-summary-section'); // Section holding total and actions


    // Load cart from localStorage or initialize as empty array
    let cart = [];
    try {
        const storedCart = localStorage.getItem('shoppingCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            console.log("Script init: Cart loaded from localStorage:", JSON.stringify(cart, null, 2));
        } else {
            console.log("Script init: No cart found in localStorage. Initializing as empty.");
        }
    } catch (e) {
        console.error("Script init: Error parsing cart from localStorage:", e);
    }

    // --- Helper function to show/hide the main popup container ---
    function showPopup(contentToShow) {
        if (mainPopupContainer) {
            // Hide all content types first
            if (cookieConsentContent) cookieConsentContent.style.display = 'none';
            if (leadCaptureContent) leadCaptureContent.style.display = 'none';

            // Show the specific content
            if (contentToShow === 'cookie' && cookieConsentContent) {
                // For cookie popup, use flex to enable original bottom-sticky behavior
                cookieConsentContent.style.display = 'flex';
            } else if (contentToShow === 'lead' && leadCaptureContent) {
                // For lead capture, block display is fine within the centered overlay
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
        // If cookies haven't been accepted AND it's not the checkout or success page
        if (!localStorage.getItem('cookiesAccepted') && !['/checkout.html', '/payment-success.html'].includes(window.location.pathname)) {
             showPopup('cookie');
             console.log("Cookie popup shown.");
        } else {
            // If cookies accepted, or on checkout/success page, proceed to lead capture logic
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

        // Find the message container within the specific popup
        // This is more robust than a single global formMessage
        const popupContent = form.closest('.popup-content');
        const messageContainer = popupContent ? popupContent.querySelector('#form-message') : null;

        if (messageContainer) {
            messageContainer.style.display = 'none';
            messageContainer.classList.remove('success', 'error');
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
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // --- SUCCESS LOGIC CHANGES ---

                // 1. Hide the form fields to make room for the thank you message.
                form.style.display = 'none';

                // 2. Display the success message.
                if (messageContainer) {
                    messageContainer.textContent = "Thank you! Your strategies are on their way. Check your inbox.";
                    messageContainer.classList.add('success');
                    messageContainer.style.display = 'block';
                }

                localStorage.setItem('leadCaptured', 'true');
                sessionStorage.setItem('leadCapturedThisSession', 'true');

                // 3. REMOVED the window.location.href redirect.
                //    Instead, we'll just hide the popup after a few seconds.
                setTimeout(() => {
                    hidePopup();
                    // After hiding, it's good practice to reset the form's visibility
                    // in case the user opens the popup again in the same session.
                    form.style.display = 'block';
                    form.reset();
                }, 4000); // Increased delay to 4 seconds for the user to read the message.

            } else {
                const data = await response.json();
                if (messageContainer) {
                    messageContainer.textContent = data.errors ? data.errors.map(err => err.message).join(', ') : 'Oops! Something went wrong. Please try again.';
                    messageContainer.classList.add('error');
                    messageContainer.style.display = 'block';
                }
                console.error('Formspree submission error:', data);
            }
        } catch (error) {
            console.error('Network error during form submission:', error);
            if (messageContainer) {
                messageContainer.textContent = 'Network error. Please check your connection and try again.';
                messageContainer.classList.add('error');
                messageContainer.style.display = 'block';
            }
        } finally {
            // This part now only runs on error, since on success the button is hidden.
            if (submitButton) {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
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
        // If on cart page, re-render display after save
        if (window.location.pathname === '/view-cart.html') {
            renderCartDisplay();
        }
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
    function renderCartDisplay() {
        console.log("View Cart page: renderCartDisplay() called. Current cart state:", JSON.stringify(cart, null, 2));

        // Ensure all required DOM elements exist for rendering
        if (!cartItemsContainer || !cartTotalElement || !emptyCartMessageElement || !cartSummarySectionElement || !proceedToCheckoutBtn) {
            console.error("View Cart page: One or more critical display elements are missing from the DOM. Cannot render cart.");
            // Log missing elements to help debug
            console.log('Missing: cartItemsContainer', !!cartItemsContainer);
            console.log('Missing: cartTotalElement', !!cartTotalElement);
            console.log('Missing: emptyCartMessageElement', !!emptyCartMessageElement);
            console.log('Missing: cartSummarySectionElement', !!cartSummarySectionElement);
            console.log('Missing: proceedToCheckoutBtn', !!proceedToCheckoutBtn);

            return; // Exit if elements aren't found
        }

        cartItemsContainer.innerHTML = ''; // Clear existing items
        let totalAmount = 0;

        if (cart.length === 0) {
            console.log("View Cart page: Cart is empty. Displaying empty message.");
            emptyCartMessageElement.style.display = 'block';
            cartSummarySectionElement.style.display = 'none';
            cartItemsContainer.style.display = 'none'; // Hide the glowing container if empty
            proceedToCheckoutBtn.disabled = true; // Disable checkout button
        } else {
            console.log(`View Cart page: Cart has ${cart.length} item(s). Rendering...`);
            emptyCartMessageElement.style.display = 'none';
            cartSummarySectionElement.style.display = 'block';
            cartItemsContainer.style.display = 'block'; // Show the glowing container
            proceedToCheckoutBtn.disabled = false; // Enable checkout button

            cart.forEach((item, index) => {
                if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
                    console.error("View Cart page: Invalid item in cart (price or quantity is not a number):", item);
                    return; // Skip invalid items
                }

                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="cart-item-details">
                        <strong>${item.name || 'Unnamed Item'}</strong>
                        <p>Price per item: $${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="btn-update-quantity" data-index="${index}" data-action="decrease" title="Decrease Quantity">-</button>
                        <span class="item-quantity-display">${item.quantity}</span>
                        <button class="btn-update-quantity" data-index="${index}" data-action="increase" title="Increase Quantity">+</button>
                    </div>
                    <div class="cart-item-subtotal">
                        <strong>Subtotal: $${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    <div class="cart-item-actions">
                        <button class="btn-remove-item" data-index="${index}" title="Remove Item">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
                totalAmount += item.price * item.quantity;
            });
        }

        cartTotalElement.innerHTML = `<strong>Grand Total: $${totalAmount.toFixed(2)}</strong>`;
        // Attach listeners only if they haven't been attached or if content was re-rendered
        attachCartActionListeners();
        updateCartCount(); // Update the header cart count
    }

    // Function to (re)attach event listeners for cart actions
    function attachCartActionListeners() {
        if (!cartItemsContainer) return; // Only proceed if the container exists

        // Remove old listeners to prevent duplicates (important if renderCartDisplay is called multiple times)
        cartItemsContainer.removeEventListener('click', handleCartItemButtonClick);
        // Add the new delegated listener
        cartItemsContainer.addEventListener('click', handleCartItemButtonClick);
    }

    // Delegated event handler for cart item buttons
    function handleCartItemButtonClick(event) {
        if (event.target.classList.contains('btn-remove-item')) {
            const indexToRemove = parseInt(event.target.dataset.index);
            removeItemFromCart(indexToRemove);
        } else if (event.target.classList.contains('btn-update-quantity')) {
            const itemIndex = parseInt(event.target.dataset.index);
            const action = event.target.dataset.action;
            updateItemQuantity(itemIndex, action);
        }
    }

    function removeItemFromCart(index) {
        if (index > -1 && index < cart.length) {
            cart.splice(index, 1);
            saveCart(); // This calls renderCartDisplay()
        }
    }

    function updateItemQuantity(index, action) {
        if (index > -1 && index < cart.length) {
            if (action === 'increase') {
                cart[index].quantity += 1;
            } else if (action === 'decrease') {
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1); // Remove if quantity drops to 0 or less
                }
            }
            saveCart(); // This calls renderCartDisplay()
        }
    }

    // Handle "Proceed to Checkout" button click on view-cart.html
    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                window.location.href = '/checkout.html';
            } else {
                alert("Your cart is empty. Please add items before proceeding to checkout.");
                proceedToCheckoutBtn.disabled = true; // Just in case, keep it disabled
            }
        });
    }

    // Initial cart rendering if on view-cart.html when script loads
    if (window.location.pathname === '/view-cart.html') {
        renderCartDisplay();
    }


    // Initial update of cart count in header on any page load
    updateCartCount();
    console.log("Cart functionality initialized across site.");


    // --- Stripe Payment Integration (for checkout.html) ---
    // Get references to Stripe related elements early, but only initialize Stripe if on checkout.html
    const paymentForm = document.getElementById('payment-form');
    const paymentElementContainer = document.getElementById('payment-element');
    const paymentErrorMessageDiv = document.getElementById('error-message');
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    const paymentSuccessMessage = document.getElementById('payment-success-message');
    const checkoutCartTotalDisplayElement = document.getElementById('cart-total-price'); // On checkout.html

    const isCheckoutPage = window.location.pathname === '/checkout.html';

    // *** IMPORTANT: Added more specific logging to pinpoint missing elements ***
    console.log('DEBUG (Checkout Stripe Init Check): On checkout page:', isCheckoutPage);
    console.log('DEBUG (Checkout Stripe Init Check): paymentForm element found:', !!paymentForm, paymentForm);
    console.log('DEBUG (Checkout Stripe Init Check): paymentElementContainer element found:', !!paymentElementContainer, paymentElementContainer);
    console.log('DEBUG (Checkout Stripe Init Check): submitPaymentBtn element found:', !!submitPaymentBtn, submitPaymentBtn);
    console.log('DEBUG (Checkout Stripe Init Check): paymentSuccessMessage element found:', !!paymentSuccessMessage, paymentSuccessMessage);


    if (isCheckoutPage && paymentForm && paymentElementContainer && submitPaymentBtn && paymentSuccessMessage) {
        console.log("Stripe checkout elements found AND on checkout page. Initializing Stripe.");

        // On checkout.html, update the cart total price element
        const checkoutTotal = calculateCartTotal();
        if (checkoutCartTotalDisplayElement) {
            checkoutCartTotalDisplayElement.textContent = checkoutTotal.toFixed(2); // Display total with 2 decimal places
            console.log("Checkout page: Cart total displayed as $", checkoutTotal.toFixed(2));
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
                let amountValue = checkoutTotal * 100; // Convert to cents

                if (amountValue <= 0) { // Prevent creating intent for $0 or less
                    console.error("Cart total is zero or negative. Cannot create payment intent.");
                    if (paymentErrorMessageDiv) {
                        paymentErrorMessageDiv.textContent = "Cannot process an empty or zero-value order. Please add items to your cart.";
                        paymentErrorMessageDiv.style.display = 'block';
                    }
                    // Disable submit button and hide form if amount is invalid
                    if (submitPaymentBtn) submitPaymentBtn.disabled = true;
                    paymentForm.style.display = 'none';
                    return null;
                }

                // *** This is the crucial line that defines currency ***
                const currency = 'usd';

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
                // This is line 496, where the error originated. Now it should reference the `currency`
                console.error('Error fetching client secret:', error.message);
                if (paymentErrorMessageDiv) {
                    paymentErrorMessageDiv.textContent = `Payment initialization failed: ${error.message}. Please refresh and try again.`;
                    paymentErrorMessageDiv.style.display = 'block';
                }
                // Disable submit button and hide form on backend error
                if (submitPaymentBtn) submitPaymentBtn.disabled = true;
                paymentForm.style.display = 'none';
                return null;
            }
        }

        async function initializeStripeElements() {
            clientSecret = await fetchPaymentIntentClientSecret();

            if (clientSecret) {
                elements = stripe.elements({ clientSecret });
                const paymentElement = elements.create('payment');
                paymentElement.mount('#payment-element');
                paymentForm.style.display = 'block'; // Show form only after element mounts
                console.log("Stripe Payment Element mounted.");
            } else {
                paymentForm.style.display = 'none'; // Hide form if no client secret
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
