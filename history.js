
// MATCH HISTORY
const HISTORY_KEY = "arnisScoreHistory";

const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");


// GET SAVED MATCHES
function getMatchHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}


// DISPLAY MATCH HISTORY
function displayMatchHistory() {

    const history = getMatchHistory();

    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-history">No match history yet.</p>';
        return;
    }

    const selectedMatchId = new URLSearchParams(
        window.location.search
    ).get("matchId");

    history.forEach(function(match) {

        const matchCard = document.createElement("div");
        matchCard.className = "history-card";

        if (String(match.id) === selectedMatchId) {
            matchCard.style.border = "2px solid #facc15";
            matchCard.scrollIntoView({ behavior: "smooth" });
        }

        const title = document.createElement("h3");

        title.textContent = match.matchNumber
            ? "MATCH " + match.matchNumber + " — " + match.date
            : match.date;

        matchCard.appendChild(title);

        const stage = document.createElement("p");
        stage.textContent = "MATCH STAGE: " + (match.stage || "FINAL MATCH");
        matchCard.appendChild(stage);

        // PLAYER INFORMATION
        if (match.player1 && match.player2) {

            const players = document.createElement("p");

            players.textContent =
                match.player1 + " vs " + match.player2;

            matchCard.appendChild(players);
        }

        // WINNER
        if (match.winner) {

            const winner = document.createElement("p");

            winner.textContent = "WINNER: " + match.winner;
            winner.style.color = "#facc15";
            winner.style.fontWeight = "bold";

            matchCard.appendChild(winner);
        }

        // ROUND SCORES
        const roundsContainer = document.createElement("div");
        roundsContainer.className = "history-rounds";

        match.rounds.forEach(function(round) {

            const roundItem = document.createElement("p");

            roundItem.textContent =
                "ROUND " + round.number +
                " — RED: " + round.red +
                " | BLUE: " + round.blue;

            roundsContainer.appendChild(roundItem);
        });

        matchCard.appendChild(roundsContainer);

        // DELETE BUTTON
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "DELETE";
        deleteButton.className = "delete-history";

        deleteButton.addEventListener("click", function() {
            deleteMatch(match.id);
        });

        matchCard.appendChild(deleteButton);

        historyList.appendChild(matchCard);
    });
}


// DELETE ONE MATCH
function deleteMatch(matchId) {

    if (!confirm("Delete this match from history?")) {
        return;
    }

    const updatedHistory = getMatchHistory().filter(function(match) {
        return match.id !== matchId;
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    displayMatchHistory();
}


// CLEAR ALL MATCH HISTORY
clearHistoryButton.addEventListener("click", function() {

    if (!confirm("Are you sure you want to delete all match history?")) {
        return;
    }

    localStorage.removeItem(HISTORY_KEY);

    displayMatchHistory();
});


// LOAD HISTORY
displayMatchHistory();
