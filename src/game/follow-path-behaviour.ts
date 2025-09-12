import * as THREE from "three";
import { Agent } from "./agent";
import { GridCell } from "./grid";
import { AnimationAsset } from "./asset-manager";

// Follows a path
export class FollowPathBehaviour {
  currentCell?: GridCell;
  nextCell?: GridCell;
  path: GridCell[] = [];

  private moveSpeed = 1.8;
  private turnSpeed = 8;

  private direction = new THREE.Vector3();
  private rotationMatrix = new THREE.Matrix4();
  private targetQuaternion = new THREE.Quaternion();

  constructor(public agent: Agent) {}

  setPath(path: GridCell[]) {
    if (!path.length) return;

    this.path = path;
    this.setNextCell();

    this.agent.playAnimation(AnimationAsset.Walk);
  }

  update(dt: number) {
    if (!this.currentCell || !this.nextCell) return;

    if (this.hasReachedCell(this.nextCell)) {
      this.currentCell = this.nextCell;
      this.setNextCell();
      if (!this.nextCell) this.agent.playAnimation(AnimationAsset.Idle);

      return;
    }

    // Keep moving towards the target cell
    const model = this.agent.model;
    const cellPosition = this.nextCell.object.position.clone();
    this.direction = cellPosition.sub(model.position).normalize();

    const moveStep = this.direction.clone().multiplyScalar(dt * this.moveSpeed);
    model.position.add(moveStep);

    model.quaternion.rotateTowards(this.targetQuaternion, dt * this.turnSpeed);
  }

  private hasReachedCell(cell: GridCell): boolean {
    const cellPos = cell.object.position.clone();
    const currentPos = this.agent.model.position.clone();

    return cellPos.distanceTo(currentPos) < 0.01;
  }

  private setNextCell() {
    this.nextCell = this.path.shift();

    if (!this.nextCell) return;

    // Update target rotation on new target
    const nextPos = this.nextCell.object.position;
    const model = this.agent.model;
    this.rotationMatrix.lookAt(nextPos, model.position, model.up);
    this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
  }
}
