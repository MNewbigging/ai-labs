import { Agent } from "../agent/agent";
import { GridCell } from "../grid/grid";
import { getPath } from "../grid/pathfinder";
import { Goal } from "./goal";

export class PatrolGoal extends Goal {
  private nextCellIndex = -1;
  private waitTimer = 0;

  constructor(
    agent: Agent,
    private patrolRoute: GridCell[],
    private readonly waitTime = 0
  ) {
    super(agent);

    this.waitTimer = waitTime;
  }

  getDesirability(): number {
    return 1;
  }

  onStart(): void {}

  update(dt: number): void {
    const { followPathBehaviour } = this.agent;
    const { currentCell } = followPathBehaviour;

    // Just follow the path...
    if (!followPathBehaviour.isPathFinished()) return;

    // Otherwise idle
    this.waitTimer -= dt;
    if (this.waitTimer >= 0) return;

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

    this.waitTimer = this.waitTime;
  }

  private setNextCellIndex() {
    this.nextCellIndex++;

    if (this.nextCellIndex >= this.patrolRoute.length) {
      this.nextCellIndex = 0;
    }
  }
}
