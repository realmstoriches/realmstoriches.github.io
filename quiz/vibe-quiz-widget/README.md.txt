# Vibe Coding Tool Quiz Widget

A simple, embeddable, mobile-first quiz widget to help users find their "perfect vibe coding tool". Built with pure HTML, Tailwind CSS (via CDN), and vanilla JavaScript. Optimized for conversion using CRO best practices.

## Files Included

* `index.html`: The main HTML structure for the quiz.
* `vibe-quiz.js`: Contains all the JavaScript logic for quiz functionality (steps, answers, validation, submission, results).
* `results.json`: A sample JSON file containing the possible quiz outcomes (tool ID, headline, CTA URL).
* `README.md`: This file, containing setup and usage instructions.

## Embedding the Quiz

1.  **Upload Files:** Place `index.html`, `vibe-quiz.js`, and `results.json` on your web server or hosting platform (like Netlify, Vercel, GitHub Pages, etc.). Ensure they are accessible via public URLs. *See Netlify deployment guide below.*
2.  **Add Snippet to Your Site:** Paste the following HTML snippet into the `<body>` of the page where you want the quiz to appear:

    ```html
    <div id="vibe-quiz-container">
        </div>
    <iframe src="YOUR_DEPLOYED_QUIZ_URL/index.html" width="100%" height="650" style="border:none; max-width: 512px; display: block; margin: 1em auto;" title="Vibe Coding Tool Quiz"></iframe>

    ```

    * **For Iframe:** Replace `YOUR_DEPLOYED_QUIZ_URL/index.html` with the actual URL where you hosted the `index.html` file (e.g., your Netlify URL). Adjust `height`, `max-width`, and other styles as needed to fit your site layout.
    * **For Direct Embed:**
        * Replace `path/to/your/results.json` with the correct URL path to your `results.json` file relative to the embedding page *or* an absolute URL. The `data-results-src` attribute tells the script where to fetch the results from.
        * Replace `path/to/your/vibe-quiz.js` with the correct URL path to your `vibe-quiz.js` file.
        * **Note:** Direct embedding might lead to style conflicts if your host site also uses Tailwind or has conflicting global styles. The iframe method avoids this.

## Customization

* **Results Data:**
    * Modify the `results.json` file to change the headlines, CTA URLs, or add/remove tools. Make sure the `id` values in the JSON match the `data-tool` values used on the buttons in `index.html` and the `TOOL_PRIORITY` array in `vibe-quiz.js`.
    * To use a different URL for the results file without modifying the JS, change the `data-results-src` attribute value in the embed snippet (if using direct embed) or the `index.html` file itself.
* **Primary Color:** The primary color is set using Tailwind's `indigo` classes (e.g., `bg-indigo-600`, `text-indigo-600`, `border-indigo-500`). To change it, search and replace these classes in `index.html` and `vibe-quiz.js` with another Tailwind color (e.g., replace `indigo` with `blue`, `green`, `purple`, etc.).
* **Questions & Answers:** Edit the `<h2>` text within each `#step-X` div in `index.html` to change the questions. Modify the emoji, text, and `data-tool` attributes on the `<button>` elements to change the answer options and how they map to results.
* **Tie-Breaker Logic:** Edit the `TOOL_PRIORITY` array constant near the top of `vibe-quiz.js` to change which tool wins in case of a tie in scores. The tool listed first has the highest priority.
* **Submission Endpoint:** If you want to collect emails, update the `SUBMIT_ENDPOINT` constant in `vibe-quiz.js` to point to your actual backend API endpoint.

## A/B Testing Hooks

Several key elements have `data-test` attributes for easier selection in A/B testing tools (like Google Optimize, VWO, etc.):

* `data-test="quiz-title"`
* `data-test="quiz-social-proof"`
* `data-test="quiz-step-X"` (for each step container)
* `data-test="quiz-answer"` (on answer buttons)
* `data-test="quiz-email-input"`
* `data-test="quiz-submit"`
* `data-test="quiz-privacy"`
* `data-test="quiz-result"`
* `data-test="quiz-result-cta"`

Use these attributes as selectors in your A/B testing platform to target elements for variations.

## Deployment to Netlify & Embedding via Iframe

This method is recommended for easy deployment and isolation from your main site's styles/scripts.

1.  **Prepare Files:** Create a folder (e.g., `vibe-quiz-widget`) on your computer and place `index.html`, `vibe-quiz.js`, and `results.json` inside it.
2.  **Sign Up/Log In:** Go to [Netlify](https://www.netlify.com/) and sign up for a free account or log in.
3.  **Deploy:**
    * Navigate to your "Sites" page on Netlify.
    * Drag and drop the `vibe-quiz-widget` folder directly onto the deployment area (usually indicated by "Drag and drop your site folder here").
    * Netlify will upload the files and automatically build and deploy your site.
4.  **Get URL:** Once deployed, Netlify will assign a unique URL (e.g., `https://random-adjective-noun-12345.netlify.app`). Click on this URL to view the live quiz. This is `YOUR_DEPLOYED_QUIZ_URL`.
5.  **Embed with Iframe:** Go to the page on your main website where you want the quiz. Paste the following HTML code, replacing the `src` attribute with the Netlify URL you just got:

    ```html
    <iframe
        src="https://YOUR_NETLIFY_URL.netlify.app/"
        width="100%"
        height="650" /* Adjust height as needed */
        style="border: none; max-width: 512px; display: block; margin: 1em auto;" /* Basic centering and sizing */
        title="Find Your Perfect Vibe Coding Tool Quiz">
    </iframe>
    ```

    * Adjust the `height`, `max-width`, and `margin` styles in the `style` attribute to best fit the layout and design of your embedding page. The `max-width` helps control the size on larger screens, matching the `max-w-lg` in the quiz's own CSS.
    * The quiz inside the iframe will handle its own responsiveness based on the iframe's width.

Your quiz widget should now be live and embedded on your site!