import * as THREE from "three";
import { WanderGoal } from "../goals/wander-goal";
import { Agent } from "../agent/agent";
import { AssetManager, TextureAsset } from "../asset-manager";
import { Grid, GridCell } from "../grid/grid";
import { GridBuilder, GridSchema } from "../grid/grid-builder";
import { PatrolGoal } from "../goals/patrol-goal";
import { getPath } from "../grid/pathfinder";

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
      ["floor", "floor", "floor", "floor", "floor", "void", "floor", "floor"],
      ["floor", "void", "floor", "void", "floor", "floor", "floor", "void"],
      ["floor", "floor", "floor", "floor", "floor", "void", "floor", "floor"],
      ["floor", "void", "void", "void", "floor", "floor", "void", "floor"],
      ["floor", "floor", "floor", "floor", "floor", "void", "floor", "floor"],
    ];
    this.grid = this.gridBuilder.build(schema);
    this.group.add(this.grid.group);

    const topRow = this.grid.cells[0];
    const topLeft = topRow[0];
    const topRight = topRow[topRow.length - 1];

    const botRow = this.grid.cells[this.grid.cells.length - 1];
    const botLeft = botRow[0];
    const botRight = botRow[botRow.length - 1];

    // Patrol agents
    const patrolAgentBlue = this.makeAgent(TextureAsset.DummyBlue, topLeft);
    patrolAgentBlue.brain.assignGoal(
      new PatrolGoal(patrolAgentBlue, {
        routeCells: [topLeft, topRight, botRight, botLeft],
      })
    );
    this.agents.push(patrolAgentBlue);
    this.group.add(patrolAgentBlue.model);

    const patrolAgentRed = this.makeAgent(TextureAsset.DummyRed, botRight);
    patrolAgentRed.brain.assignGoal(
      new PatrolGoal(patrolAgentRed, {
        routeCells: [botRight, botLeft, topLeft, topRight],
      })
    );
    this.agents.push(patrolAgentRed);
    this.group.add(patrolAgentRed.model);

    // Wander agents
    const wanderAgentGreen = this.makeAgent(TextureAsset.DummyGreen, botLeft);
    wanderAgentGreen.brain.assignGoal(new WanderGoal(wanderAgentGreen));
    this.agents.push(wanderAgentGreen);
    this.group.add(wanderAgentGreen.model);

    const wanderAgentYellow = this.makeAgent(
      TextureAsset.DummyYellow,
      topRight
    );
    wanderAgentYellow.brain.assignGoal(new WanderGoal(wanderAgentYellow));
    this.agents.push(wanderAgentYellow);
    this.group.add(wanderAgentYellow.model);
  }

  dispose() {
    this.agents.forEach((agent) => agent.dispose());
  }

  update(dt: number) {
    this.agents.forEach((agent) => agent.update(dt));
  }

  private makeAgent(colour: TextureAsset, startingCell: GridCell) {
    const model = this.assetManager.getDummyModel(colour);
    const clips = this.assetManager.getDummyClips();

    return new Agent(this.grid, model, clips, startingCell);
  }
}
