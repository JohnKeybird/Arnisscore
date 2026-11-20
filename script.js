/* ==========================================
   PUNTOS - REGULAR SCOREBOARD
   INDEPENDENT SCORING SYSTEM
========================================== */

// STORAGE
const HISTORY_KEY = "arnisScoreHistory";

// RESULT MODE
const params = new URLSearchParams(window.location.search);
const resultId = params.get("resultId");

const savedHistory = JSON.parse(
    localStorage.getItem(HISTORY_KEY) || "[]"
);

const savedResult = resultId
    ? savedHistory.find(match => String(match.id) === resultId)
    : null;

const isReadOnlyResult = !!savedResult;


// ==========================================
// PLAYER NAMES
// ==========================================

const redNameDisplay = document.getElementById("red-player-name");
const blueNameDisplay = document.getElementById("blue-player-name");

if (isReadOnlyResult) {
    redNameDisplay.value = savedResult.player1;
    blueNameDisplay.value = savedResult.player2;

    redNameDisplay.disabled = true;
    blueNameDisplay.disabled = true;
}


// ==========================================
// ROUND SCORES
// ==========================================

const roundSelector = document.getElementById("round-selector");

let currentRound = roundSelector.value;

function createRoundScores() {
    return {
        1: { red: 0, blue: 0, redFoul: 0, redDisarm: 0, blueFoul: 0, blueDisarm: 0 },
        2: { red: 0, blue: 0, redFoul: 0, redDisarm: 0, blueFoul: 0, blueDisarm: 0 },
        3: { red: 0, blue: 0, redFoul: 0, redDisarm: 0, blueFoul: 0, blueDisarm: 0 },
        4: { red: 0, blue: 0, redFoul: 0, redDisarm: 0, blueFoul: 0, blueDisarm: 0 },
        5: { red: 0, blue: 0, redFoul: 0, redDisarm: 0, blueFoul: 0, blueDisarm: 0 }
    };
}

let roundScores = createRoundScores();


// ==========================================
// MAIN SCORES
// ==========================================

let redScore = 0;
let blueScore = 0;

const redScoreDisplay = document.getElementById("red-score");
const blueScoreDisplay = document.getElementById("blue-score");

function updateScoreDisplay() {
    redScoreDisplay.textContent = redScore;
    blueScoreDisplay.textContent = blueScore;
}


// ==========================================
// FOUL AND DISARM COUNTERS
// ==========================================

let redFoul = 0;
let redDisarm = 0;
let blueFoul = 0;
let blueDisarm = 0;


// ==========================================
// MATCH RESULT AND STATUS
// ==========================================

const matchResult = document.getElementById("match-result");
const resultMessage = document.getElementById("result-message");
const statusDisplay = document.getElementById("match-status");

function setMatchStatus(status) {
    statusDisplay.textContent = status;
    statusDisplay.dataset.status = status.toLowerCase().replace(" ", "-");
}

setMatchStatus("NOT STARTED");


// ==========================================
// SAVE AND LOAD ROUND SCORES
// ==========================================

function saveRoundScores() {
    roundScores[currentRound] = {
        red: redScore,
        blue: blueScore,
        redFoul: redFoul,
        redDisarm: redDisarm,
        blueFoul: blueFoul,
        blueDisarm: blueDisarm
    };
}

function loadRoundScores() {
    const round = roundScores[currentRound];

    redScore = round.red;
    blueScore = round.blue;

    redFoul = round.redFoul;
    redDisarm = round.redDisarm;
    blueFoul = round.blueFoul;
    blueDisarm = round.blueDisarm;

    updateScoreDisplay();

    document.getElementById("red-foul").textContent = redFoul;
    document.getElementById("red-disarm").textContent = redDisarm;
    document.getElementById("blue-foul").textContent = blueFoul;
    document.getElementById("blue-disarm").textContent = blueDisarm;
}


// ==========================================
// MATCH TIMER
// ==========================================

let matchDuration = 90;
let timeLeft = matchDuration;
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start-timer");
const resetButton = document.getElementById("reset-timer");

const addSecondButton = document.getElementById("add-second");
const subtractSecondButton = document.getElementById("subtract-second");

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
           String(remainingSeconds).padStart(2, "0");
}

function updateTimer() {
    timerDisplay.textContent = formatTime(timeLeft);
}

updateTimer();


// ==========================================
// EDIT MATCH DURATION
// ==========================================

timerDisplay.addEventListener("click", function() {

    if (timerInterval !== null || isReadOnlyResult) {
        return;
    }

    const enteredTime = prompt(
        "Enter match duration (MM:SS):",
        formatTime(matchDuration)
    );

    if (enteredTime === null) return;

    const timeFormat = enteredTime.trim();

    if (!/^\d+:[0-5]\d$/.test(timeFormat)) {
        alert("Invalid time format. Please use MM:SS (example: 1:30).");
        return;
    }

    const parts = timeFormat.split(":");

    const newDuration =
        (Number(parts[0]) * 60) + Number(parts[1]);

    if (newDuration <= 0) {
        alert("Match duration must be greater than zero.");
        return;
    }

    matchDuration = newDuration;
    timeLeft = matchDuration;

    updateTimer();

    startButton.textContent = "START";
    setMatchStatus("NOT STARTED");

    matchResult.style.display = "none";
    resultMessage.textContent = "";
});


