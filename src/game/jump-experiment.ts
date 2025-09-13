import * as THREE from "three";
import { AssetManager, TextureAsset } from "./asset-manager";
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
    this.grid = gridBuilder.build(schema);
    this.group.add(this.grid.group);

    // Agent
    const model = this.assetManager.getDummyModel(TextureAsset.DummyYellow);
    const clips = this.assetManager.getDummyClips();

    this.agent = new Agent(this.grid, model, clips);
    this.group.add(this.agent.model);

    const cellRow = this.grid.cells[0];

    const firstCell = cellRow[0];
    const lastCell = cellRow[cellRow.length - 1];

    this.agent.positionOnCell(firstCell);

    const path = this.grid.getPath(firstCell, lastCell);
    console.log("path", path);

    //if (path) this.agent.followPathBehaviour.setPath(path);
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
