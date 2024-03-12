document.addEventListener("DOMContentLoaded", function () {
    let dealsData = [];
    const cardBackPath = "blackjack_images/cardback.png";
    const cardImagePaths = [];

    for (let i = 1; i <= 13; i++) {
        const suits = ["c", "d", "s", "h"];
        for (const suit of suits) {
            const cardPath = `blackjack_images/${i}${suit}.png`;
            cardImagePaths.push(cardPath);
        }
    }

    const totalPower = {
        "player1": 0,
        "player2": 0,
        "player3": 0,
        "player4": 0
    };
    const players = ["player1", "player2", "player3", "player4"];
    const markingScheme = {
        "1": 20,
        "13": 16,
        "12": 14,
        "11": 12,
        "10": 10,
        "9": 8,
        "8": 7,
        "7": 6,
        "6": 5,
        "5": 4,
        "4": 3,
        "3": 2,
        "2": 1,
    };
    var card_dp = 0;

    function shuffle(array) {
        let currentIndex = array.length,
            randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex],
            ];
        }

        return array;
    }

    function distributeCards(useAnimation = true, dp = 0) {
        let shuffledCards = shuffle(cardImagePaths.slice());
        let currentPlayerIndex = 0;

        shuffledCards.forEach((cardPath, index) => {
            let timeout = setTimeout(() => {
                if (index === shuffledCards.length - 2) useAnimation = false;
                dealCard(
                    players[currentPlayerIndex],
                    cardPath,
                    useAnimation
                );
                currentPlayerIndex =
                    (currentPlayerIndex + 1) % players.length;

                if (index === shuffledCards.length - 1) {
                    displayPlayerMarks(dp);
                    determineWinner(dp);
                    return;
                }
            }, index * (useAnimation ? 200 : 0));
        });
    }

    function dealCard(player, cardPath, useAnimation) {
        const playerElement = document.getElementById(player);
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");

        cardElement.style.backgroundImage = `url(${cardBackPath})`;
        if (useAnimation) {
            let timeout = setTimeout(() => {
                cardElement.style.backgroundImage = `url(${cardPath})`;
            }, 20);
        } else {
            cardElement.style.backgroundImage = `url(${cardPath})`;
        }

        playerElement.appendChild(cardElement);
    }

    function calculateMarks(player, cards) {
        let totalMarks = 0;
        let flg = 0;
        let fff = 0;

        cards.forEach((card) => {
            const backgroundImage = card.style.backgroundImage;
            const rankMatch = backgroundImage.match(/\/(\d+)[cdhs]\.png/);

            if (
                rankMatch &&
                rankMatch[1] &&
                markingScheme[rankMatch[1]] !== undefined
            ) {
                totalMarks += markingScheme[rankMatch[1]];
                if (rankMatch[1] == '1') {
                    if (flg == 1) {
                        totalMarks += 10;
                        fff++;
                        if (fff == 2) {
                            alert(player + ' GOT SPECIAL SEQUENCE AAA + 20 power');
                            fff = 0;
                        }
                    }
                    flg = 1;
                } else {
                    if (fff == 1) {
                        alert(player + ' GOT SPECIAL SEQUENCE AA + 10 power');
                        fff = 0;
                    }
                    if (rankMatch[1] == '13' && flg == 1) {
                        flg = 2;
                    } else {
                        if (rankMatch[1] == '12' && flg == 2) {
                            totalMarks += 10;
                            alert(player + ' GOT SPECIAL SEQUENCE AKQ + 10 power');
                            flg = 0;
                        } else {
                            flg = 0;
                        }
                    }
                }
            } else {
                console.error(`Invalid background image: ${backgroundImage}`);
            }
        });

        return totalMarks;
    }

    function displayPlayerMarks(dp) {
        players.forEach((player) => {
            const playerElement = document.getElementById(player);
            const playerCards = Array.from(playerElement.children).slice(dp + 1, dp + 14);
            const playerMarks = calculateMarks(player, playerCards);

            totalPower[player] += playerMarks;
            const marksElement = document.createElement("div");
            marksElement.classList.add("player-marks");
            marksElement.textContent = `Cards Total Power: ${totalPower[player]}`;
            playerElement.appendChild(marksElement);

            const playerPowerTotals = calculatePlayerPowerTotals(players, dp);

            const statisticsElement = document.createElement("div");
            statisticsElement.classList.add("player-statistics");

            const mean = calculateMean(playerPowerTotals[player]);
            const minimum = Math.min(...playerPowerTotals[player]);

            let mini = Object.keys(markingScheme).find(key => markingScheme[key] === minimum);

            const maximum = Math.max(...playerPowerTotals[player]);

            let maxi = Object.keys(markingScheme).find(key => markingScheme[key] === maximum);

            switch (maxi) {
                case '1':
                    maxi = 'A';
                    break;
                case '13':
                    maxi = 'K';
                    break;
                case '12':
                    maxi = 'Q';
                    break;
                case '11':
                    maxi = 'J';
                    break;
            }

            const stdDeviation = calculateStdDeviation(
                playerPowerTotals[player],
                mean
            );

            statisticsElement.textContent = `Mean: ${mean.toFixed(
                2
            )}, Min: ${mini}, Max: ${maxi}, Std Deviation: ${stdDeviation.toFixed(
                2
            )}`;
            playerElement.appendChild(statisticsElement);
        });
    }

    function calculatePlayerPowerTotals(players, dp) {
        const playerPowerTotals = {};

        players.forEach((player) => {
            const cards = Array.from(document.getElementById(player).children).slice(dp + 1, dp + 14);
            playerPowerTotals[player] = Array.from({ length: 13 }, (_, i) =>
                calculateMarks(player, cards.slice(i, i + 1))
            );
        });

        dealsData.push(playerPowerTotals);
        return playerPowerTotals;
    }

    function determineWinner(dp) {
        let maxMarks = -1;
        let winner = "";

        players.forEach((player) => {
            if (totalPower[player] > maxMarks) {
                maxMarks = totalPower[player];
                winner = player;
            }
        });

        const winnerDisplay = document.getElementById("winner-display");
        winnerDisplay.textContent = `${winner} is the winner with ${maxMarks} marks!`;
    }

    function calculateMean(values) {
        return (
            values.reduce((sum, value) => sum + value, 0) / values.length
        );
    }

    function calculateStdDeviation(values, mean) {
        const squaredDiffs = values.map((value) =>
            Math.pow(value - mean, 2)
        );
        const variance =
            squaredDiffs.reduce((sum, squaredDiff) => sum + squaredDiff, 0) /
            values.length;
        return Math.sqrt(variance);
    }

    function single_deal() {
        distributeCards(true, card_dp);
        card_dp += 15;
    }

    function multi_deal() {
        const numDeals = prompt("How many deals would you like?");
        if (numDeals === null || isNaN(numDeals) || numDeals <= 0) {
            alert("Invalid input. Please enter a valid number of deals.");
            return;
        }

        dp = 0;
        for (let i = 0; i < numDeals; i++) {
            dealsData = [];

            setTimeout(() => {}, 52 * 100 * i);
            if (i == 0) {
                distributeCards(true, card_dp);
                card_dp += 15;
            } else {
                setTimeout(() => {
                    distributeCards(false, card_dp);
                    card_dp += 15;
                }, 52 * 200 + 100);
            }
        }
    }

    function changepower() {
        document.getElementById("table").style.display = "none";
        document.getElementById("winner-display").style.display = "none";
        document.getElementById("edit-power").style.display = "block";
    }

    function close() {
        document.getElementById("table").style.display = "flex";
        document.getElementById("winner-display").style.display = "block";
        document.getElementById("edit-power").style.display = "none";
    }

    function change() {
        let c2 = document.getElementById("c2").value;
        let c3 = document.getElementById("c3").value;
        let c4 = document.getElementById("c4").value;
        let c5 = document.getElementById("c5").value;
        let c6 = document.getElementById("c6").value;
        let c7 = document.getElementById("c7").value;
        let c8 = document.getElementById("c8").value;
        let c9 = document.getElementById("c9").value;
        let c10 = document.getElementById("c10").value;
        let c11 = document.getElementById("c11").value;
        let c12 = document.getElementById("c12").value;
        let c13 = document.getElementById("c13").value;
        let c14 = document.getElementById("c14").value;

        markingScheme[1] = parseInt(c14);
        markingScheme[2] = parseInt(c2);
        markingScheme[3] = parseInt(c3);
        markingScheme[4] = parseInt(c4);
        markingScheme[5] = parseInt(c5);
        markingScheme[6] = parseInt(c6);
        markingScheme[7] = parseInt(c7);
        markingScheme[8] = parseInt(c8);
        markingScheme[9] = parseInt(c9);
        markingScheme[10] = parseInt(c10);
        markingScheme[11] = parseInt(c11);
        markingScheme[12] = parseInt(c12);
        markingScheme[13] = parseInt(c13);

        document.getElementById("table").style.display = "flex";
        document.getElementById("winner-display").style.display = "block";
        document.getElementById("edit-power").style.display = "none";
    }

    document
        .getElementById("single-deal")
        .addEventListener("click", single_deal);
    document
        .getElementById("Multi-deal")
        .addEventListener("click", multi_deal);
    document
        .getElementById("Change-Power")
        .addEventListener("click", changepower);
    document
        .getElementById("btn-cancel")
        .addEventListener("click", close);
    document
        .getElementById("btn-change")
        .addEventListener("click", change);
});
