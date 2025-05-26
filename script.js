// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {

    // Initialize intlTelInput
    const phoneInput = document.querySelector("#phone");
    // Check if the phoneInput element exists on the page
    let intlTelInputInstance = null;
    if (phoneInput) {
        intlTelInputInstance = window.intlTelInput(phoneInput, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.18/js/utils.js",
            // Add any other intlTelInput options here, e.g., initialCountry: "us"
        });
    }


    // Helper function for basic email validation
    function isValidEmail(email) {
        // A common regex for email validation
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Get the form and status element
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("contact-form-status"); // Make sure you have this element in your HTML

    // Add event listener ONLY if the form element exists
    if (contactForm) {
        contactForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent the default form submission

            // Clear previous error messages
            document.getElementById("name-error").textContent = "";
            document.getElementById("email-error").textContent = "";
            document.getElementById("phone-error").textContent = "";
            document.getElementById("message-error").textContent = "";
            formStatus.textContent = ""; // Clear status message

            let isValid = true;

            // Get input and error elements
            const nameInput = document.getElementById("name");
            const nameError = document.getElementById("name-error");
            const emailInput = document.getElementById("email");
            const emailError = document.getElementById("email-error");
            const phoneInput = document.getElementById("phone"); // Get again if needed, or reuse the outer scope one
            const phoneError = document.getElementById("phone-error");
            const messageInput = document.getElementById("message"); // Assuming textarea or input type="text"
            const messageError = document.getElementById("message-error");


            // --- Validation Checks ---

            // Name Validation
            if (!nameInput || nameInput.value.trim() === "") {
                if (nameError) nameError.textContent = "Please enter your name.";
                isValid = false;
            }

            // Email Validation
            if (!emailInput || emailInput.value.trim() === "") {
                if (emailError) emailError.textContent = "Please enter your email.";
                isValid = false;
            } else if (emailInput && !isValidEmail(emailInput.value)) {
                 if (emailError) emailError.textContent = "Please enter a valid email address.";
                isValid = false;
            }

            // Phone Validation (Only if intlTelInput was initialized)
            if (!phoneInput || phoneInput.value.trim() === "") {
                if (phoneError) phoneError.textContent = "Please enter your phone number.";
                isValid = false;
            } else if (intlTelInputInstance && !intlTelInputInstance.isValidNumber()) {
                 if (phoneError) phoneError.textContent = "Please enter a valid phone number.";
                isValid = false;
            }
             // Note: If intlTelInputInstance is null (phone input not found), validation might skip or error.
             // Added checks for input existence above.


            // Message Validation (Completed)
            if (!messageInput || messageInput.value.trim() === "") {
                 if (messageError) messageError.textContent = "Please enter your message.";
                isValid = false;
            }
             // Add minimum length check if desired, e.g.:
             // else if (messageInput.value.trim().length < 10) {
             //    if (messageError) messageError.textContent = "Message must be at least 10 characters long.";
             //    isValid = false;
             // }


            // --- Submission Logic ---

            if (isValid) {
                // If validation passes, proceed with submission
                // You can use the form's built-in submit() method or fetch
                // Using fetch is generally preferred for AJAX submission without page reload

                // Get the Formspree URL from the form's action attribute
                const formAction = contactForm.action;
                const formData = new FormData(contactForm); // Get form data

                // Disable the submit button to prevent double clicks
                const submitButton = contactForm.querySelector('button[type="submit"]');
                 if (submitButton) submitButton.disabled = true;


                try {
                    const response = await fetch(formAction, {
                        method: contactForm.method, // Use the form's method (POST)
                        body: formData,
                        headers: {
                             'Accept': 'application/json' // Required for Formspree AJAX
                        }
                    });

                    if (response.ok) {
                        // Success! Display success message and clear form
                        if (formStatus) {
                            formStatus.textContent = "Thank you for your message! We will get back to you shortly.";
                            formStatus.style.color = 'green'; // Style success message
                        }
                        contactForm.reset(); // Clear all form fields

                    } else {
                        // Error submitting form
                        const responseData = await response.json();
                        if (formStatus) {
                             if (Object.hasOwn(responseData, 'errors')) {
                                // Display specific Formspree errors if available
                                formStatus.textContent = responseData["errors"].map(error => error["message"]).join(", ");
                             } else {
                                // Generic error message
                                formStatus.textContent = "Oops! There was a problem sending your message.";
                             }
                             formStatus.style.color = 'red'; // Style error message
                        }
                         // You might want to re-enable the button here if there was an error
                         // if (submitButton) submitButton.disabled = false;
                    }

                } catch (error) {
                    // Network error or other issue during fetch
                    console.error('Form submission error:', error);
                    if (formStatus) {
                        formStatus.textContent = "Oops! There was a network error.";
                        formStatus.style.color = 'red'; // Style error message
                    }
                     // You might want to re-enable the button here if there was an error
                     // if (submitButton) submitButton.disabled = false;
                } finally {
                    // Re-enable the button if it wasn't a successful submission that clears/hides the form
                    // A common pattern is to *not* re-enable on success if the form is reset or a confirmation message replaces it.
                    // Re-enable here only if you want the user to be able to try again after an error
                     // if (!response || !response.ok) { // Check if fetch failed or response was not ok
                     //    if (submitButton) submitButton.disabled = false;
                     // }
                     // Alternative simple re-enable on error:
                     if (submitButton && formStatus && formStatus.style.color === 'red') {
                        submitButton.disabled = false;
                     }
                }
            } else {
                 // Validation failed, errors are already displayed next to inputs.
                 // Re-enable the submit button if it was potentially disabled before the validation block
                 // (Though in this structure, it's disabled *after* isValid check passes, so this isn't strictly necessary here)
                 // const submitButton = contactForm.querySelector('button[type="submit"]');
                 // if (submitButton && submitButton.disabled) submitButton.disabled = false;
            }
        });
    } else {
         console.error("Contact form element with ID 'contact-form' not found.");
    }
    
