import { Agent } from "../agent/agent";
import { GridCell } from "../grid/grid";
import { Goal } from "./goal";

export class Patrol extends Goal {
  constructor(agent: Agent, private path: GridCell[]) {
    super(agent);
  }

  getDesirability(): number {
    return 1;
  }

  onStart(): void {
    this.agent.followPathBehaviour.setPath(this.path);
  }

  update(dt: number): void {
    // If the agent has reached the end of the path
    if (!this.agent.followPathBehaviour.nextCell) {
      this.agent.followPathBehaviour.setPath(this.path.reverse());
    }
  }
}
