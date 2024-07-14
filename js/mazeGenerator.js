export function generateMaze(width, height) {
  const maze = new Array(height).fill(null).map(() => new Array(width).fill(1));

  function carvePassagesFrom(cx, cy, grid) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    shuffle(directions);

    for (const [dx, dy] of directions) {
      const nx = cx + dx * 2;
      const ny = cy + dy * 2;

      if (
        ny >= 0 &&
        ny < height &&
        nx >= 0 &&
        nx < width &&
        grid[ny][nx] === 1
      ) {
        grid[cy + dy][cx + dx] = 0;
        grid[ny][nx] = 0;
        carvePassagesFrom(nx, ny, grid);
      }
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  maze[1][1] = 0;
  carvePassagesFrom(1, 1, maze);

  console.log("Generated Maze:", maze);
  return maze;
}
