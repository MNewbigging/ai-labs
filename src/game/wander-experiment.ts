import * as THREE from "three";
import { AssetManager } from "./asset-manager";
import { GridCellType, GridManager } from "./grid-manager";

/**
 * Wander:
 * - 10x10 grid, a few random obstacles (need to make sure all cells are reachable)
 * - 1 agent in each corner
 */

export class WanderExperiment {
  private group = new THREE.Group(); // Everything this experiment creates is placed in here
  private gridManager: GridManager;

  constructor(private scene: THREE.Scene, private assetManager: AssetManager) {
    this.gridManager = new GridManager(assetManager);

    this.scene.add(this.group);
  }

  buildScene() {
    // Grid schema
    const gridSchema: GridCellType[] = [];
    for (let i = 0; i < 100; i++) {
      gridSchema.push(GridCellType.Floor);
    }
    const grid = this.gridManager.buildGrid(gridSchema, 10);
    this.group.add(grid);

    // Agents

    // todo - sort out the agent class, use that here instead of animated-object
  }

  dispose() {
    // Cleanup everything
  }
}
