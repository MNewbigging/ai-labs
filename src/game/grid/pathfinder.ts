import { GridCell } from "./grid";

type Direction = "left" | "right" | "up" | "down";

interface PathNode {
  cell: GridCell;
  parent?: PathNode;
  direction?: Direction;
  costFromStart: number;
  costToEnd: number;
  costTotal: number;
}

export function getPath(from: GridCell, to: GridCell, grid: GridCell[][]) {
  const openList: PathNode[] = [];
  const closedList: PathNode[] = [];

  // Create path nodes from the given cells
  const start = asPathNode(from);
  const end = asPathNode(to);

  // We begin with the start node
  openList.push(start);

  // So long as there are nodes to explore...
  while (openList.length) {
    // Take the cheapest node to consider
    openList.sort((a, b) => a.costTotal - b.costTotal);
    const currentNode = openList[0];

    // Is this the end node?
    if (gridCellsAreEqual(currentNode, end)) {
      return getPathFromEndNode(currentNode);
    }

    // Move the current node from open list to closed list
    openList.splice(0, 1);
    closedList.push(currentNode);

    // Now get the neighbours of that node
    for (const neighbour of getNeighbours(currentNode, grid)) {
      // If this node isn't traversible or already explored, ignore it
      if (
        !neighbour.cell.traversible ||
        closedList.some((node) => gridCellsAreEqual(node, neighbour))
      ) {
        continue;
      }

      // If this node is already being considered at a cheaper cost (from a different parent), skip it
      const neighbourCostFromStart = currentNode.costFromStart + 1;
      const onOpenList = openList.find((node) =>
        gridCellsAreEqual(node, neighbour)
      );
      if (onOpenList && onOpenList.costFromStart < neighbourCostFromStart) {
        continue;
      }

      // Set the costs now that we know it is going onto the open list
      setNodeCosts(neighbour, currentNode, end);
      setNodeDirection(neighbour, currentNode);
      neighbour.parent = currentNode;

      // Add the node to the open list
      openList.push(neighbour);
    }
  }

  // If we reached this point, no path could be found
  return undefined;
}

function getNeighbours(node: PathNode, grid: GridCell[][]): PathNode[] {
  const neighbours: GridCell[] = [];

  const upper = getUpperNeighbour(node, grid);
  if (upper) neighbours.push(upper);

  const lower = getLowerNeighbour(node, grid);
  if (lower) neighbours.push(lower);

  const left = getLeftNeighbour(node, grid);
  if (left) neighbours.push(left);

  const right = getRightNeighbour(node, grid);
  if (right) neighbours.push(right);

  return neighbours.map((gridCell) => asPathNode(gridCell));
}

function getUpperNeighbour(node: PathNode, grid: GridCell[][]) {
  const upIndex = node.cell.rowIndex - 1;

  if (upIndex < 0) return undefined;

  const upCell = grid[upIndex][node.cell.cellIndex];

  return isValidNeighbour(node, upCell) ? upCell : undefined;
}

function getLowerNeighbour(node: PathNode, grid: GridCell[][]) {
  const downIndex = node.cell.rowIndex + 1;

  if (downIndex >= grid.length) return undefined;

  const downCell = grid[downIndex][node.cell.cellIndex];

  return isValidNeighbour(node, downCell) ? downCell : undefined;
}

function getLeftNeighbour(node: PathNode, grid: GridCell[][]) {
  const leftIndex = node.cell.cellIndex - 1;

  if (leftIndex < 0) return undefined;

  const leftCell = grid[node.cell.rowIndex][leftIndex];

  return isValidNeighbour(node, leftCell) ? leftCell : undefined;
}

function getRightNeighbour(node: PathNode, grid: GridCell[][]) {
  const rightIndex = node.cell.cellIndex + 1;

  if (rightIndex >= grid[0].length) return undefined;

  const rightCell = grid[node.cell.rowIndex][rightIndex];

  return isValidNeighbour(node, rightCell) ? rightCell : undefined;
}

function setNodeCosts(neighbour: PathNode, previous: PathNode, end: PathNode) {
  neighbour.costFromStart = previous.costFromStart + 1;
  neighbour.costToEnd = neighbour.cell.object.position.distanceToSquared(
    end.cell.object.position
  );
  neighbour.costTotal = neighbour.costFromStart + neighbour.costToEnd;
}

function setNodeDirection(neighbour: PathNode, previous: PathNode) {
  neighbour.direction = getDirection(previous.cell, neighbour.cell);
}

function isValidNeighbour(node: PathNode, neighbour: GridCell) {
  if (neighbour.type === "void") {
    // Cannot follow another void
    if (node.cell.type === "void") return false;
  }

  if (neighbour.type === "floor") {
    // If this floor follows a void
    if (node.cell.type === "void") {
      // It must match the same direction as the void
      return node.direction === getDirection(node.cell, neighbour);
    }

    // This floor must be no more than .2 difference in height from previous
    const difference =
      Math.abs(neighbour.object.position.y) -
      Math.abs(node.cell.object.position.y);
    const isOk = Math.abs(difference) <= 0.21; // extra 0.01 for epsilon
    console.log("isOk", difference, isOk);

    return isOk;
  }

  return true;
}

function getDirection(from: GridCell, to: GridCell): Direction {
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
}

function getPathFromEndNode(endNode: PathNode) {
  let current = endNode;
  const route: PathNode[] = [];

  while (current.parent) {
    route.push(current);
    current = current.parent;
  }

  // Start won't have a parent so it won't get included in while loop
  route.push(current);

  route.reverse();

  return route.map((node) => node.cell);
}

function asPathNode(cell: GridCell): PathNode {
  return {
    cell,
    costFromStart: 0,
    costToEnd: 0,
    costTotal: 0,
    parent: undefined,
  };
}

function gridCellsAreEqual(a: PathNode, b: PathNode) {
  return a.cell.object.id === b.cell.object.id;
}
