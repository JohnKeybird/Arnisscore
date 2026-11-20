
// TOURNAMENT MATCH HISTORY
const HISTORY_KEY = "arnisTournamentHistory";
const TOURNAMENTS_KEY = "arnisscoreTournaments";

const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");

const params = new URLSearchParams(window.location.search);
const selectedTournamentId = params.get("tournamentId");


// GET SAVED MATCHES
function getMatchHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}


// GET TOURNAMENTS
function getTournaments() {
    return JSON.parse(localStorage.getItem(TOURNAMENTS_KEY) || "[]");
}


// DISPLAY MATCH HISTORY
function displayMatchHistory() {

    const allHistory = getMatchHistory();

    const history = selectedTournamentId
        ? allHistory.filter(match =>
            match.tournamentId === selectedTournamentId
        )
        : allHistory;

    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-history">No tournament match history yet.</p>';
        return;
    }

    history.forEach(function(match) {

        const matchCard = document.createElement("div");
        matchCard.className = "history-card";

        const title = document.createElement("h3");

        title.textContent = match.matchNumber
            ? "MATCH " + match.matchNumber + " — " + (match.date || "")
            : match.date || "Tournament Match";

        matchCard.appendChild(title);

        const stage = document.createElement("p");
        stage.textContent =
            "MATCH STAGE: " + (match.stage || "FINAL MATCH");

        matchCard.appendChild(stage);

        if (match.player1 && match.player2) {
            const players = document.createElement("p");

            players.textContent =
                match.player1 + " vs " + match.player2;

            matchCard.appendChild(players);
        }

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

        (match.rounds || []).forEach(function(round) {

            const roundItem = document.createElement("p");

            roundItem.textContent =
                "ROUND " + round.number +
                " — RED: " + round.red +
                " | BLUE: " + round.blue;

            roundsContainer.appendChild(roundItem);
        });

        matchCard.appendChild(roundsContainer);

        // DELETE MATCH
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

    if (!confirm("Delete this tournament match from history?")) {
        return;
    }

    const updatedHistory = getMatchHistory().filter(function(match) {
        return match.id !== matchId;
    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory)
    );

    displayMatchHistory();
}


// CLEAR MATCH HISTORY
clearHistoryButton.addEventListener("click", function() {

    const message = selectedTournamentId
        ? "Delete all match records for this tournament?"
        : "Delete ALL tournament match history?";

    if (!confirm(message)) return;

    const updatedHistory = selectedTournamentId
        ? getMatchHistory().filter(match =>
            match.tournamentId !== selectedTournamentId
        )
        : [];

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory)
    );

    displayMatchHistory();
});


// INITIALIZE
displayMatchHistory();
