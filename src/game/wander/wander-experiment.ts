import * as THREE from "three";
import { Agent } from "../agent";
import { AssetManager, TextureAsset } from "../asset-manager";
import { Grid } from "../grid";
import { GridBuilder, GridSchema } from "../grid-builder";
import { WanderGoal } from "./wander-goal";

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
      ["floor", "floor", "floor", "floor", "floor", "floor", "floor", "floor"],
      ["floor", "void", "void", "void", "floor", "floor", "floor", "void"],
      ["floor", "floor", "floor", "floor", "floor", "void", "floor", "floor"],
      ["floor", "void", "void", "void", "floor", "floor", "floor", "void"],
      ["floor", "floor", "floor", "floor", "floor", "floor", "floor", "floor"],
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
      this.group.add(agent.model);

      this.agents.push(agent);
    });

    // gross
    this.agents[0].positionOnCell(this.grid.cells[0][0]);
    this.agents[1].positionOnCell(this.grid.cells[0][6]);
    this.agents[2].positionOnCell(this.grid.cells[4][0]);
    this.agents[3].positionOnCell(this.grid.cells[4][6]);
  }

  dispose() {
    this.agents.forEach((agent) => agent.dispose());
  }

  update(dt: number) {
    this.agents.forEach((agent) => agent.update(dt));
  }
}
