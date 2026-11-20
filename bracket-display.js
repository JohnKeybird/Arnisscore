
// ==========================================
// INDEPENDENT TOURNAMENT STORAGE
// ==========================================

const TOURNAMENTS_KEY = "arnisscoreTournaments";
const CURRENT_MATCH_KEY = "arnisscoreCurrentMatch";

const params = new URLSearchParams(window.location.search);
const tournamentId = params.get("tournamentId");

const savedTournaments = JSON.parse(
    localStorage.getItem(TOURNAMENTS_KEY) || "[]"
);

let tournamentRecord = savedTournaments.find(
    item => item.id === tournamentId
);

const participants = tournamentRecord
    ? tournamentRecord.participants
    : [];

const bracketContainer = document.getElementById("bracket-container");

const SLOT_HEIGHT = 100;
const MATCH_HEIGHT = 130;
const ROUND_WIDTH = 230;
const ROUND_GAP = 90;

let tournament = null;


// ==========================================
// CHECK SELECTED TOURNAMENT
// ==========================================

if (!tournamentRecord) {

    bracketContainer.textContent =
        "Tournament not found. Please return and select a tournament again.";

} else if (!Array.isArray(participants) || participants.length < 2) {

    bracketContainer.textContent =
        "No tournament participants found.";

} else {

    // ==========================================
    // SHUFFLE PARTICIPANTS
    // ==========================================

    function shuffle(array) {

        const shuffled = [...array];

        for (let i = shuffled.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] =
                [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }


    // ==========================================
    // CREATE ENTRANTS
    // ==========================================

    function participantEntrant(name) {

        return {
            type: "participant",
            name: name
        };
    }


    function winnerEntrant(matchId) {

        return {
            type: "winner",
            matchId: matchId
        };
    }


    // ==========================================
    // CREATE TOURNAMENT BRACKET
    // ==========================================

    function createTournament() {

        const shuffled = shuffle(participants);

        const rounds = [];
        let matchNumber = 1;

        let entrants = [];

        // ASSIGN ONE RANDOM BYE IF ODD
        if (shuffled.length % 2 !== 0) {

            const byeParticipant = shuffled.pop();

            entrants.push(
                participantEntrant(byeParticipant)
            );
        }

        // CREATE FIRST ROUND MATCHES
        const firstRound = [];

        for (let i = 0; i < shuffled.length; i += 2) {

            const player1 = shuffled[i];
            const player2 = shuffled[i + 1];

            const match = {

                id: "M" + matchNumber,
                number: matchNumber,

                source1: participantEntrant(player1),
                source2: participantEntrant(player2),

                player1: player1,
                player2: player2,

                winner: null,
                completed: false,
                historyId: null
            };

            firstRound.push(match);

            entrants.push(
                winnerEntrant(match.id)
            );

            matchNumber++;
        }

        rounds.push(firstRound);


        // GENERATE REMAINING ROUNDS
        while (entrants.length > 1) {

            const matches = [];
            const nextEntrants = [];

            let directAdvance = null;

            if (entrants.length % 2 !== 0) {

                directAdvance = entrants.pop();
            }

            // PAIR REMAINING ENTRANTS
            for (let i = 0; i < entrants.length; i += 2) {

                const match = {

                    id: "M" + matchNumber,
                    number: matchNumber,

                    source1: entrants[i],
                    source2: entrants[i + 1],

                    player1: null,
                    player2: null,

                    winner: null,
                    completed: false,
                    historyId: null
                };

                matches.push(match);

                nextEntrants.push(
                    winnerEntrant(match.id)
                );

                matchNumber++;
            }

            // PRESERVE DIRECT ADVANCEMENT
            if (directAdvance) {

                nextEntrants.push(directAdvance);
            }

            rounds.push(matches);

            entrants = nextEntrants;
        }

        return {

            version: 2,
            participants: [...participants],
            rounds: rounds,
            createdAt: Date.now()
        };
    }


    // ==========================================
    // FIND MATCH
    // ==========================================

    function findMatch(matchId) {

        for (const round of tournament.rounds) {

            const match = round.find(
                item => item.id === matchId
            );

            if (match) {
                return match;
            }
        }

        return null;
    }


    // ==========================================
    // RESOLVE ENTRANT
    // ==========================================

    function resolveEntrant(entrant) {

        if (!entrant) return null;

        if (entrant.type === "participant") {

            return entrant.name;
        }

        const previousMatch = findMatch(entrant.matchId);

        return previousMatch && previousMatch.completed
            ? previousMatch.winner
            : null;
    }


    // ==========================================
    // SAVE ONLY THE SELECTED TOURNAMENT
    // ==========================================

    function saveTournament() {

        if (!tournamentRecord) return;

        tournamentRecord.bracket = tournament;

        const finalRound =
            tournament.rounds[tournament.rounds.length - 1];

        if (
            finalRound &&
            finalRound.length > 0 &&
            finalRound[0].completed
        ) {

            tournamentRecord.status = "Completed";

        } else {

            tournamentRecord.status = "In Progress";
        }

        const allTournaments = JSON.parse(
            localStorage.getItem(TOURNAMENTS_KEY) || "[]"
        );

        const index = allTournaments.findIndex(
            item => item.id === tournamentId
        );

        if (index !== -1) {

            allTournaments[index] = tournamentRecord;

            localStorage.setItem(
                TOURNAMENTS_KEY,
                JSON.stringify(allTournaments)
            );
        }
    }


    // ==========================================
    // UPDATE MATCH PARTICIPANTS
    // ==========================================

    function updateMatches() {

        tournament.rounds.forEach(round => {

            round.forEach(match => {

                match.player1 = resolveEntrant(match.source1);
                match.player2 = resolveEntrant(match.source2);

            });

        });

        saveTournament();
    }


    // ==========================================
    // GET ROUND NAME
    // ==========================================

    function getRoundName(index) {

        const remaining =
            tournament.rounds.length - index;

        if (remaining === 1) return "FINAL";

        if (remaining === 2) return "SEMI-FINAL";

        if (remaining === 3) return "QUARTER-FINAL";

        return "ROUND " + (index + 1);
    }


    // ==========================================
    // OPEN MATCH
    // ==========================================

    function openMatch(match) {

        // OPEN COMPLETED MATCH
        if (match.completed) {

            if (match.historyId) {

                window.location.href =
                    "tournament-scoreboard.html?resultId=" +
                    encodeURIComponent(match.historyId) +
                    "&tournamentId=" +
                    encodeURIComponent(tournamentId);

            } else {

                alert("This match has already been completed.");
            }

            return;
        }

        // CHECK IF MATCH IS READY
        if (!match.player1 || !match.player2) {

            alert("This match is not ready yet.");
            return;
        }

        // SET CURRENT MATCH
        const currentMatch = {

            tournamentId: tournamentId,
            matchId: match.id,
            matchNumber: match.number,
            player1: match.player1,
            player2: match.player2
        };

        localStorage.setItem(
            CURRENT_MATCH_KEY,
            JSON.stringify(currentMatch)
        );

        window.location.href =
            "tournament-scoreboard.html?tournamentId=" +
            encodeURIComponent(tournamentId);
    }


    // ==========================================
    // SELECT WINNER
    // ==========================================

    function selectWinner(match, player) {

        if (match.completed) {

            alert("This match already has a winner.");
            return;
        }

        if (!match.player1 || !match.player2) {

            alert("Both participants must be available.");
            return;
        }

        const confirmed = confirm(
            "Declare " + player + " as the winner?"
        );

        if (!confirmed) return;

        match.winner = player;
        match.completed = true;

        updateMatches();
        renderBracket();
    }


    // ==========================================
    // FIND BRACKET POSITIONS
    // ==========================================

    function calculatePositions() {

        const positions = new Map();

        let leafIndex = 0;

        function getEntrantLeaves(entrant) {

            if (entrant.type === "participant") {

                const index = leafIndex++;

                return [index];
            }

            const match = findMatch(entrant.matchId);

            if (!match) return [];

            const leaves1 = getEntrantLeaves(match.source1);
            const leaves2 = getEntrantLeaves(match.source2);

            const allLeaves = [...leaves1, ...leaves2];

            const center =
                allLeaves.reduce((sum, value) => sum + value, 0) /
                allLeaves.length;

            positions.set(match.id, center);

            return allLeaves;
        }

        const finalRound =
            tournament.rounds[tournament.rounds.length - 1];

        if (finalRound && finalRound.length > 0) {

            const finalMatch = finalRound[0];

            getEntrantLeaves(
                winnerEntrant(finalMatch.id)
            );
        }

        return {
            positions,
            leafCount: leafIndex
        };
    }


    // ==========================================
    // DRAW CONNECTOR LINES
    // ==========================================

    function drawConnectors() {

        const oldSvg =
            bracketContainer.querySelector(".connector-svg");

        if (oldSvg) {
            oldSvg.remove();
        }

        const containerRect =
            bracketContainer.getBoundingClientRect();

        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.classList.add("connector-svg");

        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = bracketContainer.scrollWidth + "px";
        svg.style.height = bracketContainer.scrollHeight + "px";
        svg.style.pointerEvents = "none";
        svg.style.overflow = "visible";
        svg.style.zIndex = "0";

        tournament.rounds.forEach(round => {

            round.forEach(match => {

                const target = document.getElementById(
                    "match-" + match.id
                );

                if (!target) return;

                const targetPlayers =
                    target.querySelectorAll(".match-player");

                [match.source1, match.source2].forEach(
                    (source, index) => {

                        if (!source || source.type !== "winner") {
                            return;
                        }

                        const sourceElement =
                            document.getElementById(
                                "match-" + source.matchId
                            );

                        if (!sourceElement || !targetPlayers[index]) {
                            return;
                        }

                        const sourceRect =
                            sourceElement.getBoundingClientRect();

                        const targetPlayerRect =
                            targetPlayers[index].getBoundingClientRect();

                        const x1 =
                            sourceRect.right - containerRect.left;

                        const y1 =
                            sourceRect.top +
                            sourceRect.height / 2 -
                            containerRect.top;

                        const x2 =
                            targetPlayerRect.left - containerRect.left;

                        const y2 =
                            targetPlayerRect.top +
                            targetPlayerRect.height / 2 -
                            containerRect.top;

                        const middleX =
                            x1 + (x2 - x1) / 2;

                        const path = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "path"
                        );

                        path.setAttribute(
                            "d",
                            `M ${x1} ${y1}
                             H ${middleX}
                             V ${y2}
                             H ${x2}`
                        );

                        path.setAttribute("fill", "none");
                        path.setAttribute("stroke", "#a16207");
                        path.setAttribute("stroke-width", "2");
                        path.setAttribute("stroke-linecap", "round");
                        path.setAttribute("stroke-linejoin", "round");

                        svg.appendChild(path);
                    }
                );

            });

        });

        bracketContainer.prepend(svg);
    }


    // ==========================================
    // RENDER BRACKET
    // ==========================================

    function renderBracket() {

        bracketContainer.innerHTML = "";

        bracketContainer.style.position = "relative";
        bracketContainer.style.display = "flex";
        bracketContainer.style.alignItems = "flex-start";
        bracketContainer.style.gap = ROUND_GAP + "px";

        const { positions, leafCount } =
            calculatePositions();

        const totalHeight = Math.max(
            SLOT_HEIGHT * leafCount,
            MATCH_HEIGHT
        );

        tournament.rounds.forEach((matches, roundIndex) => {

            const roundDiv = document.createElement("div");
            roundDiv.className = "round";

            roundDiv.style.position = "relative";
            roundDiv.style.flex = "0 0 " + ROUND_WIDTH + "px";
            roundDiv.style.minWidth = ROUND_WIDTH + "px";

            const heading = document.createElement("h2");

            heading.textContent = getRoundName(roundIndex);

            roundDiv.appendChild(heading);

            const content = document.createElement("div");

            content.className = "round-content";

            content.style.position = "relative";
            content.style.height = totalHeight + "px";
            content.style.width = "100%";

            matches.forEach(match => {

                const matchDiv = document.createElement("div");

                matchDiv.className = "match";
                matchDiv.id = "match-" + match.id;

                matchDiv.style.position = "absolute";
                matchDiv.style.left = "0";
                matchDiv.style.width = "100%";
                matchDiv.style.height = MATCH_HEIGHT + "px";

                const center = positions.get(match.id) || 0;

                matchDiv.style.top =
                    (center * SLOT_HEIGHT - MATCH_HEIGHT / 2) + "px";

                const label = document.createElement("div");

                label.className = "match-label";
                label.textContent = "MATCH " + match.number;
                label.style.cursor = "pointer";

                label.addEventListener("click", () => {
                    openMatch(match);
                });

                matchDiv.appendChild(label);

                [match.player1, match.player2].forEach(player => {

                    const playerDiv = document.createElement("div");

                    playerDiv.className = "match-player";
                    playerDiv.textContent = player || "TBD";

                    if (player && match.winner === player) {

                        playerDiv.style.color = "#facc15";
                        playerDiv.style.fontWeight = "bold";
                    }

                    if (player && !match.completed) {

                        playerDiv.style.cursor = "pointer";

                        playerDiv.addEventListener("click", () => {
                            selectWinner(match, player);
                        });
                    }

                    matchDiv.appendChild(playerDiv);
                });

                if (match.completed) {

                    const status = document.createElement("div");

                    status.className = "match-label";
                    status.textContent = "WINNER: " + match.winner;

                    matchDiv.appendChild(status);
                }

                content.appendChild(matchDiv);
            });

            roundDiv.appendChild(content);
            bracketContainer.appendChild(roundDiv);
        });

        drawConnectors();
    }


    // ==========================================
    // LOAD OR CREATE THIS TOURNAMENT'S BRACKET
    // ==========================================

    if (tournamentRecord.bracket) {

        tournament = tournamentRecord.bracket;

    } else {

        tournament = createTournament();

        saveTournament();
    }


    // ==========================================
    // INITIALIZE
    // ==========================================

    updateMatches();
    renderBracket();

}
