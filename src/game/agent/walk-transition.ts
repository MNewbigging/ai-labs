import * as THREE from "three";
import { CellTransition } from "./cell-transition";
import { AnimationAsset } from "../asset-manager";

export class WalkTransition extends CellTransition {
  private direction = new THREE.Vector3();
  private moveSpeed = 1.8;

  override onStart(): void {
    super.onStart();

    this.agent.playAnimation(AnimationAsset.Walk);
  }

  override update(dt: number): void {
    super.update(dt);

    const model = this.agent.model;
    const cellPosition = this.endCell.object.position.clone();
    this.direction = cellPosition.sub(model.position).normalize();

    const moveStep = this.direction.clone().multiplyScalar(dt * this.moveSpeed);
    model.position.add(moveStep);
  }
}
