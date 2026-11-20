
// TOURNAMENT STORAGE
const TOURNAMENTS_KEY = "arnisscoreTournaments";

const countInput = document.getElementById("participant-count");
const continueButton = document.getElementById("continue-button");
const container = document.querySelector(".bracket-container");

// PARTICIPANT FIELDS
const participantFields = document.createElement("div");
participantFields.id = "participant-fields";

container.insertBefore(participantFields, continueButton);

let namesDisplayed = false;
let participantCount = 0;


// GET SAVED TOURNAMENTS
function getTournaments() {
    return JSON.parse(
        localStorage.getItem(TOURNAMENTS_KEY) || "[]"
    );
}


// SAVE NEW TOURNAMENT
function saveNewTournament(names) {

    const tournaments = getTournaments();

    const tournamentId =
        "tournament-" + Date.now() + "-" +
        Math.random().toString(36).substring(2, 9);

    const newTournament = {
        id: tournamentId,
        name: "Tournament " + (tournaments.length + 1),
        participants: names,
        bracket: null,
        createdAt: Date.now(),
        status: "In Progress"
    };

    tournaments.push(newTournament);

    localStorage.setItem(
        TOURNAMENTS_KEY,
        JSON.stringify(tournaments)
    );

    return tournamentId;
}


// CONTINUE BUTTON
continueButton.addEventListener("click", function () {

    // STEP 1: ENTER PARTICIPANT COUNT
    if (!namesDisplayed) {

        const count = Number(countInput.value);

        if (!Number.isInteger(count) || count < 2 || count > 64) {
            alert("Please enter a number of participants between 2 and 64.");
            return;
        }

        participantCount = count;

        participantFields.innerHTML =
            "<h3>Enter Participant Names</h3>";

        for (let i = 1; i <= count; i++) {

            participantFields.innerHTML += `
                <input
                    type="text"
                    class="participant-name"
                    placeholder="Participant ${i}"
                    required
                >
            `;
        }

        countInput.disabled = true;
        continueButton.textContent = "SAVE PARTICIPANTS";

        namesDisplayed = true;

        return;
    }


    // STEP 2: SAVE PARTICIPANTS
    const nameInputs = document.querySelectorAll(".participant-name");

    const names = Array.from(nameInputs).map(function (input) {
        return input.value.trim();
    });

    if (names.length !== participantCount || names.some(name => name === "")) {
        alert("Please enter a name for every participant.");
        return;
    }

    // CHECK DUPLICATE NAMES
    const normalizedNames = names.map(name => name.toLowerCase());

    if (new Set(normalizedNames).size !== names.length) {
        alert("Participant names must be unique.");
        return;
    }

    // CREATE INDEPENDENT TOURNAMENT
    const tournamentId = saveNewTournament(names);

    // OPEN THE NEW TOURNAMENT
    window.location.href =
        "bracket-display.html?tournamentId=" +
        encodeURIComponent(tournamentId);

});
