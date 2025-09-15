import { Agent } from "../agent/agent";
import { GridCell } from "../grid/grid";
import { getPath } from "../grid/pathfinder";
import { Goal } from "./goal";

export interface PatrolOptions {
  routeCells: GridCell[];
  waitTime?: number; // between patrol route points
  reverse?: boolean; // otherwise will loop back to start
}

export class PatrolGoal extends Goal {
  private routeCells: GridCell[];
  private nextCellIndex = -1;
  private waitTimer = 0;

  constructor(agent: Agent, private options: PatrolOptions) {
    super(agent);

    this.routeCells = options.routeCells;
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
    let targetCell = this.routeCells[this.nextCellIndex];

    // Already there?
    if (targetCell.object.id === currentCell.object.id) {
      this.setNextCellIndex();
      targetCell = this.routeCells[this.nextCellIndex];
    }

    console.log("patrol to ", targetCell);

    const path = getPath(currentCell, targetCell, this.agent.grid.cells);
    if (path) this.agent.followPathBehaviour.setPath(path);

    this.waitTimer = this.options.waitTime ?? 0;
  }

  private setNextCellIndex() {
    this.nextCellIndex++;

    // Reached the end?
    if (this.nextCellIndex >= this.routeCells.length) {
      if (this.options.reverse) {
        this.routeCells.reverse();
      }

      this.nextCellIndex = 0;
    }
  }
}
