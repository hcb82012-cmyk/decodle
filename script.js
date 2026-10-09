import { WORDS } from "./words.js";

/* ---------------- GAME STATE ---------------- */ 
let mode = "Standard mode";
const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];

let isGameOver = false;
let interval = null;
let minuteTimerStarted = false;
let Hard = false;

/* ---------------- BOARD ---------------- */
function initBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = "";

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        const row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < 5; j++) {
            const box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }
        board.appendChild(row);
    }
}

/* ---------------- ANIMATION ---------------- */
const animateCSS = (element, animation, prefix = "animate__") =>
    new Promise(resolve => {
        const animationName = `${prefix}${animation}`;
        element.style.setProperty("--animate-duration", "0.3s");
        element.classList.add(`${prefix}animated`, animationName);

        element.addEventListener(
            "animationend",
            () => {
                element.classList.remove(`${prefix}animated`, animationName);
                resolve();
            },
            { once: true }
        );
    });

/* ---------------- INPUT ---------------- */
function insertLetter(letter) {
    if (nextLetter === 5 || isGameOver) return;

    const row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    const box = row.children[nextLetter];

    animateCSS(box, "pulse");
    box.textContent = letter;
    box.classList.add("filled-box");

    currentGuess.push(letter);
    nextLetter++;
}

function deleteLetter() {
    if (nextLetter === 0 || isGameOver) return;

    const row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    const box = row.children[nextLetter - 1];

    box.textContent = "";
    box.classList.remove("filled-box");

    currentGuess.pop();
    nextLetter--;
}

/* ---------------- GUESS CHECK ---------------- */
function checkGuess() {
    if (currentGuess.length !== 5) {
        toastr.error("Not enough letters!");
        return;
    }

    const guess = currentGuess.join("");

    if (!WORDS.includes(guess)) {
        toastr.error("Word not in list!");
        return;
    }

    const row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    const solution = Array.from(rightGuessString);

    for (let i = 0; i < 5; i++) {
        let color = "red";

        if (solution.includes(currentGuess[i])) {
            color = currentGuess[i] === solution[i] ? "green" : "yellow";
            solution[solution.indexOf(currentGuess[i])] = "#";
        }

        setTimeout(() => {
            animateCSS(row.children[i], "flipInX");
            row.children[i].style.backgroundColor = color;
            shadeKeyboard(currentGuess[i], color);
        }, i * 250);
    }

    if (guess === rightGuessString) {
        toastr.success(`Correct! You got "${rightGuessString}" in ${7 - guessesRemaining} guesses! in ${mode}`);
        endGame();
        return;
    }

    guessesRemaining--;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
        toastr.error("Out of guesses!");
        toastr.info(`The word was "${rightGuessString}"`);
        endGame();
    }
}

/* ---------------- KEYBOARD ---------------- */
function shadeKeyboard(letter, color) {
    for (const key of document.getElementsByClassName("keyboard-button")) {
        if (key.textContent.toLowerCase() === letter) {
            if (key.style.backgroundColor === "green") return;
            if (key.style.backgroundColor === "yellow" && color === "red") return;
            key.style.backgroundColor = color;
        }
    }
}

/* ---------------- GAME END ---------------- */
function endGame() {
    isGameOver = true;
    guessesRemaining = 0;
    if (interval) clearInterval(interval);
}

/* ---------------- EVENTS ---------------- */
document.addEventListener("keyup", e => {
    if (isGameOver) return;

    if (e.key === "Backspace") deleteLetter();
    else if (e.key === "Enter") checkGuess();
    else if (/^[a-z]$/i.test(e.key)) insertLetter(e.key.toLowerCase());
});

document.getElementById("keyboard-cont").addEventListener("click", e => {
    if (!e.target.classList.contains("keyboard-button")) return;
    const key = e.target.textContent === "Del" ? "Backspace" : e.target.textContent;
    document.dispatchEvent(new KeyboardEvent("keyup", { key }));
});

/* ---------------- BUTTONS ---------------- */
let hintUsed = false;
document.querySelector(".hint").addEventListener("click", () => {
    if (isGameOver) return;
    const letter = rightGuessString[Math.floor(Math.random() * 5)];
    if (hintUsed == true) {
        toastr.warning("Hint already used this game!");
        return;
    }
    else {
      hintUsed = true;
      toastr.info(`Hint: The word contains "${letter.toUpperCase()}"`);
    }
});

document.querySelector(".give-up").addEventListener("click", () => {
    if (isGameOver) return;
    toastr.info(`The word was "${rightGuessString}"`);
    endGame();
});

document.querySelector(".new-game").addEventListener("click", () => {
    if (interval) clearInterval(interval);
    location.reload();
});

/* ---------------- MODES ---------------- */
document.querySelector(".minute-mode").addEventListener("click", () => {
    if (minuteTimerStarted || isGameOver) return;

    minuteTimerStarted = true;

    let time = 60;
    document.getElementById("timer").textContent = `Time: ${time}s`;
    if (mode != "Dev mode"){
if (mode === "Hard mode") {
    mode = "Hard minute mode";
} else {
    mode = "Minute mode";
}
    }
    document.getElementById("mode-indicator").textContent = mode;
    modeAlert();

    interval = setInterval(() => {
        time--;
        document.getElementById("timer").textContent = `Time: ${time}s`;

        if (time <= 0) {
            toastr.error("Time's up!");
            toastr.info(`The word was "${rightGuessString}"`);
            endGame();
        }
    }, 1000);
});

document.querySelector(".Hard-mode").addEventListener("click", () => {
    if (isGameOver) return;
    Hard = true;
    document.getElementById("mode-indicator").textContent = "Hard mode";
    updateCipherOutput();

    if (mode != "Dev mode"){
if (mode === "Minute mode") {
    mode = "Hard minute mode";
} else {
    mode = "Hard mode";
}
    }
    modeAlert();
    document.getElementById("mode-indicator").textContent = mode;
});


document.querySelector(".dev-mode").addEventListener("click", () => {
    console.log(`The word is "${rightGuessString}"`);
    mode = "Dev mode"
    modeAlert();
    document.getElementById("mode-indicator").textContent = mode;
});

document.querySelector(".standard-mode").addEventListener("click", () => {
    if (isGameOver) return;
    Hard = false;
    updateCipherOutput();
    if (mode != "Dev mode"){
     mode = "Standard mode"
    }
    modeAlert();
    document.getElementById("mode-indicator").textContent = mode;
});

document.querySelector(".Check-mode").addEventListener("click", () => {
    modeAlert();
});

/* ---------------- CIPHER OUTPUT ---------------- */
const aValue = Math.floor(Math.random() * 26) + 1;
let alphabetMap = {};
for (let i = 0; i < 26; i++) {
    alphabetMap[String.fromCharCode(97 + i)] = ((aValue + i) % 26) + 1;
}

function updateCipherOutput() {
    const letters = [...rightGuessString.toLowerCase()];
    const encoded = letters.map(c => alphabetMap[c] ?? "?");

    const outputNumbers = Hard ? encoded.slice(0, 4) : encoded;

    document.getElementById("output").textContent = Hard
        ? `Numbers (Hard mode): ${outputNumbers.join(", ")}`
        : `Numbers: ${outputNumbers.join(", ")}`;
}

function modeAlert() {
    toastr.info(`The mode you are in is "${mode}"`)
}

/* ---------------- INIT ---------------- */
initBoard();
updateCipherOutput();


