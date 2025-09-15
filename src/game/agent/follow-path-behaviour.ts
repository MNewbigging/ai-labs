import { Agent } from "./agent";
import { AnimationAsset } from "../asset-manager";
import { GridCell } from "../grid/grid";
import { CellTransition } from "./cell-transition";
import { WalkTransition } from "./walk-transition";
import { JumpTransition } from "./jump-transition";

// A path is an array of grid cells which are all neighbouring
export class FollowPathBehaviour {
  currentCell: GridCell;
  path: GridCell[] = [];

  private currentTransition?: CellTransition;

  constructor(public agent: Agent, startingCell: GridCell) {
    this.currentCell = startingCell;
  }

  setPath(path: GridCell[]) {
    if (!path.length) return;

    this.path = [...path];

    // Position at the start of the path
    const start = this.path.shift();
    if (!start) return;

    // Todo - this might be causing visual jitter
    this.agent.positionOnCell(start);

    this.setNextTransition();
  }

  update(dt: number) {
    if (!this.currentTransition) return;

    this.currentTransition.update(dt);

    if (this.currentTransition.atEndPoint()) {
      this.currentCell = this.currentTransition.endCell;
      this.setNextTransition();
    }
  }

  isPathFinished() {
    return this.path.length === 0 && !this.currentTransition;
  }

  private setNextTransition() {
    // Start is always current cell
    const start = this.currentCell;

    // End is next cell in the path
    const end = this.path.shift();
    if (!end) {
      // If there are no more cells in the path, the path is done
      this.onFinishPath();
      return;
    }

    if (end.type === "floor") {
      this.currentTransition = new WalkTransition(this.agent, start, end);
      this.currentTransition.onStart();
    }

    if (end.type === "void") {
      // We don't actually end on the void, but the next cell in the path
      const actualEnd = this.path.shift();
      if (!actualEnd) return; // should never happen...

      this.currentTransition = new JumpTransition(this.agent, start, actualEnd);
      this.currentTransition.onStart();
    }
  }

  private onFinishPath() {
    this.currentTransition = undefined;
    this.agent.playAnimation(AnimationAsset.Idle);
  }
}
