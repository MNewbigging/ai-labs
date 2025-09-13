import { getPath } from "../grid/pathfinder";
import { Goal } from "./goal";

export class WanderGoal extends Goal {
  private idleTimer = 0;

  getDesirability(): number {
    return 1;
  }

  update(dt: number): void {
    // Done moving, fidget
    if (!this.agent.followPathBehaviour.path.length) {
      this.idleTimer -= dt;
    }

    if (this.idleTimer < 0) {
      // Time to pick a new place to go!
      const currentCell = this.agent.followPathBehaviour.currentCell;
      if (!currentCell) return;

      const targetCell = this.agent.grid.getRandomTraversibleCell(currentCell);
      const path = getPath(currentCell, targetCell, this.agent.grid.cells);
      if (path) {
        this.agent.followPathBehaviour.setPath(path);
        this.idleTimer = 1 + Math.random() * 3;
      }
    }
  }
}
