import * as THREE from "three";
import { GridCellType } from "./grid-builder";

export interface GridCell {
  object: THREE.Object3D;
  type: GridCellType;
  rowIndex: number;
  cellIndex: number;
  traversible: boolean;
}

export class Grid {
  group = new THREE.Group();

  constructor(public cells: GridCell[][]) {
    // For easily adding/removing to/from scene
    cells.forEach((row) =>
      row.forEach((cell) => {
        if (cell.object) this.group.add(cell.object);
      })
    );
  }

  // Make into object if props increase
  getRandomTraversibleCell(exclude?: GridCell) {
    let choice: GridCell | undefined;

    do {
      const rndRow = Math.floor(Math.random() * this.cells.length);
      const row = this.cells[rndRow];

      const rndCell = Math.floor(Math.random() * row.length);
      const cell = row[rndCell];

      if (cell.traversible) choice = cell;
    } while (!choice || choice === exclude);

    return choice;
  }
}
