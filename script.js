const player1GridElement = document.getElementById("player1-grid");
const player2GridElement = document.getElementById("player2-grid");
const startButton = document.getElementById("start-button");
const turnIndicator = document.getElementById("turn-indicator");
const shotResult = document.getElementById("shot-result");
const instruction = document.getElementById("instruction");

const gridSize = 10;
let player1Grid = [];
let player2Grid = [];
let currentTurn = "Player1";

let shipLengths = [5, 4, 3, 3, 2];
let isHorizontal = true;
let currentShipLength = shipLengths[0];

document.addEventListener('keydown', event => {
    if (event.key === 'R' || event.key === 'r') {
        isHorizontal = !isHorizontal;
        instruction.textContent = `Ship placement mode: ${isHorizontal ? 'Horizontal' : 'Vertical'}. Press 'R' to rotate.`;
        updateShipPreview();
    }
});

function createGrid(gridElement, gridArray) {
    gridElement.innerHTML = '';
    for (let row = 0; row < gridSize; row++) {
        gridArray[row] = [];
        for (let col = 0; col < gridSize; col++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            gridArray[row][col] = 0;
            gridElement.appendChild(cell);
        }
    }
}

function canPlaceShip(gridArray, row, col, shipLength, isHorizontal) {
    if (isHorizontal) {
        if (col + shipLength > gridSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row][col + i] !== 0) return false;
        }
    } else {
        if (row + shipLength > gridSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row + i][col] !== 0) return false;
        }
    }
    return true;
}

function handleShipPlacement(event, gridArray, player) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (shipLengths.length === 0) {
        alert("All ships placed for this player.");
        return;
    }

    if (canPlaceShip(gridArray, row, col, currentShipLength, isHorizontal)) {
        placeShip(gridArray, row, col, currentShipLength, isHorizontal, player);
        shipLengths.shift();
        currentShipLength = shipLengths[0] || 0;
        instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship. Press 'R' to rotate.`;

        if (shipLengths.length === 0) {
            finishPlayerPlacement(player);
        } else {
            updateShipPreview();
        }
    } else {
        alert("Invalid placement! Try again.");
    }
}

function placeShip(gridArray, row, col, shipLength, isHorizontal, player) {
    const gridElement = player === "Player1" ? player1GridElement : player2GridElement;
    for (let i = 0; i < shipLength; i++) {
        if (isHorizontal) {
            gridArray[row][col + i] = 1;
            gridElement.children[row * gridSize + (col + i)].classList.add("ship");
        } else {
            gridArray[row + i][col] = 1;
            gridElement.children[(row + i) * gridSize + col].classList.add("ship");
        }
    }
}

function updateShipPreview() {
    const gridElement = currentTurn === "Player1" ? player1GridElement : player2GridElement;
    const cells = gridElement.getElementsByClassName("cell");

    for (let cell of cells) {
        cell.classList.remove("preview", "invalid");
    }

    if (currentShipLength === 0) return;

    gridElement.addEventListener("mouseover", showShipPreview);
    gridElement.addEventListener("mouseout", hideShipPreview);
}

function showShipPreview(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const gridElement = currentTurn === "Player1" ? player1GridElement : player2GridElement;
    const gridArray = currentTurn === "Player1" ? player1Grid : player2Grid;

    const isValid = canPlaceShip(gridArray, row, col, currentShipLength, isHorizontal);

    for (let i = 0; i < currentShipLength; i++) {
        let cell;
        if (isHorizontal) {
            if (col + i >= gridSize) break;
            cell = gridElement.children[row * gridSize + (col + i)];
        } else {
            if (row + i >= gridSize) break;
            cell = gridElement.children[(row + i) * gridSize + col];
        }
        cell.classList.add(isValid ? "preview" : "invalid");
    }
}

function hideShipPreview() {
    const gridElement = currentTurn === "Player1" ? player1GridElement : player2GridElement;
    const cells = gridElement.getElementsByClassName("cell");

    for (let cell of cells) {
        cell.classList.remove("preview", "invalid");
    }
}

function finishPlayerPlacement(player) {
    if (player === "Player1") {
        hideShips(player1GridElement);
        currentTurn = "Player2";
        turnIndicator.textContent = `${currentTurn}'s Turn`;
        instruction.textContent = "Player 2, place your ships on the grid. Press 'R' to rotate.";
        shipLengths = [5, 4, 3, 3, 2];
        currentShipLength = shipLengths[0];
        player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
        player2GridElement.classList.remove("disabled");
        player2GridElement.addEventListener("click", player2ShipPlacementHandler);
        updateShipPreview();
    } else {
        hideShips(player2GridElement);
        startGame();
    }
}

