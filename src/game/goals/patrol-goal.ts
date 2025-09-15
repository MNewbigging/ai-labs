import { Agent } from "../agent/agent";
import { GridCell } from "../grid/grid";
import { getPath } from "../grid/pathfinder";
import { Goal } from "./goal";

export class PatrolGoal extends Goal {
  private nextCellIndex = -1;

  constructor(agent: Agent, private patrolRoute: GridCell[]) {
    super(agent);
  }

  getDesirability(): number {
    return 1;
  }

  onStart(): void {}

  update(dt: number): void {
    const { followPathBehaviour } = this.agent;
    const { currentCell } = followPathBehaviour;

    if (followPathBehaviour.isPathFinished()) {
      // Get next target
      this.setNextCellIndex();
      let targetCell = this.patrolRoute[this.nextCellIndex];

      // Already there?
      if (targetCell.object.id === currentCell.object.id) {
        this.setNextCellIndex();
        targetCell = this.patrolRoute[this.nextCellIndex];
      }

      const path = getPath(currentCell, targetCell, this.agent.grid.cells);
      if (path) this.agent.followPathBehaviour.setPath(path);
    }
  }

  private setNextCellIndex() {
    this.nextCellIndex++;

    if (this.nextCellIndex >= this.patrolRoute.length) {
      this.nextCellIndex = 0;
    }
  }
}
