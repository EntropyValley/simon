function loadSound(filename) {
    return new Audio('assets/' + filename);
}

function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(true);
        }, milliseconds);
    });
}

const buttonDescriptions = [
    {
        file: 'sound1.mp3',
        hue: 120
    },
    {
        file: 'sound2.mp3',
        hue: 0
    },
    {
        file: 'sound3.mp3',
        hue: 60
    },
    {
        file: 'sound4.mp3',
        hue: 240
    }
]

class Button {
    constructor(description, element) {
        this.element = element;
        this.hue = description.hue;
        this.sound = loadSound(description.file);
        this.paint(25);
    }

    paint(level) {
        const background = `hsl(${this.hue}, 100%, ${level}%)`;
        this.element.style.backgroundColor = background;
    }

    async press(volume) {
        this.paint(50);
        await this.play(volume)
        this.paint(25);
    }

    async play(volume = 1.0) {
        this.sound.volume = volume;
        await new Promise((resolve) => {
            this.sound.onended = resolve;
            this.sound.play();
        });
    }
}

class Game {
    buttons;
    allowPlayer;
    sequence;
    playerPlaybackPos;
    mistakeSound;

    constructor() {
        this.buttons = new Map();
        this.allowPlayer = false;
        this.sequence = [];
        this.playerPlaybackPos = 0;
        this.mistakeSound = loadSound('error.mp3');

        document.querySelectorAll('.simon-button').forEach((element, index) => {
            if (index < buttonDescriptions.length) {
                this.buttons.set(element.id, new Button(buttonDescriptions[index], element));
            }
        });

        const playerElement = document.querySelector('.player-name');
        playerElement.textContent = this.getPlayerName();
    }

    async pressButton(button) {
        if (this.allowPlayer) {
            this.allowPlayer = false;
            await this.buttons.get(button.id).press(1.0);

            if (this.sequence[this.playerPlaybackPos].element.id === button.id) {
                this.playerPlaybackPos++;
                if (this.playerPlaybackPos === this.sequence.length) {
                    this.playerPlaybackPos = 0;
                    this.addButton();
                    this.updateScore(this.sequence.length - 1);
                    await this.playSequence();
                }
                this.allowPlayer = true;
            } else {
                this.saveScore(this.sequence.length - 1);
                this.mistakeSound.play();
                await this.buttonDance(2);
            }
        }
    }

    getPlayerName() {
        return localStorage.getItem('username') ?? 'Mystery player';
    }

    async reset() {
        this.allowPlayer = false;
        this.playerPlaybackPos = 0;
        this.sequence = [];
        this.updateScore('--');
        await this.buttonDance(1);
        this.addButton();
        await this.playSequence();
        this.allowPlayer = true;
    }

    async playSequence() {
        await delay(500);
        for (const btn of this.sequence) {
            await btn.press(1.0);
            await delay(100);
        }
    }

    addButton() {
        const btn = this.getRandomButton();
        this.sequence.push(btn);
    }

    updateScore(score) {
        const scoreEl = document.querySelector('#simon-count');
        scoreEl.value = score;
    }

    async buttonDance(laps = 1) {
        for (let step = 0; step < laps; step++) {
            for (const btn of this.buttons.values()) {
                await btn.press(0.0);
            }
        }
    }

    getRandomButton() {
        let buttons = Array.from(this.buttons.values());
        return buttons[Math.floor(Math.random() * this.buttons.size)];
    }

    saveScore(score) {
        const userName = this.getPlayerName();
        let scores = [];
        const scoresText = localStorage.getItem('scores');
        if (scoresText) {
            scores = JSON.parse(scoresText);
        }
        scores = this.updateScores(userName, score, scores);

        localStorage.setItem('scores', JSON.stringify(scores));
    }

    updateScores(userName, score, scores) {
        const date = new Date().toLocaleDateString();
        const newScore = { name: userName, score: score, date: date };
        let found = false;

        for (const [i, prevScore] of scores.entries()) {
            if (score > prevScore.score) {
                scores.splice(i, 0, newScore);
                found = true;
                break;
            }
        }

        if (!found) {
            scores.push(newScore);
        }

        if (scores.length > 10) {
            scores.length = 10;
        }

        return scores;
    }
}

const game = new Game();