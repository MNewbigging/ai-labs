import * as THREE from "three";
import { AnimationAsset } from "./asset-manager";
import { Grid, GridCell } from "./grid";
import { FollowPathBehaviour } from "./follow-path-behaviour";
import { Brain } from "./brain";
import { AnimatedModel } from "./animated-model";

export class Agent extends AnimatedModel {
  brain: Brain;
  followPathBehaviour: FollowPathBehaviour;

  constructor(
    public grid: Grid,
    public model: THREE.Object3D,
    clips: THREE.AnimationClip[]
  ) {
    super(model, clips);

    this.brain = new Brain();

    this.followPathBehaviour = new FollowPathBehaviour(this);

    this.playAnimation(AnimationAsset.Jump);
  }

  positionOnCell(cell: GridCell) {
    this.followPathBehaviour.currentCell = cell;
    if (cell.object) {
      this.model.position.copy(cell.object.position);
    }
  }

  dispose() {
    const mesh = this.model as THREE.Mesh;
    mesh.geometry.dispose();
    (mesh.material as THREE.MeshBasicMaterial).dispose();
  }

  update(dt: number) {
    this.mixer.update(dt);
    this.brain.update(dt);
    this.followPathBehaviour.update(dt);
  }
}
