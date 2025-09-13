import { Agent } from "./agent";
import { AnimationAsset } from "../asset-manager";
import { GridCell } from "../grid/grid";
import {
  CellTransition,
  JumpTransition,
  WalkTransition,
} from "./cell-transitions";

// A path is an array of grid cells which are all neighbouring
export class FollowPathBehaviour {
  currentCell?: GridCell;
  path: GridCell[] = [];

  private currentTransition?: CellTransition;

  private startTimer = 0;

  constructor(public agent: Agent) {}

  setPath(path: GridCell[]) {
    if (!path.length) return;

    this.path = [...path];

    // Position at the start of the path
    const start = this.path.shift();
    if (!start) return;

    this.agent.positionOnCell(start);

    this.setNextTransition();
  }

  update(dt: number) {
    if (!this.currentTransition) return;

    this.currentTransition.update(dt);

    if (this.currentTransition.isFinished()) {
      this.currentCell = this.currentTransition.endCell;

      if (this.isPathFinished()) {
        this.onFinishPath();
      } else {
        this.setNextTransition();
      }
    }
  }

  private setNextTransition() {
    // if (this.startTimer) {
    //   const took = performance.now() - this.startTimer;
    //   console.log("last transition took", took);
    // }

    // this.startTimer = performance.now();

    // Start is always current cell
    const start = this.currentCell;
    if (!start) {
      console.error(
        "Must have a current cell before starting a new transition"
      );
      return;
    }

    // End is next cell in the path
    const end = this.path.shift();
    if (!end) return;

    if (end.type === "floor") {
      console.log("starting walk");
      this.currentTransition = new WalkTransition(this.agent, start, end);
      this.currentTransition.onStart();
    }

    if (end.type === "void") {
      // We don't actuall end on the void, but the next cell in the parth
      const actualEnd = this.path.shift();
      if (!actualEnd) return; // should never happen...

      console.log("starting jump");
      this.currentTransition = new JumpTransition(this.agent, start, actualEnd);
      this.currentTransition.onStart();
    }
  }

  private isPathFinished() {
    return this.path.length === 0;
  }

  private onFinishPath() {
    this.currentTransition = undefined;
    this.agent.playAnimation(AnimationAsset.Idle);
  }
}
