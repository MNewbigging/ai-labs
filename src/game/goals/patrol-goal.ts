import { Agent } from "../agent/agent";
import { GridCell } from "../grid/grid";
import { getPath } from "../grid/pathfinder";
import { Goal } from "./goal";

export class PatrolGoal extends Goal {
  private nextCellIndex = 0;

  constructor(agent: Agent, private patrolRoute: GridCell[]) {
    super(agent);
  }

  getDesirability(): number {
    return 1;
  }

  onStart(): void {}

  update(dt: number): void {
    if (
      this.agent.followPathBehaviour.isPathFinished() &&
      this.agent.followPathBehaviour.currentCell
    ) {
      // Get next target
      this.setNextCellIndex();
      const targetCell = this.patrolRoute[this.nextCellIndex];
      const path = getPath(
        this.agent.followPathBehaviour.currentCell,
        targetCell,
        this.agent.grid.cells
      );
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