// ==========================================
// ADD OR SUBTRACT SECONDS
// ==========================================

function adjustTime(amount) {

    if (timerInterval !== null || isReadOnlyResult) {
        return;
    }

    timeLeft = Math.max(0, timeLeft + amount);

    updateTimer();

    if (statusDisplay.textContent === "FINISHED") {

        if (timeLeft > 0) {
            setMatchStatus("PAUSED");
            matchResult.style.display = "none";
            resultMessage.textContent = "";
        } else {
            displayMatchResult();
        }
    }
}

addSecondButton.addEventListener("click", () => adjustTime(1));
subtractSecondButton.addEventListener("click", () => adjustTime(-1));


// ==========================================
// START AND PAUSE TIMER
// ==========================================

startButton.addEventListener("click", function() {

    if (isReadOnlyResult) return;

    if (timerInterval === null) {

        if (timeLeft > 0) {

            startButton.textContent = "PAUSE";
            setMatchStatus("LIVE");

            timerInterval = setInterval(function() {

                timeLeft--;
                updateTimer();

                if (timeLeft <= 0) {

                    clearInterval(timerInterval);
                    timerInterval = null;

                    timeLeft = 0;
                    updateTimer();

                    startButton.textContent = "START";
                    setMatchStatus("FINISHED");

                    displayMatchResult();
                }

            }, 1000);

        } else {

            setMatchStatus("FINISHED");
            displayMatchResult();
        }

    } else {

        clearInterval(timerInterval);
        timerInterval = null;

        startButton.textContent = "START";
        setMatchStatus("PAUSED");
    }
});


// ==========================================
// RESET TIMER
// ==========================================

resetButton.addEventListener("click", function() {

    if (isReadOnlyResult) return;

    clearInterval(timerInterval);
    timerInterval = null;

    timeLeft = matchDuration;
    updateTimer();

    startButton.textContent = "START";
    setMatchStatus("NOT STARTED");

    matchResult.style.display = "none";
    resultMessage.textContent = "";
});


// ==========================================
// DISPLAY MATCH RESULT
// ==========================================

function displayMatchResult() {

    if (redScore > blueScore) {
        resultMessage.textContent = "RED PLAYER WINS!";
    } else if (blueScore > redScore) {
        resultMessage.textContent = "BLUE PLAYER WINS!";
    } else {
        resultMessage.textContent = "TIED - OFFICIAL DECISION REQUIRED";
    }

    matchResult.style.display = "block";
}


// ==========================================
// ROUND SELECTION
// ==========================================

roundSelector.addEventListener("change", function() {

    if (isReadOnlyResult) {

        currentRound = roundSelector.value;
        loadRoundScores();

        setMatchStatus("SAVED RESULT");

        resultMessage.textContent = savedResult.winner + " WINS!";
        matchResult.style.display = "block";

        return;
    }

    saveRoundScores();

    clearInterval(timerInterval);
    timerInterval = null;

    timeLeft = matchDuration;
    updateTimer();

    startButton.textContent = "START";

    currentRound = roundSelector.value;

    loadRoundScores();

    setMatchStatus("NOT STARTED");

    matchResult.style.display = "none";
    resultMessage.textContent = "";
});


// ==========================================
// RED PLAYER SCORING
// ==========================================

document.getElementById("red-plus").addEventListener("click", function() {

    if (isReadOnlyResult) return;

    redScore++;
    updateScoreDisplay();
});

document.getElementById("red-minus").addEventListener("click", function() {

    if (isReadOnlyResult) return;

    if (redScore > 0) {
        redScore--;
        updateScoreDisplay();
    }
});


// ==========================================
// BLUE PLAYER SCORING
// ==========================================

document.getElementById("blue-plus").addEventListener("click", function() {

    if (isReadOnlyResult) return;

    blueScore++;
    updateScoreDisplay();
});

document.getElementById("blue-minus").addEventListener("click", function() {

    if (isReadOnlyResult) return;

    if (blueScore > 0) {
        blueScore--;
        updateScoreDisplay();
    }
});


// ==========================================
// FOUL AND DISARM COUNTERS
// ==========================================

function setupCounter(plusId, minusId, displayId, getValue, setValue) {

    const display = document.getElementById(displayId);

    document.getElementById(plusId).addEventListener("click", function() {

        if (isReadOnlyResult) return;

        setValue(getValue() + 1);
        display.textContent = getValue();
    });

    document.getElementById(minusId).addEventListener("click", function() {

        if (isReadOnlyResult) return;

        if (getValue() > 0) {
            setValue(getValue() - 1);
            display.textContent = getValue();
        }
    });
}

