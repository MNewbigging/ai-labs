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
    const schema: GridSchema = [["floor", "floor", "floor"]];
    this.grid = gridBuilder.build(schema);
    this.group.add(this.grid.group);

    const start = this.grid.cells[0][0];
    const mid = this.grid.cells[0][1];
    const end = this.grid.cells[0][2];

    // Agent
    const model = this.assetManager.getDummyModel(TextureAsset.DummyYellow);
    const clips = this.assetManager.getDummyClips();

    this.agent = new Agent(this.grid, model, clips, start);
    this.agent.brain.assignGoal(
      new PatrolGoal(this.agent, {
        routeCells: [start, mid, end],
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
