// TOURNAMENT MANAGEMENT
const TOURNAMENTS_KEY = "arnisscoreTournaments";
const HISTORY_KEY = "arnisTournamentHistory";

const historyList = document.getElementById("history-list");

// GET ALL TOURNAMENTS
function getTournaments() {
    try {
        return JSON.parse(localStorage.getItem(TOURNAMENTS_KEY) || "[]");
    } catch (error) {
        console.error("Could not read tournaments:", error);
        return [];
    }
}

// GET TOURNAMENT MATCH HISTORY
function getMatchHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (error) {
        console.error("Could not read tournament match history:", error);
        return [];
    }
}

// FORMAT DATE
function formatDate(timestamp) {
    if (!timestamp) return "Unknown date";
    return new Date(timestamp).toLocaleString();
}

// CREATE A MANAGEMENT BUTTON
function createActionButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "tournament-action-btn " + className;
    button.addEventListener("click", onClick);
    return button;
}

// DISPLAY TOURNAMENTS
function displayTournaments() {
    const tournaments = getTournaments();
    historyList.innerHTML = "";

    if (tournaments.length === 0) {
        historyList.innerHTML =
            '<p class="empty-history">No tournaments created yet.</p>';
        return;
    }

    tournaments.slice().reverse().forEach(function (tournament) {
        const card = document.createElement("div");
        card.className = "history-card tournament-card";

        const title = document.createElement("h3");
        title.textContent = tournament.name || "Untitled Tournament";
        card.appendChild(title);

        const participants = document.createElement("p");
        participants.textContent =
            "PARTICIPANTS: " + (tournament.participants || []).length;
        card.appendChild(participants);

        const participantDetails = document.createElement("p");
        participantDetails.textContent =
            "PLAYERS: " + (tournament.participants || []).join(", ");
        card.appendChild(participantDetails);

        const date = document.createElement("p");
        date.textContent = "CREATED: " + formatDate(tournament.createdAt);
        card.appendChild(date);

        const status = document.createElement("p");
        status.textContent =
            "STATUS: " + (tournament.status || "In Progress");
        status.className = "tournament-status";
        status.classList.add(
            tournament.status === "Completed" ? "status-completed" : "status-progress"
        );
        card.appendChild(status);

        const actions = document.createElement("div");
        actions.className = "tournament-actions";

        const viewButton = createActionButton(
            "VIEW BRACKET",
            "view-bracket-btn",
            function () {
                window.location.href =
                    "bracket-display.html?tournamentId=" +
                    encodeURIComponent(tournament.id);
            }
        );
        actions.appendChild(viewButton);

        const renameButton = createActionButton(
            "RENAME TOURNAMENT",
            "rename-tournament-btn",
            function () {
                renameTournament(tournament.id);
            }
        );
        actions.appendChild(renameButton);

        const matchHistoryButton = createActionButton(
            "MATCH HISTORY",
            "match-history-btn",
            function () {
                window.location.href =
                    "tournament-match-history.html?tournamentId=" +
                    encodeURIComponent(tournament.id);
            }
        );
        actions.appendChild(matchHistoryButton);

        const deleteButton = createActionButton(
            "DELETE TOURNAMENT",
            "delete-tournament-btn",
            function () {
                deleteTournament(tournament.id);
            }
        );
        actions.appendChild(deleteButton);

        card.appendChild(actions);
        historyList.appendChild(card);
    });
}

// RENAME ONE TOURNAMENT
function renameTournament(tournamentId) {
    const tournaments = getTournaments();
    const tournament = tournaments.find(function (item) {
        return item.id === tournamentId;
    });

    if (!tournament) {
        alert("Tournament not found.");
        return;
    }

    const currentName = tournament.name || "Untitled Tournament";
    const newName = prompt("Enter a new tournament name:", currentName);

    if (newName === null) return;

    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert("Tournament name cannot be empty.");
        return;
    }

    tournament.name = trimmedName;

    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    displayTournaments();
}

// DELETE ONE TOURNAMENT
function deleteTournament(tournamentId) {
    if (!confirm(
        "Are you sure you want to delete this tournament and its match history?"
    )) {
        return;
    }

    const updatedTournaments = getTournaments().filter(function (tournament) {
        return tournament.id !== tournamentId;
    });

    localStorage.setItem(
        TOURNAMENTS_KEY,
        JSON.stringify(updatedTournaments)
    );

    // Delete only matches belonging to the selected tournament.
    const updatedHistory = getMatchHistory().filter(function (match) {
        return match.tournamentId !== tournamentId;
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    displayTournaments();
}

// INITIALIZE
displayTournaments();
