import { Agent } from "./agent";
import { Goal } from "./goal";
import { GridCell } from "./grid";

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
