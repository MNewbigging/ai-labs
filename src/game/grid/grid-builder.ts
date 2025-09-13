import * as THREE from "three";
import { AssetManager, TextureAsset } from "../asset-manager";
import { Grid, GridCell } from "./grid";

export type GridCellType = "floor" | "void";

export type GridSchema = GridCellType[][];

export class GridBuilder {
  private floorMaterial: THREE.MeshLambertMaterial;
  private floorGeometry: THREE.BoxGeometry;

  constructor(private assetManager: AssetManager) {
    this.floorMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.textures.get(TextureAsset.PrototypeBlack),
    });

    this.floorGeometry = new THREE.BoxGeometry();
    this.floorGeometry.translate(0, -0.5, 0); // so top of box is at floor level
  }

  build(schema: GridSchema) {
    // Ensure rows are all same length
    const length = schema[0].length;
    const ok = schema.every((row) => row.length === length);
    if (!ok) throw new Error("Not all rows are the same length!");

    return new Grid(this.buildGridCells(schema));
  }

  private buildGridCells(schema: GridSchema) {
    const gridCells: GridCell[][] = [];

    for (let rowIndex = 0; rowIndex < schema.length; rowIndex++) {
      const rowTypes = schema[rowIndex];
      const cellRow: GridCell[] = [];

      for (let cellIndex = 0; cellIndex < rowTypes.length; cellIndex++) {
        const type = rowTypes[cellIndex];

        const object = this.createCellObject(type);
        object.position.set(cellIndex, 0, rowIndex);

        const traversible = this.getTraversible(type);

        cellRow.push({ type, object, rowIndex, cellIndex, traversible });
      }

      // Now that the row is finished, add it to grid cells
      gridCells.push(cellRow);
    }

    return gridCells;
  }

  private createCellObject(type: GridCellType) {
    switch (type) {
      case "floor":
        return new THREE.Mesh(this.floorGeometry, this.floorMaterial);
      case "void":
        return new THREE.Object3D();
    }
  }

  private getTraversible(type: GridCellType) {
    switch (type) {
      case "floor":
      case "void":
        return true;
    }
  }
}
