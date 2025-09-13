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

  isFinished() {
    const cellPos = this.endCell.object.position.clone();
    const currentPos = this.agent.model.position.clone();

    return cellPos.distanceTo(currentPos) < 0.01;
  }
}

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

export class JumpTransition extends CellTransition {
  private direction = new THREE.Vector3();
  private moveSpeed = 1.8;

  override onStart(): void {
    super.onStart();

    this.agent.playAnimation(AnimationAsset.JumpStart);
    setTimeout(() => {
      this.agent.playAnimation(AnimationAsset.JumpEnd2);
    }, 900);
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
