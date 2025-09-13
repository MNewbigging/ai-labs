import * as THREE from "three";
import { AssetManager, TextureAsset } from "../asset-manager";
import { Grid } from "../grid/grid";
import { Agent } from "../agent/agent";
import { GridBuilder, GridSchema } from "../grid/grid-builder";
import { getPath } from "../grid/pathfinder";
import { WanderGoal } from "../goals/wander-goal";

export class JumpExperiment {
  group = new THREE.Group();

  private grid: Grid;
  private agent: Agent;

  constructor(
    private gridBuilder: GridBuilder,
    private assetManager: AssetManager
  ) {
    // Grid
    const schema: GridSchema = [
      ["floor", "floor", "void", "floor", "floor"],
      ["floor", "floor", "void", "floor", "void"],
      ["void", "floor", "floor", "void", "floor"],
      ["floor", "floor", "void", "floor", "floor"],
    ];
    this.grid = gridBuilder.build(schema);
    this.group.add(this.grid.group);

    // Agent
    const model = this.assetManager.getDummyModel(TextureAsset.DummyYellow);
    const clips = this.assetManager.getDummyClips();

    this.agent = new Agent(this.grid, model, clips);
    this.agent.brain.assignGoal(new WanderGoal(this.agent));
    this.group.add(this.agent.model);

    const start = this.grid.cells[0][0];
    const end = this.grid.cells[3][4];

    const path = getPath(start, end, this.grid.cells);
    if (path) this.agent.followPathBehaviour.setPath(path);
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
