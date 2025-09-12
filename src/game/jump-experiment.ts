import * as THREE from "three";
import {
  AnimationAsset,
  AssetManager,
  ModelAsset,
  TextureAsset,
} from "./asset-manager";
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
    // Grid
    const schema: GridSchema = [["floor", "floor", "void", "floor", "floor"]];
    this.grid = gridBuilder.buildGrid(schema);
    this.group.add(this.grid.group);

    // Agent
    const model = this.assetManager.getDummyModel(TextureAsset.DummyYellow);
    const clips = this.assetManager.getDummyClips();

    this.agent = new Agent(this.grid, model, clips);

    const firstCell = this.grid.cells[0][0];
    this.agent.positionOnCell(firstCell);
    this.group.add(this.agent.model);
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