function hideShips(gridElement) {
    const cells = gridElement.getElementsByClassName("cell");
    for (let cell of cells) {
        cell.classList.remove("ship");
    }
}

function startGame() {
    player2GridElement.classList.remove("disabled");
    player1GridElement.classList.add("disabled");
    currentTurn = "Player1";
    updateTurnDisplay();

    player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
    player2GridElement.removeEventListener("click", player2ShipPlacementHandler);
    player1GridElement.removeEventListener("mouseover", showShipPreview);
    player1GridElement.removeEventListener("mouseout", hideShipPreview);
    player2GridElement.removeEventListener("mouseover", showShipPreview);
    player2GridElement.removeEventListener("mouseout", hideShipPreview);
    player2GridElement.addEventListener("click", handleAttack);
    player1GridElement.addEventListener("click", handleAttack);

    instruction.textContent = "Game started! Player 1, click on Player 2's grid to fire.";
}

function handleAttack(event) {
    const targetGrid = currentTurn === "Player1" ? player2Grid : player1Grid;
    const targetGridElement = currentTurn === "Player1" ? player2GridElement : player1GridElement;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (targetGrid[row][col] === 1) {
        event.target.classList.add("hit");
        targetGrid[row][col] = 2;
        shotResult.textContent = "Hit!";
        
        if (isShipDestroyed(targetGrid, row, col)) {
            resetShipColor(targetGrid, targetGridElement);
            shotResult.textContent = "Ship destroyed!";
        }
        
        if (checkWinCondition(targetGrid)) {
            alert(`${currentTurn} wins!`);
            resetGame();
            return;
        }
    } else if (targetGrid[row][col] === 0) {
        event.target.classList.add("miss");
        targetGrid[row][col] = 3;
        shotResult.textContent = "Miss!";
        switchTurn();
    } else {
        shotResult.textContent = "You've already fired at this location!";
        return;
    }
}

function isShipDestroyed(grid, hitRow, hitCol) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const shipCells = [[hitRow, hitCol]];
    
    for (let [dx, dy] of directions) {
        let row = hitRow + dx;
        let col = hitCol + dy;
        
        while (row >= 0 && row < gridSize && col >= 0 && col < gridSize && (grid[row][col] === 1 || grid[row][col] === 2)) {
            shipCells.push([row, col]);
            row += dx;
            col += dy;
        }
    }
    
    return shipCells.every(([r, c]) => grid[r][c] === 2);
}

function resetShipColor(grid, gridElement) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 2) {
                const cell = gridElement.children[row * gridSize + col];
                cell.classList.remove("hit");
                cell.classList.add("destroyed");
            }
        }
    }
}

function checkWinCondition(grid) {
    for (let row of grid) {
        if (row.includes(1)) return false;
    }
    return true;
}

function switchTurn() {
    currentTurn = currentTurn === "Player1" ? "Player2" : "Player1";
    updateTurnDisplay();
}

function updateTurnDisplay() {
    turnIndicator.textContent = `${currentTurn}'s Turn`;
    if (currentTurn === "Player1") {
        player2GridElement.classList.remove("disabled");
        player1GridElement.classList.add("disabled");
    } else {
        player1GridElement.classList.remove("disabled");
        player2GridElement.classList.add("disabled");
    }
    instruction.textContent = `${currentTurn}, click on the opponent's grid to fire.`;
}
// ... (previous code remains the same)

function placeShip(gridArray, row, col, shipLength, isHorizontal, player) {
    const gridElement = player === "Player1" ? player1GridElement : player2GridElement;
    for (let i = 0; i < shipLength; i++) {
        if (isHorizontal) {
            gridArray[row][col + i] = { length: shipLength, hit: false };
            gridElement.children[row * gridSize + (col + i)].classList.add("ship");
        } else {
            gridArray[row + i][col] = { length: shipLength, hit: false };
            gridElement.children[(row + i) * gridSize + col].classList.add("ship");
        }
    }
}

// ... (other functions remain the same)