// Ensure this code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Stripe with your **PUBLISHABLE** API key
    // This key is safe to include in your frontend code.
    const stripe = Stripe('pk_live_51RSfPXFHtr1SOdkc0fjiQ9RPj66DoF4c4GPniCTJK6uCxCnsrDH97eR3F82uw2nfCorzsgUpJAsarYgmeCtzcDI700iFDHwLVJ');
    // In your frontend JavaScript file (e.g., script.js or embedded in index.html)
    const backendUrl = 'https://my-stripe-backend-api.onrender.com'; // <--- PASTE YOUR ACTUAL RENDER URL HERE!
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');

    buyNowButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default button action

            // Extract data attributes from the clicked button
            const serviceId = button.dataset.serviceId;
            const serviceName = button.dataset.serviceName;
            const servicePrice = button.dataset.servicePrice; // Price from HTML (e.g., 250, 1999)
            const serviceType = button.dataset.serviceType || 'one-time'; // 'subscription' or 'one-time'

            // Optional: Disable button to prevent multiple clicks
            button.disabled = true;
            button.textContent = 'Processing...';

            try {
                // Send the service data to your backend endpoint
                const response = await fetch('/create-checkout-session', { // <-- This is your backend endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        service_id: serviceId,
                        // You might not strictly need name/price/type here,
                        // as the backend should get authoritative data from DB.
                        // But sending for clarity/debugging can be useful.
                        service_name: serviceName,
                        service_price: servicePrice,
                        service_type: serviceType
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create Stripe Checkout session.');
                }

                const session = await response.json();

                // Redirect to Stripe Checkout using the session ID
                const { error } = await stripe.redirectToCheckout({
                    sessionId: session.id,
                });

                if (error) {
                    console.error('Stripe redirect error:', error.message);
                    alert('There was an issue redirecting to Stripe Checkout: ' + error.message);
                }
            } catch (error) {
                console.error('Error during checkout process:', error);
                alert('Error initiating checkout: ' + error.message);
            } finally {
                // Re-enable button
                button.disabled = false;
                button.textContent = 'Buy Now';
            }
        });
    });
});

