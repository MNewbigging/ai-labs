import * as THREE from "three";
import { GridCell } from "../grid/grid";
import { Agent } from "./agent";
import { AnimationAsset } from "../asset-manager";

export abstract class CellTransition {
  // Turning handled at base level - same for all transitions
  private turnSpeed = 7.2;
  private rotationMatrix = new THREE.Matrix4();
  private targetQuaternion = new THREE.Quaternion();

  constructor(
    public agent: Agent,
    public startCell: GridCell,
    public endCell: GridCell
  ) {}

  onStart(): void {
    const nextPos = this.endCell.object.position;
    const model = this.agent.model;
    this.rotationMatrix.lookAt(nextPos, model.position, model.up);
    this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
  }

  update(dt: number): void {
    this.agent.model.quaternion.rotateTowards(
      this.targetQuaternion,
      dt * this.turnSpeed
    );
  }

  atEndPoint() {
    const cellPos = this.endCell.object.position.clone();
    const currentPos = this.agent.model.position.clone();

    return cellPos.distanceTo(currentPos) < 0.01;
  }
}
