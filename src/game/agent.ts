import * as THREE from "three";
import { AssetManager, ModelAsset, TextureAsset } from "./asset-manager";
import { Grid, GridCell } from "./grid";
import { FollowPathBehaviour } from "./follow-path-behaviour";
import { Brain } from "./brain";

export class Agent {
  model: THREE.Object3D;

  brain: Brain;
  followPathBehaviour: FollowPathBehaviour;

  constructor(public grid: Grid, assetManager: AssetManager) {
    this.model = assetManager.getModel(ModelAsset.Dummy);
    assetManager.applyModelTexture(this.model, TextureAsset.Dummy);

    this.followPathBehaviour = new FollowPathBehaviour(this);

    this.brain = new Brain();
  }

  positionOnCell(cell: GridCell) {
    this.followPathBehaviour.currentCell = cell;
  }

  dispose() {
    const mesh = this.model as THREE.Mesh;
    mesh.geometry.dispose();
    (mesh.material as THREE.MeshBasicMaterial).dispose();
  }

  update(dt: number) {
    this.brain.update(dt);
    this.followPathBehaviour.update(dt);
  }
}
