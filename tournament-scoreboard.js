
// ==========================================
// STORAGE KEYS
// ==========================================

const HISTORY_KEY = "arnisTournamentHistory";
const CURRENT_MATCH_KEY = "arnisscoreCurrentMatch";
const TOURNAMENTS_KEY = "arnisscoreTournaments";

const currentMatch = JSON.parse(
    localStorage.getItem(CURRENT_MATCH_KEY) || "null"
);

const params = new URLSearchParams(window.location.search);
const resultId = params.get("resultId");
const urlTournamentId = params.get("tournamentId");

const tournamentId =
    urlTournamentId || currentMatch?.tournamentId || null;


// ==========================================
// LOAD TOURNAMENTS AND HISTORY
// ==========================================

function getTournaments() {
    return JSON.parse(
        localStorage.getItem(TOURNAMENTS_KEY) || "[]"
    );
}

function getTournament(id) {
    return getTournaments().find(
        tournament => tournament.id === id
    );
}

const savedHistory = JSON.parse(
    localStorage.getItem(HISTORY_KEY) || "[]"
);

const savedResult = resultId
    ? savedHistory.find(match =>
        String(match.id) === resultId &&
        (!urlTournamentId || match.tournamentId === urlTournamentId)
    )
    : null;

const isReadOnlyResult = !!savedResult;


// ==========================================
// PLAYER NAMES
// ==========================================

const redNameDisplay = document.querySelector(".red-player h3");
const blueNameDisplay = document.querySelector(".blue-player h3");

if (isReadOnlyResult) {

    redNameDisplay.textContent = savedResult.player1;
    blueNameDisplay.textContent = savedResult.player2;

} else if (currentMatch) {

    redNameDisplay.textContent = currentMatch.player1;
    blueNameDisplay.textContent = currentMatch.player2;

} else {

    redNameDisplay.textContent = "ATHLETE 01";
    blueNameDisplay.textContent = "ATHLETE 02";
}


// ==========================================
// ROUND SCORE STORAGE
// ==========================================

const roundSelector = document.getElementById("round-selector");

let currentRound = roundSelector.value;

function createEmptyRoundScores() {

    return {
        1: {
            red: 0,
            blue: 0,
            redFoul: 0,
            redDisarm: 0,
            blueFoul: 0,
            blueDisarm: 0
        },
        2: {
            red: 0,
            blue: 0,
            redFoul: 0,
            redDisarm: 0,
            blueFoul: 0,
            blueDisarm: 0
        },
        3: {
            red: 0,
            blue: 0,
            redFoul: 0,
            redDisarm: 0,
            blueFoul: 0,
            blueDisarm: 0
        },
        4: {
            red: 0,
            blue: 0,
            redFoul: 0,
            redDisarm: 0,
            blueFoul: 0,
            blueDisarm: 0
        },
        5: {
            red: 0,
            blue: 0,
            redFoul: 0,
            redDisarm: 0,
            blueFoul: 0,
            blueDisarm: 0
        }
    };
}

let roundScores = createEmptyRoundScores();


// ==========================================
// MAIN PLAYER SCORES
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
// MATCH RESULT ELEMENTS
// ==========================================

const matchResult = document.getElementById("match-result");
const resultMessage = document.getElementById("result-message");


// ==========================================
// MATCH STATUS
// ==========================================

const statusDisplay = document.getElementById("match-status");

function setMatchStatus(status) {

    statusDisplay.textContent = status;

    statusDisplay.dataset.status =
        status.toLowerCase().replace(" ", "-");
}

setMatchStatus("NOT STARTED");


// ==========================================
// SAVE AND LOAD ROUND SCORES
// ==========================================

function saveRoundScores() {

    roundScores[currentRound].red = redScore;
    roundScores[currentRound].blue = blueScore;

    roundScores[currentRound].redFoul = redFoul;
    roundScores[currentRound].redDisarm = redDisarm;
    roundScores[currentRound].blueFoul = blueFoul;
    roundScores[currentRound].blueDisarm = blueDisarm;
}


function loadRoundScores() {

    redScore = roundScores[currentRound].red;
    blueScore = roundScores[currentRound].blue;

    redFoul = roundScores[currentRound].redFoul;
    redDisarm = roundScores[currentRound].redDisarm;
    blueFoul = roundScores[currentRound].blueFoul;
    blueDisarm = roundScores[currentRound].blueDisarm;

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


// ==========================================
// FORMAT TIMER
// ==========================================

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");
}


// ==========================================
// UPDATE TIMER DISPLAY
// ==========================================

function updateTimer() {

    timerDisplay.textContent = formatTime(timeLeft);
}

updateTimer();


// ==========================================
// EDIT MATCH DURATION
// ==========================================

