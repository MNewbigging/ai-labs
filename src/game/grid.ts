import * as THREE from "three";
import { AssetManager, TextureAsset } from "./asset-manager";

export type GridCellType = "floor";

export type GridSchema = GridCellType[][];

export interface GridCell {
  object: THREE.Object3D;
  type: GridCellType;
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
  cells: GridCell[][];

  // If this class is recreated, these should be elsewhere (asset mgr maybe? too high level...)
  // Different grids will require differnet geoms/mats, so should they all live here or be given?
  private floorMaterial: THREE.MeshLambertMaterial;
  private floorGeometry: THREE.BoxGeometry;

  constructor(public schema: GridSchema, private assetManager: AssetManager) {
    // Setup stuff used to render grid in the scene
    this.floorMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.textures.get(TextureAsset.PrototypeBlack),
    });

    this.floorGeometry = new THREE.BoxGeometry();
    this.floorGeometry.translate(0, -0.5, 0); // so top of box is at floor level

    // Create the grid cells according to given schema
    this.cells = this.buildGridCells(schema);
    // Add all cells into the group to easily add/remove
    this.cells.forEach((row) =>
      row.forEach((cell) => this.group.add(cell.object))
    );
  }

  dispose() {
    this.floorMaterial.dispose();
    this.floorGeometry.dispose();
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
      for (const neighbour of this.getNeighboursOf(currentNode)) {
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

  // todo - out of bounds checks here...
  getNeighboursOf(pathNode: PathNode) {
    const grid = this.cells;

    // Todo this needs foolproofing - breaks if I stop using unit sizes
    const row = pathNode.object.position.z;
    const col = pathNode.object.position.x;

    let above, below, left, right;

    if (row > 0) {
      above = grid[row - 1][col];
    }
    if (row < grid.length - 1) {
      below = grid[row + 1][col];
    }

    if (col > 0) {
      left = grid[row][col - 1];
    }
    if (col < grid[0].length - 1) {
      right = grid[row][col + 1];
    }

    const neighbourCells = [above, below, left, right].filter(
      (cell) => cell !== undefined
    );

    return neighbourCells.map((cell) => ({
      ...cell,
      costFromStart: 0,
      costToEnd: 0,
      costTotal: 0,
    })) as PathNode[];
  }

  private calculateCosts(current: PathNode, previous: PathNode, end: PathNode) {
    current.costFromStart = previous.costFromStart + 1;
    current.costToEnd = current.object.position.distanceToSquared(
      end.object.position
    );
    current.costTotal = current.costFromStart + current.costToEnd;
  }

  private buildGridCells(schema: GridSchema) {
    const gridCells: GridCell[][] = [];

    for (let rowIndex = 0; rowIndex < schema.length; rowIndex++) {
      // Schema types for this row
      const rowTypes = schema[rowIndex];
      // Completed cells for this row
      const cellRow: GridCell[] = [];

      for (let cellIndex = 0; cellIndex < rowTypes.length; cellIndex++) {
        // Schema for this cell
        const type = rowTypes[cellIndex];
        // Completed cell
        const object = this.createCellOfType(type);
        object.position.set(rowIndex, 0, cellIndex);
        cellRow.push({ type, object });
      }

      // Now that the row is finished, add it to grid cells
      gridCells.push(cellRow);
    }

    return gridCells;
  }

  private createCellOfType(type: GridCellType) {
    switch (type) {
      case "floor":
        return new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    }
  }
}

function gridCellsAreEqual(a: GridCell, b: GridCell) {
  return a.object.position.equals(b.object.position);
}
