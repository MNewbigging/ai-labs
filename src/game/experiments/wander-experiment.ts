import * as THREE from "three";
import { WanderGoal } from "../goals/wander-goal";
import { Agent } from "../agent/agent";
import { AssetManager, TextureAsset } from "../asset-manager";
import { Grid } from "../grid/grid";
import { GridBuilder, GridSchema } from "../grid/grid-builder";
import { PatrolGoal } from "../goals/patrol-goal";

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
    const patrolAgentBlue = this.makeAgent(TextureAsset.DummyBlue);
    patrolAgentBlue.brain.assignGoal(
      new PatrolGoal(patrolAgentBlue, [topLeft, topRight, botRight, botLeft])
    );
    patrolAgentBlue.positionOnCell(topLeft);

    const patrolAgentRed = this.makeAgent(TextureAsset.DummyRed);
    patrolAgentRed.brain.assignGoal(
      new PatrolGoal(patrolAgentRed, [botRight, botLeft, topLeft, topRight])
    );
    patrolAgentRed.positionOnCell(botRight);

    // Wander agents
    const wanderAgentGreen = this.makeAgent(TextureAsset.DummyGreen);
    wanderAgentGreen.brain.assignGoal(new WanderGoal(wanderAgentGreen));
    wanderAgentGreen.positionOnCell(botLeft);

    const wanderAgentYellow = this.makeAgent(TextureAsset.DummyYellow);
    wanderAgentYellow.brain.assignGoal(new WanderGoal(wanderAgentYellow));
    wanderAgentYellow.positionOnCell(topRight);

    this.agents.push(
      patrolAgentBlue,
      patrolAgentRed,
      wanderAgentGreen,
      wanderAgentYellow
    );
    this.group.add(
      patrolAgentBlue.model,
      patrolAgentRed.model,
      wanderAgentGreen.model,
      wanderAgentYellow.model
    );
  }

  dispose() {
    this.agents.forEach((agent) => agent.dispose());
  }

  update(dt: number) {
    this.agents.forEach((agent) => agent.update(dt));
  }

  private makeAgent(colour: TextureAsset) {
    const model = this.assetManager.getDummyModel(colour);
    const clips = this.assetManager.getDummyClips();

    return new Agent(this.grid, model, clips);
  }
}