setupCounter(
    "red-foul-plus", "red-foul-minus", "red-foul",
    () => redFoul, value => redFoul = value
);

setupCounter(
    "red-disarm-plus", "red-disarm-minus", "red-disarm",
    () => redDisarm, value => redDisarm = value
);

setupCounter(
    "blue-foul-plus", "blue-foul-minus", "blue-foul",
    () => blueFoul, value => blueFoul = value
);

setupCounter(
    "blue-disarm-plus", "blue-disarm-minus", "blue-disarm",
    () => blueDisarm, value => blueDisarm = value
);


// ==========================================
// RESET SCORES
// ==========================================

document.getElementById("reset-scores").addEventListener("click", function() {

    if (isReadOnlyResult) return;

    if (!confirm("Are you sure you want to reset all scores and counters for every round?")) {
        return;
    }

    redScore = 0;
    blueScore = 0;

    redFoul = 0;
    redDisarm = 0;
    blueFoul = 0;
    blueDisarm = 0;

    roundScores = createRoundScores();

    updateScoreDisplay();

    document.getElementById("red-foul").textContent = 0;
    document.getElementById("red-disarm").textContent = 0;
    document.getElementById("blue-foul").textContent = 0;
    document.getElementById("blue-disarm").textContent = 0;

    matchResult.style.display = "none";
    resultMessage.textContent = "";
});


// ==========================================
// SAVE MATCH - REGULAR SCOREBOARD ONLY
// ==========================================

const saveMatchButton = document.getElementById("save-match");

saveMatchButton.addEventListener("click", function() {

    if (isReadOnlyResult) return;

    if (statusDisplay.textContent !== "FINISHED") {
        alert("Please finish the match before saving.");
        return;
    }

    if (redScore === blueScore) {
        alert("The match is tied. An official decision is required before saving.");
        return;
    }

    // GET PARTICIPANT NAMES
    const redName = redNameDisplay.value.trim();
    const blueName = blueNameDisplay.value.trim();

    if (!redName || !blueName) {
        alert("Please enter both participant names before saving.");

        if (!redName) {
            redNameDisplay.focus();
        } else {
            blueNameDisplay.focus();
        }

        return;
    }

    saveRoundScores();

    const winner = redScore > blueScore
        ? redName
        : blueName;

    const newMatch = {

        id: Date.now(),
        date: new Date().toLocaleString(),

        stage: document.getElementById("match-stage").value,

        matchId: null,
        matchNumber: null,

        player1: redName,
        player2: blueName,

        winner: winner,

        rounds: Object.keys(roundScores).map(function(round) {

            return {
                number: round,

                red: roundScores[round].red,
                blue: roundScores[round].blue,

                redFoul: roundScores[round].redFoul,
                redDisarm: roundScores[round].redDisarm,

                blueFoul: roundScores[round].blueFoul,
                blueDisarm: roundScores[round].blueDisarm
            };
        })
    };

    const history = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
    );

    history.unshift(newMatch);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    alert("Regular match saved successfully!");

    window.location.href = "history.html";
});


// ==========================================
// LOAD SAVED RESULT - READ ONLY
// ==========================================

if (isReadOnlyResult) {

    document.getElementById("match-stage").value = savedResult.stage;

    savedResult.rounds.forEach(round => {

        const r = String(round.number);

        if (roundScores[r]) {

            roundScores[r].red = round.red || 0;
            roundScores[r].blue = round.blue || 0;

            roundScores[r].redFoul = round.redFoul || 0;
            roundScores[r].redDisarm = round.redDisarm || 0;

            roundScores[r].blueFoul = round.blueFoul || 0;
            roundScores[r].blueDisarm = round.blueDisarm || 0;
        }
    });

    currentRound = "1";
    roundSelector.value = "1";

    loadRoundScores();

    setMatchStatus("SAVED RESULT");

    resultMessage.textContent = savedResult.winner + " WINS!";
    matchResult.style.display = "block";

    timeLeft = 0;
    updateTimer();

    document.querySelectorAll(
        ".scoreboard button, .main-actions button, .danger-zone button, #match-stage"
    ).forEach(button => {
        button.disabled = true;
    });

    timerDisplay.style.cursor = "default";

    saveMatchButton.disabled = true;
}


// ==========================================
// CHALLENGE ANNOUNCEMENT
// ==========================================

const challengeButton = document.getElementById("challenge-button");
const challengeOverlay = document.getElementById("challenge-overlay");
const backToScoreboard = document.getElementById("back-to-scoreboard");

challengeButton.addEventListener("click", function() {

    if (isReadOnlyResult) return;

    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    startButton.textContent = "START";

    if (statusDisplay.textContent === "LIVE") {
        setMatchStatus("PAUSED");
    }

    challengeOverlay.classList.add("active");
});

backToScoreboard.addEventListener("click", function() {

    challengeOverlay.classList.remove("active");
});