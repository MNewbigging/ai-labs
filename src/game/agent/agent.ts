import * as THREE from "three";
import { AnimationAsset } from "../asset-manager";
import { Brain } from "../goals/brain";
import { Grid, GridCell } from "../grid/grid";
import { AnimatedModel } from "./animated-model";
import { FollowPathBehaviour } from "./follow-path-behaviour";

export class Agent extends AnimatedModel {
  brain: Brain;
  followPathBehaviour: FollowPathBehaviour;

  constructor(
    public grid: Grid,
    public model: THREE.Object3D,
    clips: THREE.AnimationClip[],
    startingCell: GridCell
  ) {
    super(model, clips);

    this.brain = new Brain();

    this.followPathBehaviour = new FollowPathBehaviour(this, startingCell);

    this.playAnimation(AnimationAsset.Idle);
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
