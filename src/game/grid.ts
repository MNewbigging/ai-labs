import * as THREE from "three";
import { GridCellType } from "./grid-builder";

export interface GridCell {
  object: THREE.Object3D;
  type: GridCellType;
  rowIndex: number;
  cellIndex: number;
  traversible: boolean;
}

type Direction = "left" | "right" | "up" | "down";

// Used in a-star pathfinding only
// Maybe this should not extend but have a prop for the cell...
interface PathNode extends GridCell {
  parent?: PathNode;
  direction?: Direction;
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
        // If this node isn't traversible or already explored, ignore it
        if (
          !neighbour.traversible ||
          closedList.some((node) => gridCellsAreEqual(node, neighbour))
        ) {
          continue;
        }

        // Calculate costs - don't set any values on the object at this point
        this.calculateCosts(neighbour, currentNode, end);
        neighbour.parent = currentNode;

        // If this node is already being considered at a cheaper cost (from a different parent), skip it
        // todo - is this broken? won't setting costs and parent affect the node in the array, tehrefore it'll always be the same values
        // i.e using what was just set
        const onOpenList = openList.find((node) =>
          gridCellsAreEqual(node, neighbour)
        );
        if (onOpenList && onOpenList.costFromStart < neighbour.costFromStart) {
          // log here to check...
          continue;
        }

        // Set the costs now that we know it is going onto the open list

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

  // I think voids should still be part of the path if they are being jumped over
  // Might need to rethink the 'traversible' property on grid cells...
  // Void can be a neighbour if:
  // Previous was not also a void (can't jump over more than 1 space)
  // Floor can be a neighbour if:
  // It's in a straight line from previous 2 cells

  getUp(cell: GridCell) {
    const oneRowUp = cell.rowIndex - 1;

    if (oneRowUp < 0) return undefined; // ignore out of bounds

    const oneUpCell = this.cells[oneRowUp][cell.cellIndex];

    if (oneUpCell.type === "floor") {
      // If the previous was a void, make sure the direction is the same
    }
  }

  getUpperNeighbour(cell: GridCell) {
    const oneRowUp = cell.rowIndex - 1;

    // Already at the top of the grid
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

  private calculateCosts(
    neighbour: PathNode,
    previous: PathNode,
    end: PathNode
  ) {
    neighbour.costFromStart = previous.costFromStart + 1;
    neighbour.costToEnd = neighbour.object.position.distanceToSquared(
      end.object.position
    );
    neighbour.costTotal = neighbour.costFromStart + neighbour.costToEnd;
  }

  private getDirection(from: GridCell, to: GridCell): Direction {
    // Since this is a grid, directions should always be unit vectors
    // Also, we traverse grid from top-down perspective so we only move in x or z directions
    const direction = to.object.position
      .clone()
      .sub(from.object.position)
      .normalize();

    if (Math.abs(direction.x) > Math.abs(direction.z)) {
      // Moving left or right
      return direction.x < 0 ? "left" : "right";
    } else {
      // Moving up or down
      return direction.z < 0 ? "up" : "down";
    }

    // Is the above the same as:
    // It might be except it has to include undefined as a potential return value...

    // if (direction.x < 0) return "left";
    // if (direction.x > 0) return "right";
    // if (direction.z < 0) return "up";
    // if (direction.z > 0) return "down";

    // return undefined;
  }
}

function gridCellsAreEqual(a: GridCell, b: GridCell) {
  return a.object.id === b.object.id;
}
