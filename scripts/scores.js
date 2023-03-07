let scores = [];

const scoresJSON = localStorage.getItem('scores');
if (scoresJSON) {
    scores = JSON.parse(scoresJSON);
}

const scoresTable = document.querySelector('#scores');

if (scores.length) {
    for (const [position, score] of scores.entries()) {
        const newRow = document.createElement('tr');

        const positionElement = document.createElement('td');
        positionElement.textContent = position + 1;
        newRow.appendChild(positionElement);

        const nameElement = document.createElement('td');
        nameElement.textContent = score.name;
        newRow.appendChild(nameElement);

        const scoreElement = document.createElement('td');
        scoreElement.textContent = score.score;
        newRow.appendChild(scoreElement);

        const dateElement = document.createElement('td');
        dateElement.textContent = score.date;
        newRow.appendChild(dateElement);

        scoresTable.appendChild(newRow);
    }
} else {
    scoresTable.innerHTML = '<tr><td colSpan=4>Be the first to score!</td></tr>'
}