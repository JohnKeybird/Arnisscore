
const loaderScreen = document.getElementById("loaderScreen");
const loaderProgress = document.getElementById("loaderProgress");
const loaderPercentage = document.getElementById("loaderPercentage");

const fighterStage = document.getElementById("fighterStage");
const fighterRed = document.getElementById("fighterRed");
const fighterBlue = document.getElementById("fighterBlue");

const referee = document.getElementById("referee");
const winnerMessage = document.getElementById("winnerMessage");

let progress = 0;
let loaderStarted = false;

function startLoader() {
    if (loaderStarted) return;
    loaderStarted = true;

    const loadingInterval = setInterval(() => {
        progress++;

        const stageWidth = fighterStage.clientWidth;
        const center = stageWidth / 2;
        const movement = progress / 100;

        // BOTH FIGHTERS APPROACH THE CENTER
        const redStart = 8;
        const redEnd = center - 48;

        const blueStart = stageWidth - 50;
        const blueEnd = center + 6;

        fighterRed.style.left =
            (redStart + (redEnd - redStart) * movement) + "px";

        fighterBlue.style.left =
            (blueStart + (blueEnd - blueStart) * movement) + "px";

        // TWO-SIDED LOADING BAR
        loaderProgress.style.width = progress + "%";

        // UPDATE PERCENTAGE
        loaderPercentage.textContent = progress + "%";
        loaderPercentage.style.left =
            (center - 20) + "px";

        if (progress >= 100) {
            clearInterval(loadingInterval);

            // BEGIN BLUE STRIKE SEQUENCE
            startBlueStrike();
        }

    }, 30);
}


// =====================================
// BLUE STRIKES RED HEADGEAR
// =====================================

function startBlueStrike() {

    // Keep red fighter in its final position
    fighterRed.classList.remove("hit");

    // Blue raises its arm first
    fighterBlue.classList.add("raise-arm");

    // Blue swings its padded stick after raising its arm
    setTimeout(() => {
        fighterBlue.classList.add("strike-head");
        fighterStage.classList.add("impact");
    }, 250);

    // Blue wins after the strike lands
    setTimeout(() => {
        fighterBlue.classList.add("winner");
        referee.classList.add("announce");
        winnerMessage.classList.add("show");
    }, 650);

    // Hide loading screen after the announcement
    setTimeout(() => {
        loaderScreen.classList.add("finished");
    }, 2500);
}


// =====================================
// START LOADING AFTER PAGE LOADS
// =====================================

if (document.readyState === "complete") {
    startLoader();
} else {
    window.addEventListener("load", startLoader, { once: true });
}