function handleAttack(event) {
    const targetGrid = currentTurn === "Player1" ? player2Grid : player1Grid;
    const targetGridElement = currentTurn === "Player1" ? player2GridElement : player1GridElement;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (targetGrid[row][col] && targetGrid[row][col].length) {
        event.target.classList.add("hit");
        targetGrid[row][col].hit = true;
        shotResult.textContent = "Hit!";
        
        if (isShipDestroyed(targetGrid, row, col)) {
            const shipLength = targetGrid[row][col].length;
            resetShipColor(targetGrid, targetGridElement, shipLength);
            shotResult.textContent = `${shipLength}-length ship destroyed!`;
        }
        
        if (checkWinCondition(targetGrid)) {
            alert(`${currentTurn} wins!`);
            resetGame();
            return;
        }
    } else if (targetGrid[row][col] === 0) {
        event.target.classList.add("miss");
        targetGrid[row][col] = -1;
        shotResult.textContent = "Miss!";
        switchTurn();
    } else {
        shotResult.textContent = "You've already fired at this location!";
        return;
    }
}

function isShipDestroyed(grid, hitRow, hitCol) {
    const shipLength = grid[hitRow][hitCol].length;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const shipCells = [[hitRow, hitCol]];
    
    for (let [dx, dy] of directions) {
        let row = hitRow + dx;
        let col = hitCol + dy;
        
        while (row >= 0 && row < gridSize && col >= 0 && col < gridSize && 
               grid[row][col] && grid[row][col].length === shipLength) {
            shipCells.push([row, col]);
            row += dx;
            col += dy;
        }
    }
    
    return shipCells.every(([r, c]) => grid[r][c].hit);
}

function resetShipColor(grid, gridElement, shipLength) {
    const colorClass = getShipColorClass(shipLength);
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] && grid[row][col].length === shipLength && grid[row][col].hit) {
                const cell = gridElement.children[row * gridSize + col];
                cell.classList.remove("hit", "ship");
                cell.classList.add(colorClass);
            }
        }
    }
}

function getShipColorClass(shipLength) {
    switch (shipLength) {
        case 5: return "destroyed-red";
        case 4: return "destroyed-blue";
        case 3: return "destroyed-orange";
        case 2: return "destroyed-green";
        default: return "destroyed-gray";
    }
}

function checkWinCondition(grid) {
    for (let row of grid) {
        for (let cell of row) {
            if (cell && cell.length && !cell.hit) return false;
        }
    }
    return true;
}

// ... (rest of the code remains the same)

function resetGame() {
    player1GridElement.innerHTML = "";
    player2GridElement.innerHTML = "";
    player1Grid = [];
    player2Grid = [];
    shipLengths = [5, 4, 3, 3, 2];
    currentShipLength = shipLengths[0];
    currentTurn = "Player1";
    isHorizontal = true;
    shotResult.textContent = "";
    instruction.textContent = "Player 1, place your ships on the grid. Press 'R' to rotate.";
    turnIndicator.textContent = "Player 1's Turn";

    player1GridElement.removeEventListener("click", handleAttack);
    player2GridElement.removeEventListener("click", handleAttack);
    player1GridElement.removeEventListener("mouseover", showShipPreview);
    player1GridElement.removeEventListener("mouseout", hideShipPreview);
    player2GridElement.removeEventListener("mouseover", showShipPreview);
    player2GridElement.removeEventListener("mouseout", hideShipPreview);

    createGrid(player1GridElement, player1Grid);
    createGrid(player2GridElement, player2Grid);
    player1GridElement.addEventListener("click", player1ShipPlacementHandler);
    player2GridElement.classList.add("disabled");
    updateShipPreview();
}

function player1ShipPlacementHandler(event) {
    handleShipPlacement(event, player1Grid, "Player1");
}

function player2ShipPlacementHandler(event) {
    handleShipPlacement(event, player2Grid, "Player2");
}

// Initialize the game
createGrid(player1GridElement, player1Grid);
createGrid(player2GridElement, player2Grid);
instruction.textContent = "Player 1, place your ships on the grid. Press 'R' to rotate.";
turnIndicator.textContent = "Player 1's Turn";
player1GridElement.addEventListener("click", player1ShipPlacementHandler);
player2GridElement.classList.add("disabled");
updateShipPreview();

// Add event listener for the start button if needed
// startButton.addEventListener("click", resetGame);