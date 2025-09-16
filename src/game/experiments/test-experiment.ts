import * as THREE from "three";
import { AssetManager, ModelAsset } from "../asset-manager";
import { GridBuilder } from "../grid/grid-builder";

import { Agent2 } from "../agent/Agent2";

export class TestExperiment {
  group = new THREE.Group();
  agent: Agent2;

  constructor(
    private gridBuilder: GridBuilder,
    private assetManager: AssetManager
  ) {
    // New assets

    const floorTileSmall = this.assetManager.getModel(
      ModelAsset.FloorTileSmall
    );
    this.group.add(floorTileSmall);

    const model = this.assetManager.getModel(ModelAsset.SkeletonMinion);
    this.group.add(model);

    this.agent = new Agent2(model);
    this.agent.playAnimation("Walking_D_Skeletons");
  }

  update(dt: number) {
    this.agent.update(dt);
  }
}
