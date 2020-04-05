import { Player } from "../modulev2/player-module-v2";
import { Game } from "../modulev2/game-module-v2";

/* ----------------------- HTML elements -------------------------- */
let flagImg = document.getElementById("flag");
let first = document.querySelector("#options .option:nth-of-type(1) label");
let second = document.querySelector("#options .option:nth-of-type(2) label");
let third = document.querySelector("#options .option:nth-of-type(3) label");
let firstInput = document.getElementById("choice1");
let secondInput = document.getElementById("choice2");
let thirdInput = document.getElementById("choice3");
let answer = document.getElementById("answer");
let result = document.getElementById("result");
let form = document.querySelector("form");
let p1Score = document.querySelector("#rightScore");
let p2Score = document.querySelector("#leftScore");
let opt = document.querySelector("#settings");
let p1MatchScore = document.querySelector("#p1MatchScore");
let p2MatchScore = document.querySelector("#p2MatchScore");
let resetBtn = document.querySelector("#resetBtn");
let optionsPage = document.querySelector("#optionsPage");
let gamePage = document.querySelector("#gamePage");
let levelChoice = document.querySelector("#level-select");
let radioBtns = document.querySelectorAll("input[type=radio]");
let playBtn = document.querySelector("#play");
let next = document.getElementById("nextBtn");
let nextDiv = document.getElementById("nextBtnDiv");
// other variables 

let opt2;
let opt3;
const API_URL = "https://restcountries.eu/rest/v2/all"
let countryArray;
let options = [];
let correctAnswer;
let nextFlagAllowed = false;
let difficulty = "medium";
let indexOfAnswer = 0;
let easyFlagsImmutable = ["Korea (Republic of)", "Netherlands", "Indonesia", 
"Mayotte", "Antarctica", "Israel", "Canada", "Switzerland", "Brazil", "Japan", 
"United Kingdom of Great Britain and Northern Ireland", "Sweden","Turkey", "Germany", "United States of America", 
"Spain", "Cyprus", "Slovakia", "Greece", "Austria", "Croatia", "Italy", "Denmark", "Russian Federation", 
"Poland", "France", "China", "Uruguay", "Belgium", "Czech Republic", "Ukraine", "Holy See", "Norway","Portugal", "Sudan", "Finland", "Nepal", "New Zeland", "Iceland", "United States Minor Outlying Islands"];
let mediumFlagsImmutable = [ "Australia", "Puerto Rico", "Korea (Democratic People's Republic of)",  
"Mexico",   "Macedonia (the former Yugoslav Republic of)", 
"Saint Martin (French part)", "Malta", "Luxembourg", "Ireland", "Bulgaria",  "Republic of Kosovo", "Iraq", "India", 
"Egypt","Chile", "Mongolia",  "Lithuania","Montenegro", "Viet Nam", 
"Slovenia", "Albania", "Hungary", "Macedonia", "Belarus", 
"Estonia", "Romania", "Saudi Arabia", "Nicaragua", "Venezuela (Bolivarian Republic of)", "Syrian Arab Republic", "Serbia", "Hong Kong", "Argentina"];
let hardFlagsImmutable = ["Tunisia", "Liechtenstein", "Bosnia and Herzegovina", "Greenland", "Kenya", "Georgia", "Thailand", "Panama", "Jersey", "Bhutan", "Cambodia", "Tobago",
"Kuwait", "Haiti", "Algieria", "Lebanon", "Sri Lanka", "Libya", "Jamaica", "Colombia", "Ecuador", "Paraguay", "Afghanistan", "San Marino", "Sudan", "Andora", "Senegal", "Somalia",
"Turkmenistan", "Pakistan", "Iran", "Peru", "Cuba", "Honduras", "Jordan", "Uzbekistan", "South Georgia and the South Sandwich Islands", "Papua New Guinea", "Cook Islands",
"Virgin Islands (British)", "Heard Island and McDonald Islands", "Western Sahara", "Åland Islands", "French Southern Territories", "Nigeria"];
let easyFlagsMutable = easyFlagsImmutable.slice();
let mediumFlagsMutable = mediumFlagsImmutable.slice();
let hardFlagsMutable = hardFlagsImmutable.slice();
let masterFlagsMutable = [];
let masterFlagsImmutable = [];
let flagsPerMatch = Math.round((mediumFlagsImmutable.length -1)/ 2);
let game = new Game("Flag game", flagsPerMatch);
const player1 = new Player(1);
const player2 = new Player(2);