timerDisplay.addEventListener("click", function () {

    if (timerInterval !== null || isReadOnlyResult) {
        return;
    }

    const enteredTime = prompt(
        "Enter match duration (MM:SS):",
        formatTime(matchDuration)
    );

    if (enteredTime === null) {
        return;
    }

    const timeFormat = enteredTime.trim();

    if (!/^\d+:[0-5]\d$/.test(timeFormat)) {

        alert("Invalid time format. Please use MM:SS (example: 1:30).");
        return;
    }

    const parts = timeFormat.split(":");

    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);

    const newDuration = (minutes * 60) + seconds;

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


// ==========================================
// ADD ONE SECOND
// ==========================================

addSecondButton.addEventListener("click", function () {

    adjustTime(1);
});


// ==========================================
// SUBTRACT ONE SECOND
// ==========================================

subtractSecondButton.addEventListener("click", function () {

    adjustTime(-1);
});


// ==========================================
// START AND PAUSE TIMER
// ==========================================

startButton.addEventListener("click", function () {

    if (isReadOnlyResult) {
        return;
    }

    if (timerInterval === null) {

        if (timeLeft > 0) {

            startButton.textContent = "PAUSE";
            setMatchStatus("LIVE");

            timerInterval = setInterval(function () {

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

resetButton.addEventListener("click", function () {

    if (isReadOnlyResult) {
        return;
    }

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

        resultMessage.textContent = "RED CORNER WINS!";

    } else if (blueScore > redScore) {

        resultMessage.textContent = "BLUE CORNER WINS!";

    } else {

        resultMessage.textContent =
            "TIED - OFFICIAL DECISION REQUIRED";
    }

    matchResult.style.display = "block";
}


// ==========================================
// ROUND SELECTION
// ==========================================

roundSelector.addEventListener("change", function () {

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

document.getElementById("red-plus").addEventListener("click", function () {

    if (isReadOnlyResult) return;

    redScore++;
    updateScoreDisplay();
});


document.getElementById("red-minus").addEventListener("click", function () {

    if (isReadOnlyResult) return;

    if (redScore > 0) {

        redScore--;
        updateScoreDisplay();
    }
});


// ==========================================
// BLUE PLAYER SCORING
// ==========================================

document.getElementById("blue-plus").addEventListener("click", function () {

    if (isReadOnlyResult) return;

    blueScore++;
    updateScoreDisplay();
});


document.getElementById("blue-minus").addEventListener("click", function () {

    if (isReadOnlyResult) return;

    if (blueScore > 0) {

        blueScore--;
        updateScoreDisplay();
    }
});


// ==========================================
// COUNTER FUNCTION
// ==========================================

function setupCounter(plusId, minusId, displayId, getValue, setValue) {

    const display = document.getElementById(displayId);

    document.getElementById(plusId).addEventListener("click", function () {

        if (isReadOnlyResult) return;

        setValue(getValue() + 1);
        display.textContent = getValue();
    });

    document.getElementById(minusId).addEventListener("click", function () {

        if (isReadOnlyResult) return;

        if (getValue() > 0) {

            setValue(getValue() - 1);
            display.textContent = getValue();
        }
    });
}


// ==========================================
// RED FOUL
// ==========================================

setupCounter(
    "red-foul-plus",
    "red-foul-minus",
    "red-foul",
    () => redFoul,
    value => redFoul = value
);


// ==========================================
// RED DISARM
// ==========================================

setupCounter(
    "red-disarm-plus",
    "red-disarm-minus",
    "red-disarm",
    () => redDisarm,
    value => redDisarm = value
);


// ==========================================
// BLUE FOUL
// ==========================================

setupCounter(
    "blue-foul-plus",
    "blue-foul-minus",
    "blue-foul",
    () => blueFoul,
    value => blueFoul = value
);


// ==========================================
// BLUE DISARM
// ==========================================

setupCounter(
    "blue-disarm-plus",
    "blue-disarm-minus",
    "blue-disarm",
    () => blueDisarm,
    value => blueDisarm = value
);


// ==========================================
// RESET SCORES
// ==========================================

document.getElementById("reset-scores").addEventListener("click", function () {

    if (isReadOnlyResult) {
        return;
    }

    if (!confirm("Are you sure you want to reset all scores and counters for every round?")) {
        return;
    }

    redScore = 0;
    blueScore = 0;

    redFoul = 0;
    redDisarm = 0;
    blueFoul = 0;
    blueDisarm = 0;

    roundScores = createEmptyRoundScores();

    updateScoreDisplay();

    document.getElementById("red-foul").textContent = 0;
    document.getElementById("red-disarm").textContent = 0;
    document.getElementById("blue-foul").textContent = 0;
    document.getElementById("blue-disarm").textContent = 0;

    matchResult.style.display = "none";
    resultMessage.textContent = "";
});


// ==========================================
// SAVE MATCH
// ==========================================

const saveMatchButton = document.getElementById("save-match");

saveMatchButton.addEventListener("click", function () {

    if (isReadOnlyResult) {
        return;
    }

    if (statusDisplay.textContent !== "FINISHED") {

        alert("Please finish the match before saving.");
        return;
    }

    if (redScore === blueScore) {

        alert("The match is tied. An official decision is required before saving.");
        return;
    }

    if (!currentMatch || !currentMatch.tournamentId) {

        alert("Tournament information is missing. Please return to the bracket.");
        return;
    }

    // FIND THE CORRECT TOURNAMENT
    const tournaments = getTournaments();

    const tournamentIndex = tournaments.findIndex(
        item => item.id === currentMatch.tournamentId
    );

    if (tournamentIndex === -1) {

        alert("Tournament not found. Your match cannot be saved.");
        return;
    }

    const selectedTournament = tournaments[tournamentIndex];

    if (!selectedTournament.bracket) {

        alert("Tournament bracket not found.");
        return;
    }

    // FIND THE MATCH IN THIS TOURNAMENT
    let selectedBracketMatch = null;

    selectedTournament.bracket.rounds.forEach(round => {

        round.forEach(match => {

            if (match.id === currentMatch.matchId) {
                selectedBracketMatch = match;
            }
        });
    });

    if (!selectedBracketMatch) {

        alert("Match not found in this tournament.");
        return;
    }

    if (selectedBracketMatch.completed) {

        alert("This match has already been saved.");
        return;
    }

    saveRoundScores();

    const history = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
    );

    const winner = redScore > blueScore
        ? currentMatch.player1
        : currentMatch.player2;

    const newMatch = {

        id: Date.now(),

        tournamentId: currentMatch.tournamentId,

        tournamentName: selectedTournament.name || "Tournament",

        date: new Date().toLocaleString(),

        stage: document.getElementById("match-stage").value,

        matchId: currentMatch.matchId,
        matchNumber: currentMatch.matchNumber,

        player1: currentMatch.player1,
        player2: currentMatch.player2,

        winner: winner,

        rounds: Object.keys(roundScores).map(function (round) {

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

    // SAVE MATCH HISTORY
    history.unshift(newMatch);

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    // UPDATE ONLY THIS TOURNAMENT'S BRACKET
    selectedBracketMatch.winner = winner;
    selectedBracketMatch.completed = true;
    selectedBracketMatch.historyId = newMatch.id;

    // UPDATE TOURNAMENT STATUS
    const finalRound =
        selectedTournament.bracket.rounds[
            selectedTournament.bracket.rounds.length - 1
        ];

    if (
        finalRound &&
        finalRound.length > 0 &&
        finalRound[0].completed
    ) {

        selectedTournament.status = "Completed";

    } else {

        selectedTournament.status = "In Progress";
    }

    // SAVE TOURNAMENTS
    tournaments[tournamentIndex] = selectedTournament;

    localStorage.setItem(
        TOURNAMENTS_KEY,
        JSON.stringify(tournaments)
    );

    alert("Match saved successfully!");

    // RETURN TO THE SAME TOURNAMENT BRACKET
    window.location.href =
        "bracket-display.html?tournamentId=" +
        encodeURIComponent(currentMatch.tournamentId);
});


// ==========================================
// LOAD SAVED RESULT IN READ-ONLY MODE
// ==========================================

if (isReadOnlyResult) {

    redNameDisplay.textContent = savedResult.player1;
    blueNameDisplay.textContent = savedResult.player2;

    document.getElementById("match-stage").value =
        savedResult.stage;

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

    // DISABLE EDITING CONTROLS
    document.querySelectorAll(
        ".scoreboard button, .main-actions button, .danger-zone button, #match-stage"
    ).forEach(button => {

        button.disabled = true;
    });

    // PREVENT TIMER EDITING IN READ-ONLY MODE
    timerDisplay.style.cursor = "default";
}


// ==========================================
// CHALLENGE ANNOUNCEMENT
// ==========================================

const challengeButton = document.getElementById("challenge-button");
const challengeOverlay = document.getElementById("challenge-overlay");
const backToScoreboard = document.getElementById("back-to-scoreboard");

challengeButton.addEventListener("click", function () {

    if (isReadOnlyResult) {
        return;
    }

    // STOP TIMER IMMEDIATELY
    if (timerInterval !== null) {

        clearInterval(timerInterval);
        timerInterval = null;
    }

    // UPDATE TIMER BUTTON AND STATUS
    startButton.textContent = "START";

    if (statusDisplay.textContent === "LIVE") {

        setMatchStatus("PAUSED");
    }

    // SHOW CHALLENGE ANNOUNCEMENT
    challengeOverlay.classList.add("active");
});

backToScoreboard.addEventListener("click", function () {

    challengeOverlay.classList.remove("active");
});
