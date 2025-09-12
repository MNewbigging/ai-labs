import * as THREE from "three";
import { GridCellType } from "./grid-builder";

export interface GridCell {
  object: THREE.Object3D;
  type: GridCellType;
  rowIndex: number;
  cellIndex: number;
  traversible: boolean;
}

// Used in a-star pathfinding only
interface PathNode extends GridCell {
  parent?: PathNode;
  costFromStart: number;
  costToEnd: number;
  costTotal: number;
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

  getPath(fromCell: GridCell, toCell: GridCell) {
    const openList: PathNode[] = [];
    const closedList: PathNode[] = [];

    // Create path nodes from the given cells
    const start: PathNode = {
      ...fromCell,
      parent: undefined,
      costFromStart: 0,
      costToEnd: 0,
      costTotal: 0,
    };
    const end: PathNode = {
      ...toCell,
      parent: undefined,
      costFromStart: 0,
      costToEnd: 0,
      costTotal: 0,
    };

    // We begin with the start node
    openList.push(start);

    // So long as there are nodes to explore...
    while (openList.length) {
      // Sort the open list so that the cheapest node is first
      openList.sort((a, b) => a.costTotal - b.costTotal);

      const currentNode = openList[0];

      // Is this the end node?
      if (gridCellsAreEqual(currentNode, end)) {
        // Backtrack closed list
        let current = currentNode;
        const route: PathNode[] = [];

        while (current.parent) {
          route.push(current);
          current = current.parent;
        }

        route.reverse();

        return route as GridCell[];
      }

      // Move the current node from open list to closed list
      openList.splice(0, 1);
      closedList.push(currentNode);

      // Now get the neighbours of that node
      const neighbours = this.getNeighbours(currentNode).map((gridCell) =>
        this.asPathNode(gridCell)
      );
      for (const neighbour of neighbours) {
        // If this node is an obstacle or already explored, ignore it
        if (
          !neighbour.traversible ||
          closedList.some((node) => gridCellsAreEqual(node, neighbour))
        ) {
          continue;
        }

        // Set costs
        this.calculateCosts(neighbour, currentNode, end);
        neighbour.parent = currentNode;

        // If this node is already being considered at a cheaper cost (from a different parent), skip it
        const onOpenList = openList.find((node) =>
          gridCellsAreEqual(node, neighbour)
        );
        if (onOpenList && onOpenList.costFromStart < neighbour.costFromStart) {
          continue;
        }

        // Add the node to the open list
        openList.push(neighbour);
      }
    }

    // If we reached this point, no path could be found
    return undefined;
  }

  getNeighbours(cell: GridCell) {
    const neighbours: GridCell[] = [];

    const upper = this.getUpperNeighbour(cell);
    if (upper) neighbours.push(upper);

    const lower = this.getLowerNeighbour(cell);
    if (lower) neighbours.push(lower);

    const left = this.getLeftNeighbour(cell);
    if (left) neighbours.push(left);

    const right = this.getRightNeighbour(cell);
    if (right) neighbours.push(right);

    return neighbours;
  }

  getUpperNeighbour(cell: GridCell) {
    const oneRowUp = cell.rowIndex - 1;

    if (oneRowUp < 0) return undefined;

    const oneUpCell = this.cells[oneRowUp][cell.cellIndex];

    // If there is something there, return it
    if (oneUpCell.type !== "void") return oneUpCell;

    // Otherwise, check one step further since a gap of 1 is jumpable
    const twoRowsUp = cell.rowIndex - 2;

    if (twoRowsUp < 0) return undefined;

    return this.cells[twoRowsUp][cell.cellIndex];
  }

  getLowerNeighbour(cell: GridCell) {
    const oneRowDown = cell.rowIndex + 1;

    if (oneRowDown >= this.cells.length) return undefined;

    const oneDownCell = this.cells[oneRowDown][cell.cellIndex];

    // If there is something there, return it
    if (oneDownCell.type !== "void") return oneDownCell;

    // Otherwise, check one step further since a gap of 1 is jumpable
    const twoRowsDown = cell.rowIndex + 2;

    if (twoRowsDown >= this.cells.length) return undefined;

    return this.cells[twoRowsDown][cell.cellIndex];
  }

  getLeftNeighbour(cell: GridCell) {
    const oneCellLeft = cell.cellIndex - 1;

    if (oneCellLeft < 0) return undefined;

    const oneLeftCell = this.cells[cell.rowIndex][oneCellLeft];

    if (oneLeftCell.type !== "void") return oneLeftCell;

    const twoCellsLeft = cell.cellIndex - 2;

    if (twoCellsLeft < 0) return undefined;

    return this.cells[cell.rowIndex][twoCellsLeft];
  }

  getRightNeighbour(cell: GridCell) {
    const oneCellRight = cell.cellIndex + 1;

    if (oneCellRight >= this.cells[0].length) return undefined;

    const oneRightCell = this.cells[cell.rowIndex][oneCellRight];

    if (oneRightCell.type !== "void") return oneRightCell;

    const twoCellsRight = cell.cellIndex + 2;

    if (twoCellsRight >= this.cells[0].length) return undefined;

    return this.cells[cell.rowIndex][twoCellsRight];
  }

  private asPathNode(cell: GridCell): PathNode {
    return {
      ...cell,
      costFromStart: 0,
      costToEnd: 0,
      costTotal: 0,
      parent: undefined,
    };
  }

  private calculateCosts(current: PathNode, previous: PathNode, end: PathNode) {
    current.costFromStart = previous.costFromStart + 1;
    current.costToEnd = current.object.position.distanceToSquared(
      end.object.position
    );
    current.costTotal = current.costFromStart + current.costToEnd;
  }
}

function gridCellsAreEqual(a: GridCell, b: GridCell) {
  return a.object.position.equals(b.object.position);
}