game.addPlayer(player1);
game.addPlayer(player2);
game.setCurrentPlayer(player1); 
init();
p1Score.classList.add("activePlayer");
optionsPage.classList.add("invisible");
playBtn.classList.add("bold");

if (localStorage.getItem("player1") === null) {
    localStorage.setItem('player1', Number(0));
    localStorage.setItem('player2', Number(0));
    
    renderScores()
} else {
    renderScores()
}


/* -------------------------- Event listeners ---------------------------- */
levelChoice.addEventListener("change", function (event) {
difficulty = levelChoice.value;
setQuestionNumber();
let currPlayerWhenChangeLVL = game.getCurrentPlayer();
game = new Game("Flag game", flagsPerMatch);
game.setCurrentPlayer(currPlayerWhenChangeLVL); 
renderScores();
reset();
});

form.addEventListener("change", function (event) {
    nextFlagAllowed = true;
    next.classList.remove("invisible");
    next.classList.add("visible");
    disableRadioButtons();
    let userAnswer = getUserAnswer();
    renderAnswer(Number(userAnswer) === correctAnswer);
    changeTurn();
    renderScores();
    event.preventDefault();
}, false);

next.addEventListener("click", function () {
    if(nextDiv.classList.contains("bigMargin") === true){
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
    localStorage.setItem('player1', Number(0));
    localStorage.setItem('player2', Number(0));
    p1Score.classList.add("activePlayer");
    p2Score.classList.remove("activePlayer");
    game.setCurrentPlayer(player1);
    player1.setScore(0);
    player2.setScore(0);
    renderScores();
});


function getUserAnswer() {
    let userAnswer = "";
    for (var i = 0; i < radioBtns.length; i++) {
        if (radioBtns[i].checked) {
            userAnswer = radioBtns[i].value;
        }
    }
    return userAnswer;
}

function disableRadioButtons() {
    firstInput.disabled = true;
    secondInput.disabled = true;
    thirdInput.disabled = true;
}
function renderAnswer(userGuessed) {
    if (userGuessed) {
        answer.classList.remove("red");
        answer.classList.add("green");
        renderResult("Correct!");
        updateScore();
    }
    else {
        answer.classList.remove("green");
        answer.classList.add("red");
        renderResult("Inncorect! Correct answer is " + countryArray[correctAnswer].name);
    }
}

/* ------------------------------ main methods --------------------------- */

async function init() {
    countryArray = await requestCountryData();
    createMasterFlagsArray();
    masterFlagsMutable = masterFlagsImmutable.slice();
    reset();
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
}

function updateScore() {
    
    let currPlayer = game.getCurrentPlayer();
    currPlayer.setScore(currPlayer.getScore() + 1);
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
    options = generateOptionsAsIndexes(); // np 56, 78, 134
    correctAnswer = options[0]; // 56
    shuffle(options);
    renderCountryNamesOnBtns(extractCountryNames());
    setFlagUrl(extractFlag(correctAnswer));
    firstInput.disabled = false;
    secondInput.disabled = false;
    thirdInput.disabled = false;
    firstInput.checked = false;
    secondInput.checked = false;
    thirdInput.checked = false;
}



/* ------------------------------ heplers ----------------------------- */
function checkIfOutOfFlags(){
    if(easyFlagsMutable.length < 1){
        easyFlagsMutable = easyFlagsImmutable.slice();
    }
    if(mediumFlagsMutable.length < 1){
        mediumFlagsMutable = mediumFlagsImmutable.slice();
    }
    if(masterFlagsMutable.length < 1){
        masterFlagsMutable = masterFlagsImmutable.slice();
    }
}
async function requestCountryData() {
    try {
        let response = await fetch(API_URL);
        let countryArray = await response.json();
        return countryArray;
    } catch (error) {
        console.log(error);
    }
}
function renderResult(msg) {
    answer.innerHTML = msg;
}
/**
 * Returns a random number between min (inclusive) and max(exclusive)
 */
function getRandomInt(min, max) {
    let maxExclusive = true;
    min = Math.ceil(min);
    max = maxExclusive ? Math.floor(max) - 1 : Math.floor(max);
    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    return random;
}

function renderCountryNamesOnBtns(countryNames) {
    first.innerText = countryArray[options[0]].name;
    second.innerText = countryArray[options[1]].name;
    third.innerText = countryArray[options[2]].name;
    firstInput.value = options[0];
    secondInput.value = options[1];
    thirdInput.value = options[2];
}

function setFlagUrl(flag) {
    flagImg.src = flag;
}

function extractCountryNames() {
    let names = [];
    let countryNmb;
    for (let i = 0; i < options.length; i++) {
        countryNmb = options[i];
        names[i] = countryArray[countryNmb].name;
    }
    return names;
}

function extractFlag(correctAnswer) {
    return countryArray[correctAnswer].flag;
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function renderScores() {
    p1Score.innerHTML = player1.getScore() + "/" + game.getNoOfTurns();
    p2Score.innerHTML = "  :  " + player2.getScore() + "/" + game.getNoOfTurns();
    p1MatchScore.innerHTML = localStorage.getItem("player1");
    p2MatchScore.innerHTML = "  :  " + localStorage.getItem("player2");
}




function generateOtherCountries(){
     opt2 = getRandomInt(0, countryArray.length);
     opt3 = getRandomInt(0, countryArray.length);
}

function generateOptionsAsIndexes() {
    let opt1;
    generateOtherCountries();
    checkIfOutOfFlags();
    if(difficulty === "easy"){
        let index = getRandomInt(0, easyFlagsMutable.length)
        opt1 = easyFlagsMutable[index];
        easyFlagsMutable.splice(index, 1);
    }if(difficulty === "medium"){
        let index = getRandomInt(0, mediumFlagsMutable.length);
        opt1 = mediumFlagsMutable[index];
       mediumFlagsMutable.splice(index, 1);
    }if(difficulty === "hard"){
        let index = getRandomInt(0, hardFlagsMutable.length);
        opt1 = hardFlagsMutable[index];
        hardFlagsMutable.splice(index, 1);
    }if(difficulty === "master"){
        let index = getRandomInt(0, masterFlagsMutable.length);
        opt1 = masterFlagsMutable[index];
        masterFlagsMutable.splice(index, 1);
    }
    for(let i=0; i<countryArray.length; i++){
        if(opt1 === countryArray[i].name){
            indexOfAnswer = i;
        }
    }
    while(opt2 === indexOfAnswer || indexOfAnswer === opt3 || opt2 === opt3){
        generateOtherCountries();
    }
    return [indexOfAnswer, opt2, opt3];
}



function createMasterFlagsArray(){
    let j = 0;
    for(let i=0; i < countryArray.length; i++){
        if(easyFlagsImmutable.includes(countryArray[i].name) === false && mediumFlagsImmutable.includes(countryArray[i].name) === false && hardFlagsImmutable.includes(countryArray[i].name) === false){
            masterFlagsImmutable[j] = countryArray[i].name;
            j++;
        }
    }
}

function printMatchResult(){
   
    if (game.isDraw()) {
        result.innerHTML = "It is a draw!!!! No more " + difficulty + " flags availeble for this level. Play again with the same flags or change difficulty in the options.";
    }
    else {
        if (player1.getScore() > player2.getScore()) {
            let score = localStorage.getItem("player1");
            localStorage.setItem("player1", Number(score) + 1);
            result.innerHTML = "player one has won. No more " + difficulty + " flags availeble for this level. Play again with the same flags or change difficulty in the options.";
        }
        else {
            let score = localStorage.getItem("player2");
            localStorage.setItem("player2", Number(score) + 1);
            result.innerHTML = "player two has won. No more " + difficulty + " flags availeble for this level. Play again with the same flags or change difficulty in the options.";
        }
    }
}

function setQuestionNumber(){
    if(difficulty === "easy"){
        flagsPerMatch = Math.round((easyFlagsImmutable.length-1) / 2);
    }
    if(difficulty === "medium"){
        answer.classList.add("LastAnswer");
        flagsPerMatch = Math.round((mediumFlagsImmutable.length -1)/ 2); 
    }
    if(difficulty === "hard"){
        flagsPerMatch = Math.round((hardFlagsImmutable.length -1)/ 2);
    }
    if(difficulty === "master"){
        flagsPerMatch = Math.round((masterFlagsImmutable.length-1) / 2);
    }
}