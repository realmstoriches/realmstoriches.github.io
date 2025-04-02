// Initialize intlTelInput
const phoneInput = document.querySelector("#phone");
const intlTelInput = window.intlTelInput(phoneInput, {
  utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.18/js/utils.js",
});

// Form Validation
document.getElementById("contact-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the default form submission

  let isValid = true;

  // Name Validation
  const nameInput = document.getElementById("name");
  const nameError = document.getElementById("name-error");
  if (nameInput.value.trim() === "") {
    nameError.textContent = "Please enter your name.";
    isValid = false;
  } else {
    nameError.textContent = "";
  }

  // Email Validation
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("email-error");
  if (emailInput.value.trim() === "") {
    emailError.textContent = "Please enter your email.";
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    emailError.textContent = "Please enter a valid email address.";
    isValid = false;
  } else {
    emailError.textContent = "";
  }

  // Phone Validation
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  if (phoneInput.value.trim() === "") {
    phoneError.textContent = "Please enter your phone number.";
    isValid = false;
  } else if (!intlTelInput.isValidNumber()) {
    phoneError.textContent = "Please enter a valid phone number.";
    isValid = false;
  } else {
    phoneError.textContent = "";
  }

  // Message Validation
  const messageInput = document.getElementById("message");
  const messageError = document.getElementById("message-error");
  if (messageInput.value.trim() === "") {
    messageError.textContent = "Please enter your message.";
    isValid = false;
  } else {
    messageError.textContent = "";
  }

  if (isValid) {
    // Form submission logic here (e.g., AJAX request)
    alert("Form submitted successfully!");
  }
});

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
<<<<<<< HEAD
}
=======
}
>>>>>>> 03660e42e876fb20c87225054ebceb0581ee3c6a
