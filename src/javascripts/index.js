/* eslint no-console: 1 */

import { Player } from "../module-game/player-module-v2";
import { Game } from "../module-game/game-module-v2";
import { getAPIDataAsJsObjects } from "../module-universal/api-data-fetcher";
import { getRandomInt } from "../module-universal/get-random-int";
import { setRadioButtons } from "../module-view/btn-utills";
import { extractElementsProperties } from "../module-country-api/extract-country-names";
import { updateScore } from "../module-game/update-score";
import { renderResult } from "../module-view/render-result";
import { shuffle } from "../module-universal/array-utilities/shuffle";
import { getUserAnswer } from "../module-view/get-user-answer";
import { getLevelItemsArrMap } from "../module-country-api/extract-country-names";
import { getEasyArray, getMediumArray, getHardArray, getMasterArray } from "../module-country-api/immutable-arrays";
import { setCursorType } from "../module-view/set-cursor-type";
import { Persistence } from "../module-persistence/persistence";

/* ----------------------- HTML elements -------------------------- */
const flagImg = document.getElementById("flag");
const first = document.querySelector("#options .option:nth-of-type(1) label");
const second = document.querySelector("#options .option:nth-of-type(2) label");
const third = document.querySelector("#options .option:nth-of-type(3) label");
const topRadioButton = document.getElementById("choice1");
const middleRadioButton = document.getElementById("choice2");
const bottomRadioButton = document.getElementById("choice3");
const answer = document.getElementById("answer");
const result = document.getElementById("result");
const form = document.querySelector("form");
const p1Score = document.querySelector("#rightScore");
const p2Score = document.querySelector("#leftScore");
const opt = document.querySelector("#settings");
const player1MatchScore = document.querySelector("#p1MatchScore");
const player2MatchScore = document.querySelector("#p2MatchScore");
const resetBtn = document.querySelector("#resetBtn");
const optionsPage = document.querySelector("#optionsPage");
const gamePage = document.querySelector("#gamePage");
const levelChoice = document.querySelector("#level-select");
const radioBtns = document.querySelectorAll("input[type=radio]");
const cursorStuff = document.querySelectorAll(".pointer");
const playBtn = document.querySelector("#play");
const next = document.getElementById("nextBtn");
const nextDiv = document.getElementById("nextBtnDiv");

/* -----------------------  other variables  -------------------------- */
const API_URL = "https://restcountries.eu/rest/v2/all";
const player1 = new Player(1);
const player2 = new Player(2);
let opt2;
let opt3;
let countryArray;
let options = [];
let correctAnswer;
let nextFlagAllowed = false;
let difficulty = "medium";
let indexOfAnswer = 0;
let masterFlagsImmutable = [];
let persistence = new Persistence();
let easyFlagsImmutable = getEasyArray();
let mediumFlagsImmutable = getMediumArray();
let hardFlagsImmutable = getHardArray();
let allFlags = getLevelItemsArrMap(easyFlagsImmutable.slice(), mediumFlagsImmutable.slice(), hardFlagsImmutable.slice(), masterFlagsImmutable.slice());
let flagsPerMatch = Math.round((mediumFlagsImmutable.length - 1) / 2);
let game = new Game("Flag game", flagsPerMatch);

/* -----------------------  logic  -------------------------- */

init();




/* -------------------------- Event listeners ---------------------------- */
levelChoice.addEventListener("change", function (event) {
    difficulty = levelChoice.value;
    flagsPerMatch = setQuestionNumber();
    const currPlayerWhenChangeLVL = game.getCurrentPlayer();
    game = new Game("Flag game", flagsPerMatch);
    game.setCurrentPlayer(currPlayerWhenChangeLVL);
    renderScores();
    reset();
});

form.addEventListener("change", function (event) {
    nextFlagAllowed = true;
    next.classList.remove("invisible");
    next.classList.add("visible");
    setRadioButtons([topRadioButton, middleRadioButton, bottomRadioButton], "disabled", true);
    const userAnswer = getUserAnswer(radioBtns);
    renderAnswer(Number(userAnswer) === correctAnswer);
    changeTurn();
    renderScores();
    event.preventDefault();
}, false);

next.addEventListener("click", function () {
    if (nextDiv.classList.contains("bigMargin") === true) {
        nextDiv.classList.remove("bigMargin");
        nextDiv.classList.add("normalMargin");
    }
    if (nextFlagAllowed) {
        reset();
        nextFlagAllowed = false;
        next.classList.add("invisible");
        next.classList.remove("visible");
    }
});

opt.addEventListener("click", function () {
    optionsPage.classList.remove("invisible");
    gamePage.classList.remove("visible");
    gamePage.classList.add("invisible");
    optionsPage.classList.add("visible");
    playBtn.classList.remove("bold");
    opt.classList.add("bold");
});

playBtn.addEventListener("click", function () {
    opt.classList.remove("bold");
    playBtn.classList.add("bold");
    gamePage.classList.remove("invisible");
    optionsPage.classList.add("invisible");
    optionsPage.classList.remove("visible");
    gamePage.classList.add("visible");
});

resetBtn.addEventListener("click", function () {
    game.resetCurrentTurn();
    persistence.put("player1", Number(0));
    persistence.put("player2", Number(0));
    p1Score.classList.add("activePlayer");
    p2Score.classList.remove("activePlayer");
    game.setCurrentPlayer(player1);
    player1.setScore(0);
    player2.setScore(0);
    renderScores();
});

function renderAnswer(userGuessed) {
    if (userGuessed) {
        answer.classList.remove("red");
        answer.classList.add("green");
        renderResult("Correct!", answer);
        updateScore(game);
    }
    else {
        answer.classList.remove("green");
        answer.classList.add("red");
        renderResult("Inncorect! Correct answer is " + countryArray[correctAnswer].name, answer);
    }
}
/* ------------------------------ main methods --------------------------- */

