export class checkmaze {
  constructor(size) {
    this.size = size;
    this.grid = Array.from({ length: size }, () => Array(size).fill(0));
  }

  addWall(x, z) {
    console.log(`Adding wall at (${x}, ${z})`);
    if (x >= 0 && x < this.size && z >= 0 && z < this.size) {
      this.grid[z][x] = 1; // 벽 추가
      console.log(`Wall added at (${x}, ${z})`);
    } else {
      console.log(`Coordinates (${x}, ${z}) are out of bounds`);
    }
  }

  print() {
    console.log(this.grid.map((row) => row.join(" ")).join("\n"));
  }

  removeWall(x, z) {
    if (x >= 0 && x < this.size && z >= 0 && z < this.size) {
      this.grid[z][x] = 0; // 벽이 없다는 것을 0으로 표시
    }
  }

  print() {
    console.log(this.grid.map((row) => row.join(" ")).join("\n"));
  }

  getGrid() {
    return this.grid;
  }
}
