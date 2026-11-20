
/*
 * ArnisScore Universal Back Button
 * Returns to the actual previous browser history entry.
 */

// Prevent this script from registering multiple click handlers.
if (!window.arnisscoreBackButtonInitialized) {

    window.arnisscoreBackButtonInitialized = true;

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".universal-back");

        if (!button) return;

        event.preventDefault();

        // Return to the immediately previous browser history entry.
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback when no previous history entry exists.
            const fallback =
                button.getAttribute("href") ||
                button.dataset.fallback ||
                "index.html";

            window.location.href = fallback;
        }

    });

}
