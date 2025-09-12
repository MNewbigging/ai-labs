import * as THREE from "three";
import { Agent } from "./agent";
import { GridCell } from "./grid";
import { AnimationAsset } from "./asset-manager";

// Follows a path
export class FollowPathBehaviour {
  currentCell?: GridCell;
  nextCell?: GridCell;
  path: GridCell[] = [];

  private moveSpeed = 1.5;
  private turnSpeed = 8;

  private direction = new THREE.Vector3();
  private rotationMatrix = new THREE.Matrix4();
  private targetQuaternion = new THREE.Quaternion();

  constructor(public agent: Agent) {}

  setPath(path: GridCell[]) {
    if (!path.length) return;

    this.path = path;
    this.nextCell = this.path.shift();

    if (this.nextCell) {
      const nextPos = this.nextCell.object.position;
      const model = this.agent.model;
      this.rotationMatrix.lookAt(nextPos, model.position, model.up);
      this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
    }

    this.agent.playAnimation(AnimationAsset.Walk);
  }

  update(dt: number) {
    if (!this.currentCell || !this.nextCell) return;

    if (this.hasReachedCell(this.nextCell)) {
      this.currentCell = this.nextCell;
      this.nextCell = this.path.shift();
      if (!this.nextCell) this.agent.playAnimation(AnimationAsset.Idle);
      else {
        const nextPos = this.nextCell.object.position;
        const model = this.agent.model;
        this.rotationMatrix.lookAt(nextPos, model.position, model.up);
        this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
      }

      return;
    }

    // Keep moving towards the target cell
    const model = this.agent.model;
    const cellPosition = this.nextCell.object.position.clone();
    this.direction = cellPosition.sub(model.position).normalize();

    const moveStep = this.direction.clone().multiplyScalar(dt * this.moveSpeed);
    const nextPos = model.position.clone().add(moveStep);
    model.position.copy(nextPos);

    model.quaternion.rotateTowards(this.targetQuaternion, dt * this.turnSpeed);

    // model.lookAt(nextPos);
  }

  private hasReachedCell(cell: GridCell): boolean {
    const cellPos = cell.object.position.clone();
    const currentPos = this.agent.model.position.clone();

    return cellPos.distanceTo(currentPos) < 0.01;
  }
}
