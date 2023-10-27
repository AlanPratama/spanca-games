import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")
const grid = new Grid(gameBoard)

grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

function setupInput() {
    window.addEventListener("keydown", handleInput, {once: true})
}

// let touchStartX = 0;
// let touchStartY = 0;

// async function handleInput(e) {
//     let deltaX, deltaY;

//     switch (e.type) {
//         case "keydown":
//             switch (e.key) {
//                 case "ArrowUp":
//                     if (!canMoveUp()) {
//                         setupInput();
//                         return;
//                     }
//                     await moveUp();
//                     break;

//                 case "ArrowDown":
//                     if (!canMoveDown()) {
//                         setupInput();
//                         return;
//                     }
//                     await moveDown();
//                     break;

//                 case "ArrowLeft":
//                     if (!canMoveLeft()) {
//                         setupInput();
//                         return;
//                     }
//                     await moveLeft();
//                     break;

//                 case "ArrowRight":
//                     if (!canMoveRight()) {
//                         setupInput();
//                         return;
//                     }
//                     await moveRight();
//                     break;

//                 default:
//                     setupInput();
//                     return;
//             }
//             break;

//         case "touchstart":
//             touchStartX = e.touches[0].clientX;
//             touchStartY = e.touches[0].clientY;
//             break;

//         case "touchend":
//             const touchEndX = e.changedTouches[0].clientX;
//             const touchEndY = e.changedTouches[0].clientY;

//             deltaX = touchEndX - touchStartX;
//             deltaY = touchEndY - touchStartY;
//             break;
//     }

//     if (deltaX !== undefined && deltaY !== undefined) {
//         if (Math.abs(deltaX) > Math.abs(deltaY)) {
//             if (deltaX > 0) {
//                 // Swipe ke kanan
//                 if (!canMoveRight()) {
//                     setupInput();
//                     return;
//                 }
//                 moveRight();
//             } else {
//                 // Swipe ke kiri
//                 if (!canMoveLeft()) {
//                     setupInput();
//                     return;
//                 }
//                 moveLeft();
//             }
//         } else {
//             if (deltaY > 0) {
//                 // Swipe ke bawah
//                 if (!canMoveDown()) {
//                     setupInput();
//                     return;
//                 }
//                 moveDown();
//             } else {
//                 // Swipe ke atas
//                 if (!canMoveUp()) {
//                     setupInput();
//                     return;
//                 }
//                 moveUp();
//             }
//         }
//     }

//     grid.cells.forEach(cell => cell.mergeTiles());

//     const newTile = new Tile(gameBoard);
//     grid.randomEmptyCell().tile = newTile;

//     if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight) {
//         newTile.waitForTransition(true).then(() => {
//             let test = document.getElementById("test");
//             test.style.display = "block";
//         });
//     }

//     setupInput();
// }

// // Penanganan event sentuhan (swipe) dan keydown
// document.addEventListener("keydown", handleInput);
// document.addEventListener("touchstart", handleInput);
// document.addEventListener("touchend", handleInput);

async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()){
                setupInput()
                return 
            }
            await moveUp()
            break;

        case "ArrowDown":
            if (!canMoveDown()){
                setupInput()
                return 
            }
            await moveDown()
            break;

        case "ArrowLeft":
            if (!canMoveLeft()){
                setupInput()
                return 
            }
            await moveLeft()
            break;

        case "ArrowRight":
            if (!canMoveRight()){
                setupInput()
                return 
            }
            await moveRight()
            break;

        default:
            setupInput()
            return 
    }

    grid.cells.forEach(cell => cell.mergeTiles())
    
    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight) {
        newTile.waitForTransition(true).then(() => {
            let test = document.getElementById("test")
            test.style.display = "block"
        })
        return
    }

    setupInput()

}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    return Promise.all(
    cells.flatMap(group => {
        const promises = []
        for (let i=1; i < group.length; i++) {
            const cell = group[i]
            if (cell.tile == null) continue
            let lastValidCell
            for (let j = i - 1; j >= 0; j--) {
                const moveToCell = group[j]
                if (!moveToCell.canAccept(cell.tile)) break
                lastValidCell = moveToCell
            }

            if (lastValidCell != null) {
                promises.push(cell.tile.waitForTransition())
                if (lastValidCell.tile != null) {
                    lastValidCell.mergeTile = cell.tile
                }else {
                    lastValidCell.tile = cell.tile
                }
                cell.tile = null
            }
        }
        return promises
    }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}



function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}