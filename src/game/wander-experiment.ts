import * as THREE from "three";
import { AssetManager, TextureAsset } from "./asset-manager";
import { Grid } from "./grid";
import { Agent } from "./agent";
import { WanderGoal } from "./wander-goal";
import { GridBuilder, GridSchema } from "./grid-builder";

export class WanderExperiment {
  group = new THREE.Group(); // Everything this experiment creates is placed in here

  private grid: Grid;
  private agents: Agent[] = [];

  constructor(
    private gridBuilder: GridBuilder,
    private assetManager: AssetManager
  ) {
    // Build the grid for this experiment
    const schema: GridSchema = [
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
      ["floor", "floor", "floor", "floor", "floor"],
    ];
    this.grid = this.gridBuilder.buildGrid(schema);
    this.group.add(this.grid.group);

    // Create the agents
    [
      TextureAsset.DummyBlue,
      TextureAsset.DummyGreen,
      TextureAsset.DummyYellow,
      TextureAsset.DummyRed,
    ].forEach((colour) => {
      const agent = new Agent(this.grid, assetManager, colour);
      agent.brain.assignGoal(new WanderGoal(agent));
      agent.positionOnCell(this.grid.cells[0][0]); // better way of doing this?
      this.group.add(agent.model);

      this.agents.push(agent);
    });
  }

  dispose() {
    this.agents.forEach((agent) => agent.dispose());
  }

  update(dt: number) {
    this.agents.forEach((agent) => agent.update(dt));
  }
}
