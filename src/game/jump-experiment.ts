import * as THREE from "three";
import { AssetManager } from "./asset-manager";
import { Grid } from "./grid";
import { GridBuilder, GridSchema } from "./grid-builder";
import { Agent } from "./agent";

export class JumpExperiment {
  group = new THREE.Group();

  private grid: Grid;
  private agent: Agent;

  constructor(
    private gridBuilder: GridBuilder,
    private assetManager: AssetManager
  ) {
    const schema: GridSchema = [["floor", "floor", "void", "floor", "floor"]];

    this.grid = gridBuilder.buildGrid(schema);
    this.group.add(this.grid.group);

    this.agent = new Agent(this.grid, assetManager);
    this.group.add(this.agent.model);
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
