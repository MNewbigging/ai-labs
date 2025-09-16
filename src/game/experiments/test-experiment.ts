import * as THREE from "three";
import { AssetManager, ModelAsset } from "../asset-manager";
import { GridBuilder } from "../grid/grid-builder";

import { Agent2 } from "../agent/Agent2";

export class TestExperiment {
  group = new THREE.Group();
  agents: Agent2[] = [];

  constructor(
    private gridBuilder: GridBuilder,
    private assetManager: AssetManager
  ) {
    // New assets

    this.placeTile(new THREE.Vector3());
    this.placeTile(new THREE.Vector3(2, 0, 0));

    const barbarian = this.makeAgent(ModelAsset.SkeletonMinion);
    barbarian.playAnimation("Idle");

    const skelly = this.makeAgent(ModelAsset.SkeletonMinion);
    skelly.model.position.x = 2;
    skelly.playAnimation("Running_A");
  }

  update(dt: number) {
    this.agents.forEach((agent) => agent.update(dt));
  }

  private placeTile(pos: THREE.Vector3) {
    const tile = this.assetManager.getModel(ModelAsset.FloorTileSmall);
    tile.position.copy(pos);

    this.group.add(tile);
  }

  private makeAgent(type: ModelAsset) {
    const model = this.assetManager.getModel(type);
    const agent = new Agent2(model);

    this.group.add(agent.model);
    this.agents.push(agent);

    return agent;
  }
}
