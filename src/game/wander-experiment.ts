import * as THREE from "three";
import { AssetManager } from "./asset-manager";
import { Grid, GridSchema } from "./grid";
import { Agent } from "./agent";
import { WanderGoal } from "./wander-goal";

/**
 * Wander:
 * - 10x10 grid, a few random obstacles (need to make sure all cells are reachable)
 * - 1 agent in each corner
 */

export class WanderExperiment {
  group = new THREE.Group(); // Everything this experiment creates is placed in here

  private grid: Grid;
  private agents: Agent[] = [];

  constructor(assetManager: AssetManager) {
    // Build the grid for this experiment
    const schema: GridSchema = [
      ["floor", "floor", "floor", "floor", "floor"], // non-square grids break
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
    ];
    this.grid = new Grid(schema, assetManager);
    this.group.add(this.grid.group);

    // Create the agents
    const agent = new Agent(this.grid, assetManager);
    agent.brain.assignGoal(new WanderGoal(agent));
    agent.positionOnCell(this.grid.cells[0][0]); // better way of doing this?
    this.group.add(agent.model);

    this.agents.push(agent);
  }

  dispose() {
    this.grid.dispose();
    this.agents.forEach((agent) => agent.dispose());
  }

  update(dt: number) {
    this.agents.forEach((agent) => agent.update(dt));
  }
}
