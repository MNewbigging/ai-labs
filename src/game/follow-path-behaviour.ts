import * as THREE from "three";
import { Agent } from "./agent";
import { GridCell } from "./grid";
import { AnimationAsset } from "./asset-manager";

// A path is an array of grid cells which are all neighbouring
export class FollowPathBehaviour {
  currentCell?: GridCell;
  nextCell?: GridCell;
  path: GridCell[] = [];

  private moveSpeed = 1.8;
  private turnSpeed = 7.2;

  private direction = new THREE.Vector3();
  private rotationMatrix = new THREE.Matrix4();
  private targetQuaternion = new THREE.Quaternion();

  constructor(public agent: Agent) {}

  setPath(path: GridCell[]) {
    if (!path.length) return;

    this.path = [...path];
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

    // Turn to face next cell
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

    // If the next cell is more than 1 unit away, start jumping
    // Should really read: if a void separates this and next cell, start jumping
    // Could be done if the void was part of the path

    /**
     * How should this class determine which method/animation to use to get to the next cell?
     *
     * - Always moving from one cell to the next; i.e a cell 'transition'
     * - Each transition falls under one method of travel; walk, jump, climb etc
     * - Each method has a set distance; usually 1 cell, but jump does 2 cells
     * - Agent decides transition based on the next cell type?
     * -- For jump: next cell is void, get cell after that to know where to jump towards.
     *
     * - Should a transition be a typed property of the class? So we just update the current transition?
     * -- Then I could write transitions in isolation that take the start/end/path?
     */
  }
}
