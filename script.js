document.addEventListener('DOMContentLoaded', function() {
    // --- Common DOM Elements (used across functionalities) ---
    const mainPopupContainer = document.getElementById('main-popup-container');

    // --- Cookie Consent & Lead Capture Popup Elements ---
    const cookieConsentContent = document.getElementById('cookie-consent-content');
    const leadCaptureContent = document.getElementById('lead-capture-content');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const leadCaptureForm = document.getElementById('lead-capture-form');
    const closeLeadFormBtn = document.getElementById('close-lead-form');
    const formMessage = document.getElementById('form-message');

    // --- Shopify Offer Page CTA Elements ---
    const shopifyCta = document.getElementById('shopify-offer-cta');
    const triggerLeadPopupBtn = document.getElementById('trigger-lead-popup');

    // --- Cart Count Elements ---
    const cartCountElement = document.getElementById('cart-count');

    // --- Stripe Payment Elements (for checkout.html) ---
    const paymentForm = document.getElementById('payment-form');
    const paymentElementContainer = document.getElementById('payment-element');
    const paymentErrorMessageDiv = document.getElementById('error-message');
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    const paymentSuccessMessage = document.getElementById('payment-success-message');
    const productPriceElement = document.getElementById('product-price');

    // --- Helper function to show/hide the main popup container ---
    function showPopup() {
        if (mainPopupContainer) {
            mainPopupContainer.classList.add('show');
        }
    }

    function hidePopup() {
        if (mainPopupContainer) {
            mainPopupContainer.classList.remove('show');
        }
    }

    // --- Cookie Consent Logic ---
    function handleCookieConsent() {
        if (!localStorage.getItem('cookiesAccepted')) {
            if (cookieConsentContent) {
                cookieConsentContent.style.display = 'block';
            }
            if (leadCaptureContent) {
                leadCaptureContent.style.display = 'none';
            }
            setTimeout(showPopup, 1500); // Show main popup after a delay
        } else {
            handleLeadCaptureDisplay(); // Cookies already accepted, proceed to show lead form
        }
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            if (cookieConsentContent) {
                cookieConsentContent.style.display = 'none';
            }
            handleLeadCaptureDisplay(); // Now, show the lead capture form
        });
    }

    // --- Lead Capture Form Display Logic ---
    function handleLeadCaptureDisplay() {
        if (localStorage.getItem('cookiesAccepted') === 'true' && !localStorage.getItem('leadCaptured')) {
            if (leadCaptureContent) {
                leadCaptureContent.style.display = 'block';
            }
            if (cookieConsentContent) {
                cookieConsentContent.style.display = 'none';
            }
            setTimeout(showPopup, 500); // Show lead capture popup shortly after cookie action/initial load
        } else {
            hidePopup(); // Either cookies not accepted yet, or lead already captured
        }
    }

    // --- Lead Capture Form Submission Logic (Formspree) ---
    if (leadCaptureForm) {
        leadCaptureForm.addEventListener('submit', async function(event) {
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
                    localStorage.setItem('leadCaptured', 'true');

                    setTimeout(() => {
                        if (leadCaptureContent) leadCaptureContent.style.display = 'none';
                        hidePopup();
                    }, 3000);

                } else {
                    const data = await response.json();
                    if (formMessage) {
                        formMessage.textContent = data.errors ? data.errors.map(err => err.message).join(', ') : 'Oops! Something went wrong. Please try again later.';
                        formMessage.classList.add('error');
                        formMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
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
        });
    }

    if (closeLeadFormBtn) {
        closeLeadFormBtn.addEventListener('click', function() {
            hidePopup();
        });
    }

    // --- Initial call to start the popup sequence on page load ---
    handleCookieConsent();


    // --- Shopify Offer Page CTA Conditional Display and Trigger ---
    if (shopifyCta) {
        if (localStorage.getItem('leadCaptured') === 'true') {
            shopifyCta.style.display = 'none';
        } else {
            shopifyCta.style.display = 'block';
        }

        if (triggerLeadPopupBtn) {
            triggerLeadPopupBtn.addEventListener('click', function() {
                if (cookieConsentContent) cookieConsentContent.style.display = 'none';
                if (leadCaptureContent) leadCaptureContent.style.display = 'block';
                showPopup();
            });
        }
    }


    // --- Cart Count Update (Placeholder - assuming simple localStorage cart) ---
    function updateCartCount() {
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartCountElement.textContent = cart.length;
        }
    }
    updateCartCount();


    // --- Stripe Payment Integration (for checkout.html) ---
    if (paymentForm && paymentElementContainer && submitPaymentBtn && paymentSuccessMessage) {
        // Initialize Stripe.js with your **PUBLISHABLE KEY**.
        // Get this from your Stripe Dashboard -> Developers -> API keys (starts with 'pk_test_').
        const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ');

        let elements;
        let clientSecret;

        // Function to fetch the client secret from your Render.com backend
        async function fetchPaymentIntentClientSecret() {
            try {
                // This is the URL to your Render.com backend API for creating a PaymentIntent
                // Confirmed URL based on previous discussion: https://my-stripe-backend-api.onrender.com
                const backendUrl = 'https://my-stripe-backend-api.onrender.com';
                const createIntentEndpoint = `${backendUrl}/create-payment-intent`;

                const amountValue = productPriceElement ? parseFloat(productPriceElement.textContent) * 100 : 10000;
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
                console.error('Error fetching client secret:', error, error.message);
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
            } else {
                paymentForm.style.display = 'none';
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
                redirect: 'if_required'
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
            } else {
                paymentForm.style.display = 'none';
                if (paymentSuccessMessage) {
                    paymentSuccessMessage.style.display = 'block';
                }
            }
        });
    }

    // --- Handle return from Stripe (e.g., after 3D Secure) on payment-success.html ---
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretFromUrl = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (clientSecretFromUrl && redirectStatus && window.location.pathname === '/payment-success.html') {
        const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'); // <--- REPLACE THIS!

        stripe.retrievePaymentIntent(clientSecretFromUrl).then(({ paymentIntent }) => {
            const successMessageDiv = document.getElementById('payment-success-message');
            const errorMessageDiv = document.getElementById('error-message');

            if (successMessageDiv && errorMessageDiv) {
                if (paymentIntent.status === 'succeeded') {
                    successMessageDiv.style.display = 'block';
                    errorMessageDiv.style.display = 'none';
                    console.log('Payment Succeeded:', paymentIntent);
                } else {
                    errorMessageDiv.textContent = `Payment failed: ${paymentIntent.status}. Please contact support.`;
                    errorMessageDiv.style.display = 'block';
                    successMessageDiv.style.display = 'none';
                    console.error('Payment Failed:', paymentIntent);
                }
            }
        });
    }
});
