import * as THREE from "three";
import { AssetManager, TextureAsset } from "./asset-manager";

/**
 * Used by experiments
 * Creates a grid for the experiment
 * Provides a-star pathfinding for that grid
 */

export enum GridCellType {
  Floor,
}

export interface GridCell {
  type: GridCellType;
}

export class GridManager {
  private floorMaterial: THREE.MeshLambertMaterial;
  private floorGeometry: THREE.BoxGeometry;

  constructor(private assetManager: AssetManager) {
    this.floorMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.textures.get(TextureAsset.PrototypeBlack),
    });

    this.floorGeometry = new THREE.BoxGeometry();
    this.floorGeometry.translate(0, -0.5, 0); // so top of box is at floor level
  }

  buildGrid(cells: GridCellType[], width: number) {
    const group = new THREE.Group();

    let row = 0;
    let col = 0;
    for (const cellType of cells) {
      // Create cell of given type
      const cell = this.createCellOfType(cellType);

      // Position it
      cell.position.set(col, 0, row);
      col++;
      if (col === width) {
        col = 0;
        row++;
      }

      // Add it to the group
      group.add(cell);
    }

    return group;
  }

  private createCellOfType(type: GridCellType) {
    switch (type) {
      case GridCellType.Floor:
        return new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    }
  }
}
