import * as THREE from "three";
import { GridCellType } from "./grid-builder";

export interface GridCell {
  object: THREE.Object3D; // todo might not be an object for empty cell spaces, add position prop here later
  type: GridCellType;
  rowIndex: number;
  cellIndex: number;
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
    cells.forEach((row) => row.forEach((cell) => this.group.add(cell.object)));
  }

  // Make into object if props increase
  getRandomCell(exclude?: GridCell) {
    let choice: GridCell | undefined;

    do {
      const rndRow = Math.floor(Math.random() * this.cells.length);
      const row = this.cells[rndRow];

      const rndCell = Math.floor(Math.random() * row.length);
      choice = row[rndCell];
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
          //neighbour.obstacle ||
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

    const rowCount = this.cells.length;
    const cellCount = this.cells[0].length; // all rows same width

    const rowUp = cell.rowIndex - 1;
    const rowDown = cell.rowIndex + 1;
    const cellLeft = cell.cellIndex - 1;
    const cellRight = cell.cellIndex + 1;

    if (rowUp >= 0) neighbours.push(this.cells[rowUp][cell.cellIndex]);
    if (rowDown < rowCount)
      neighbours.push(this.cells[rowDown][cell.cellIndex]);
    if (cellLeft >= 0) neighbours.push(this.cells[cell.rowIndex][cellLeft]);
    if (cellRight < cellCount)
      neighbours.push(this.cells[cell.rowIndex][cellRight]);

    return neighbours;
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
