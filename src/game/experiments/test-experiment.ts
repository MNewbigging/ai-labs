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
      ["floor", "floor", "floor", "floor", "floor", "floor"],
    ];
    this.grid = gridBuilder.build(schema);

    // Raise floor pieces to make stairs (todo - work out better way to do this)
    const topRow = this.grid.cells[0];
    // 0 at 0
    topRow[1].object.position.y = 0.2;
    topRow[2].object.position.y = 0.4;
    topRow[3].object.position.y = 0.6;
    topRow[4].object.position.y = 0.4;
    topRow[5].object.position.y = 0.2;
    // 6 at 0

    this.group.add(this.grid.group);

    // Agent
    const model = this.assetManager.getDummyModel(TextureAsset.DummyYellow);
    const clips = this.assetManager.getDummyClips();

    this.agent = new Agent(this.grid, model, clips, topRow[0]);
    this.agent.brain.assignGoal(
      new PatrolGoal(this.agent, {
        routeCells: [...topRow],
        waitTime: 1,
        reverse: true,
      })
    );
    this.group.add(this.agent.model);
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
