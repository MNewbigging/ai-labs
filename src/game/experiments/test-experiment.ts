import * as THREE from "three";
import { AssetManager, TextureAsset } from "../asset-manager";
import { Grid } from "../grid/grid";
import { Agent } from "../agent/agent";
import { GridBuilder, GridSchema } from "../grid/grid-builder";
import { getPath } from "../grid/pathfinder";
import { WanderGoal } from "../goals/wander-goal";
import { PatrolGoal } from "../goals/patrol-goal";

export class TestExperiment {
  group = new THREE.Group();

  private grid: Grid;
  private agent: Agent;

  constructor(
    private gridBuilder: GridBuilder,
    private assetManager: AssetManager
  ) {
    // Grid
    const schema: GridSchema = [
      ["floor", "floor", "void", "void"],
      ["floor", "floor", "void", "void"],
      ["floor", "floor", "void", "floor"],
    ];
    this.grid = gridBuilder.build(schema);
    this.group.add(this.grid.group);

    const topLeft = this.grid.cells[0][0];
    const topRight = this.grid.cells[0][1];
    const midLeft = this.grid.cells[1][0];
    const midRight = this.grid.cells[1][1];
    const botLeft = this.grid.cells[2][0];
    const botRight = this.grid.cells[2][1];

    const farRight = this.grid.cells[2][3];
    farRight.object.position.y = 1;

    // botLeft at 0
    midLeft.object.position.y = 0.2;
    topLeft.object.position.y = 0.4;
    topRight.object.position.y = 0.6;
    midRight.object.position.y = 0.8;
    botRight.object.position.y = 1;

    // Agent
    const model = this.assetManager.getDummyModel(TextureAsset.DummyYellow);
    const clips = this.assetManager.getDummyClips();

    this.agent = new Agent(this.grid, model, clips, botLeft);
    this.group.add(this.agent.model);

    const path = getPath(botLeft, farRight, this.grid.cells);
    if (path) this.agent.followPathBehaviour.setPath(path);

    // this.agent.brain.assignGoal(
    //   new PatrolGoal(this.agent, {
    //     routeCells: [],
    //     waitTime: 1,
    //     reverse: true,
    //   })
    // );
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
