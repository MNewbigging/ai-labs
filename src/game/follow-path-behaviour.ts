import * as THREE from "three";
import { Agent } from "./agent";
import { GridCell } from "./grid";

// Follows a path
export class FollowPathBehaviour {
  currentCell?: GridCell;
  nextCell?: GridCell;
  path: GridCell[] = [];

  private direction = new THREE.Vector3();

  constructor(public agent: Agent) {}

  setPath(path: GridCell[]) {
    this.path = path;
    this.nextCell = this.path.shift();
  }

  update(dt: number) {
    if (!this.currentCell || !this.nextCell) return;

    if (this.hasReachedCell(this.nextCell)) {
      this.currentCell = this.nextCell;
      this.nextCell = this.path.shift();
      // if there is now no target, we reached the end

      return;
    }

    // Keep moving towards the target cell
    const model = this.agent.model;
    const cellPosition = this.nextCell.object.position.clone();
    this.direction = cellPosition.sub(model.position).normalize();

    const moveStep = this.direction.clone().multiplyScalar(dt * 2);
    const nextPos = model.position.clone().add(moveStep);

    model.lookAt(nextPos);
    model.position.copy(nextPos);
  }

  private hasReachedCell(cell: GridCell): boolean {
    const cellPos = cell.object.position.clone();
    const currentPos = this.agent.model.position.clone();

    return cellPos.distanceTo(currentPos) < 0.01;
  }
}