async function init() {
    setCursorType(cursorStuff, "pointer");
    countryArray = await getAPIDataAsJsObjects(API_URL);
    masterFlagsImmutable = getMasterArray(easyFlagsImmutable, mediumFlagsImmutable, hardFlagsImmutable, countryArray);
    reset();
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.setCurrentPlayer(player1);
    renderTottalMatches();
    p1Score.classList.add("activePlayer");
    optionsPage.classList.add("invisible");
    playBtn.classList.add("bold");

    if (persistence.get("player1") === null) {
        persistence.put("player1", Number(0));
        persistence.put("player2", Number(0));
    }
    renderScores();
}
function initNewMatch() {
    nextDiv.classList.remove("normalMargin");
    nextDiv.classList.add("bigMargin");
    printMatchResult();
    p1Score.classList.add("activePlayer");
    p2Score.classList.remove("activePlayer");
    player1.setScore(0);
    player2.setScore(0);
    renderScores();
    renderTottalMatches();
}

function changeTurn() {
    if (game.getCurrentTurn() < game.getNoOfTurns()) {
        game.incrementTurn();
    } else {
        if (game.getCurrentPlayer().getId() === player1.getId()) {
            p1Score.classList.remove("activePlayer");
            p2Score.classList.add("activePlayer");
            game.setCurrentPlayer(player2);

        } else {
            game.setCurrentPlayer(player1);
            initNewMatch();
        }
        game.resetCurrentTurn();

    }
}

async function reset() {
    result.innerHTML = "";
    answer.innerHTML = "";
    options = generateOptionsAsIndexes(allFlags); // np 56, 78, 134
    correctAnswer = options[0]; // 56
    shuffle(options);
    renderCountryNamesOnBtns(extractElementsProperties(options, countryArray, "name"));
    setFlagUrl(extractFlag(correctAnswer));
    let optionsRadioButtons = [topRadioButton, middleRadioButton, bottomRadioButton];
    setRadioButtons(optionsRadioButtons, "disabled", false);
    setRadioButtons(optionsRadioButtons, "checked", false);
    topRadioButton.checked = false;
    middleRadioButton.checked = false;
    bottomRadioButton.checked = false;
}
/* ------------------------------ heplers ----------------------------- */
function checkIfOutOfFlags(difficultyCoutriesObj) {

    if (difficultyCoutriesObj[difficulty].length < 2) {
        difficultyCoutriesObj[difficulty] = eval(difficulty + "FlagsImmutable").slice();
    }
}
function renderCountryNamesOnBtns() {
    first.innerText = countryArray[options[0]].name;
    second.innerText = countryArray[options[1]].name;
    third.innerText = countryArray[options[2]].name;
    topRadioButton.value = options[0];
    middleRadioButton.value = options[1];
    bottomRadioButton.value = options[2];
}

function setFlagUrl(flag) {
    flagImg.src = flag;
}

function extractFlag(correctAnswer) {
    return countryArray[correctAnswer].flag;
}

function renderScores() {
    p1Score.innerHTML = player1.getScore() + "/" + game.getNoOfTurns();
    p2Score.innerHTML = "  :  " + player2.getScore() + "/" + game.getNoOfTurns();

}
function renderTottalMatches() {
    player1MatchScore.innerHTML = persistence.get("player1");
    player2MatchScore.innerHTML = "  :  " + persistence.get("player2");
}

function generateOtherCountries() {
    opt2 = getRandomInt(0, countryArray.length);
    opt3 = getRandomInt(0, countryArray.length);
}

function generateOptionsAsIndexes(difficultyCountriesObj) {
    let opt1;
    generateOtherCountries();
    checkIfOutOfFlags(difficultyCountriesObj);
    const mutableArray = difficultyCountriesObj[difficulty];

    const randomIndex = getRandomInt(0, mutableArray.length);
    opt1 = mutableArray[randomIndex];
    mutableArray.splice(randomIndex, 1);
    for (let i = 0; i < countryArray.length; i++) {
        if (opt1 === countryArray[i].name) {
            indexOfAnswer = i;
        }
    }
    while (opt2 === indexOfAnswer || indexOfAnswer === opt3 || opt2 === opt3) {
        generateOtherCountries();
    }
    return [indexOfAnswer, opt2, opt3];
}

function printMatchResult() {
    if (game.isDraw()) {
        result.innerHTML = "It is a draw!!!! No more " + difficulty + " flags availeble for this level. Play again with the same flags or change difficulty in the options.";
    }
    else {

        if (player1.getScore() > player2.getScore()) {
            printCurrentMatchEndMsg("player1");
        }
        else {
            printCurrentMatchEndMsg("player2");
        }
    }
}
function printCurrentMatchEndMsg(winner) {
    const score = persistence.get(winner);
    persistence.put(winner, Number(score) + 1); // We persist only total matches, not current score
    result.innerHTML = "player " + ((winner === "player1") ? "one" : "two") + " has won. " + "No more " + difficulty + " flags availeble for this level. Play again with the same flags or change difficulty in the options.";
}
const setQuestionNumber = () => Math.round((eval(difficulty + "FlagsImmutable").length - 1) / 2);

function renderAnswer(userGuessed) {
    if (userGuessed) {
        answer.classList.remove("red");
        answer.classList.add("green");
        renderResult("Correct!", answer);
        updateScore(game);
    }
    else {
        answer.classList.remove("green");
        answer.classList.add("red");
        renderResult("Inncorect! Correct answer is " + countryArray[correctAnswer].name, answer);
    }
}