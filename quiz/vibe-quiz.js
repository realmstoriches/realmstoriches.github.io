document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const quizContainer = document.getElementById('vibe-quiz');
    const stepsContainer = document.getElementById('quiz-steps');
    const quizSteps = document.querySelectorAll('.quiz-step');
    const progressBarInner = document.getElementById('quiz-progress-bar-inner');
    const progressText = document.getElementById('quiz-progress-text');
    const emailInput = document.getElementById('email');
    const submitButton = document.getElementById('submit-quiz');
    const errorMessageDiv = document.getElementById('error-message');
    const resultContainer = document.getElementById('quiz-result');
    const resultHeadline = document.getElementById('result-headline');
    const resultCta = document.getElementById('result-cta');

    // --- State ---
    let currentStep = 1;
    const totalSteps = 5; // Total number of steps including email form
    const answers = [];
    const resultsUrl = quizContainer.dataset.resultsSrc || 'results.json'; // Get results URL from data attribute or default

    // --- Constants ---
    // To associate an answer with a different outcome, just change that button’s data-tool value in HTML or update the priority array.
    const TOOL_PRIORITY = ['tool-alpha', 'tool-beta', 'tool-gamma']; // Tie-breaker priority (edit this list to change defaults)
    const SUBMIT_ENDPOINT = 'https://authorityhacker.com/hook'; // Replace with your actual endpoint if needed

    // --- Functions ---

    /**
     * Updates the progress bar and text.
     */
    function updateProgress() {
        const progressPercentage = Math.max(0, (currentStep - 1) / totalSteps * 100);
        progressBarInner.style.width = `${progressPercentage}%`;

        if (currentStep < totalSteps) {
            const stepsRemaining = totalSteps - currentStep;
            progressText.textContent = `Step ${currentStep} of ${totalSteps}. ${stepsRemaining} question${stepsRemaining > 1 ? 's' : ''} left!`;
        } else if (currentStep === totalSteps) {
             progressText.textContent = `Just one step away from your perfect tool!`;
        } else {
            // Handle result display scenario (optional: clear text or show completion)
            progressText.textContent = `Quiz Complete!`;
            progressBarInner.style.width = `100%`;
        }
    }

    /**
     * Shows the specified step and hides others.
     * @param {number} stepNum - The step number to show (1-based).
     */
    function showStep(stepNum) {
        quizSteps.forEach((step, index) => {
            if ((index + 1) === stepNum) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });
        updateProgress();
    }

    /**
     * Validates email using a simple regex.
     * @param {string} email - The email address to validate.
     * @returns {boolean} - True if valid, false otherwise.
     */
    function validateEmail(email) {
        // Basic HTML5 validation is primary, this is a fallback/enhancement
        if (!email) return false;
        const valid = /^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/.test(email);
        return valid;
    }

    /**
     * Shows an inline error message below the email input.
     * @param {string} message - The error message to display.
     */
    function showInlineError(message) {
        errorMessageDiv.textContent = message;
        emailInput.classList.add('border-red-500'); // Highlight input border
    }

    /**
     * Clears the inline error message.
     */
    function clearInlineError() {
        errorMessageDiv.textContent = '';
        emailInput.classList.remove('border-red-500'); // Remove highlight
    }

    /**
     * Determines the result ID based on answer counts and priority.
     * @param {string[]} userAnswers - Array of selected tool IDs.
     * @returns {string} - The ID of the winning tool.
     */
    function determineResultId(userAnswers) {
        // 1) Tally counts for each tool ID
        const scores = userAnswers.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        // Check if any answers were recorded
        if (Object.keys(scores).length === 0) {
            // No answers, return the first priority tool as a default
            return TOOL_PRIORITY[0];
        }

        // 2) Tie‑breaker priority is defined in TOOL_PRIORITY constant

        // 3) Pick highest score; on tie, use priority order
        const sortedScores = Object.entries(scores)
            .sort((a, b) => {
                // Sort primarily by score (descending)
                if (b[1] !== a[1]) return b[1] - a[1];
                // If scores are tied, sort by priority index (ascending)
                return TOOL_PRIORITY.indexOf(a[0]) - TOOL_PRIORITY.indexOf(b[0]);
            });

        return sortedScores[0][0]; // Return the ID of the top tool
    }

    /**
     * Renders the final result section.
     * @param {object} resultData - Object containing headline and ctaUrl.
     */
    function renderResult({ headline, ctaUrl }) {
        resultHeadline.textContent = headline;
        resultCta.href = ctaUrl;

        stepsContainer.classList.add('hidden'); // Hide all step content
        resultContainer.classList.remove('hidden'); // Show result section
        currentStep = totalSteps + 1; // Move past the final step
        updateProgress(); // Update progress to show 100% / completion text
    }

    /**
     * Handles the submission process: validation, fetch, result display.
     * @param {string} email - User's email address.
     * @param {string[]} userAnswers - Array of selected tool IDs.
     */
    async function submitQuiz(email, userAnswers) {
        clearInlineError();
        submitButton.disabled = true; // Prevent double-clicks
        submitButton.textContent = 'Submitting...';

        // Basic Frontend Validation
        if (!validateEmail(email)) {
            showInlineError('Please enter a valid email address.');
            submitButton.disabled = false;
            submitButton.innerHTML = `See My Tool <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`; // Restore text + icon
            return;
        }

        try {
            // 1. Post email and answers (optional - depends on your backend needs)
            // Using a placeholder endpoint as specified. Replace if you have a real one.
            const postRes = await fetch(SUBMIT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, answers: userAnswers })
            });

            // Check if the POST was successful (optional, depending on endpoint)
            if (!postRes.ok) {
                 // Log the error but proceed to show results anyway for better UX
                 console.warn(`Email submission failed with HTTP ${postRes.status}. Proceeding to show results locally.`);
                 // throw new Error(`HTTP ${postRes.status}`); // Uncomment to block results if POST fails
            }

            // 2. Fetch results data
            const resultsRes = await fetch(resultsUrl);
            if (!resultsRes.ok) throw new Error(`Failed to fetch results: ${resultsRes.status}`);
            const resultsData = await resultsRes.json();

            // 3. Determine the result
            const resultId = determineResultId(userAnswers);
            const match = resultsData.find(r => r.id === resultId);

            // 4. Render the result
            if (match) {
                renderResult({ headline: match.headline, ctaUrl: match.ctaUrl });
            } else {
                 console.error("No matching result found for ID:", resultId);
                 // Fallback: Show the first result or a generic message
                 const fallbackResult = resultsData[0] || { headline: 'Quiz Complete!', ctaUrl: '#' };
                 renderResult(fallbackResult);
                 showInlineError('Could not determine a specific result. Showing default.'); // Inform user
            }

        } catch (err) {
            console.error("Quiz submission error:", err);
            showInlineError('Something went wrong. Please try again.');
            submitButton.disabled = false;
            submitButton.innerHTML = `See My Tool <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`; // Restore text + icon
        }
    }

    // --- Event Listeners ---

    // Use event delegation for answer buttons
    stepsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-tool]'); // Find the closest button ancestor with data-tool
        if (button && currentStep < totalSteps) {
            const toolId = button.dataset.tool;
            answers.push(toolId);
            currentStep++;
            showStep(currentStep);
        }
    });

    // Submit button click
    submitButton.addEventListener('click', () => {
        const email = emailInput.value.trim();
        submitQuiz(email, answers);
    });

    // Clear error on email input
    emailInput.addEventListener('input', clearInlineError);


    // --- Initialization ---
    showStep(currentStep); // Show the first step initially

}); // End DOMContentLoaded