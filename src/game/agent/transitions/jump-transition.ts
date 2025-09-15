import * as THREE from "three";
import { AnimationAsset } from "../../asset-manager";
import { CellTransition } from "./cell-transition";

export class JumpTransition extends CellTransition {
  private points: THREE.Vector3[] = [];
  private targetPoint?: THREE.Vector3;
  private direction = new THREE.Vector3();
  private moveSpeed = 3;

  override onStart(): void {
    super.onStart();

    // Create a curve to follow
    const control = this.endCell.object.position
      .clone()
      .sub(this.startCell.object.position);
    control.y = 0.8;

    const start = this.startCell.object.position;
    const end = this.endCell.object.position;
    const mid = end.clone().sub(start).multiplyScalar(0.5).add(start);
    mid.y += 0.5;

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);

    this.points = curve.getPoints(8);
    this.targetPoint = this.points.shift();

    // Walk a bit
    this.agent.playAnimation(AnimationAsset.Walk);

    // Wait to enter jump
    setTimeout(() => {
      this.agent.playAnimation(AnimationAsset.JumpStart);
    }, 75);

    // It'll automatically enter jump loop, start jump end with enough time to land
    setTimeout(() => {
      this.agent.playAnimation(AnimationAsset.JumpEnd);
    }, 700);
  }

  override update(dt: number): void {
    super.update(dt);

    if (!this.targetPoint) return;

    if (this.reachedTargetPoint()) {
      if (this.points.length === 0) {
        // done
      } else {
        this.targetPoint = this.points.shift();
      }
    } else {
      // Move towards point
      const model = this.agent.model;
      this.direction = this.targetPoint.clone().sub(model.position).normalize();
      const moveStep = this.direction
        .clone()
        .multiplyScalar(dt * this.moveSpeed);
      model.position.add(moveStep);
    }
  }

  private reachedTargetPoint() {
    const currentPos = this.agent.model.position.clone();
    if (!this.targetPoint) return false;

    return this.targetPoint.distanceTo(currentPos) < 0.01;
  }
}
