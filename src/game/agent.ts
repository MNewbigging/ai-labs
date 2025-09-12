import * as THREE from "three";
import {
  AnimationAsset,
  AssetManager,
  ModelAsset,
  TextureAsset,
} from "./asset-manager";
import { Grid, GridCell } from "./grid";
import { FollowPathBehaviour } from "./follow-path-behaviour";
import { Brain } from "./brain";

export class Agent {
  model: THREE.Object3D;

  brain: Brain;
  followPathBehaviour: FollowPathBehaviour;

  private mixer: THREE.AnimationMixer;
  private animations = new Map<AnimationAsset, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(
    public grid: Grid,
    private assetManager: AssetManager,
    colour?: TextureAsset
  ) {
    this.model = assetManager.getModel(ModelAsset.Dummy);
    assetManager.applyModelTexture(
      this.model,
      colour ?? TextureAsset.DummyYellow
    );

    this.brain = new Brain();

    this.followPathBehaviour = new FollowPathBehaviour(this);

    this.mixer = new THREE.AnimationMixer(this.model);
    this.setupAnimations();
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

  playAnimation(name: AnimationAsset) {
    if (this.currentAction?.getClip().name === name) return;

    // Find the new action with the given name
    const nextAction = this.animations.get(name);
    if (!nextAction) {
      throw Error(
        "Could not find action with name " + name + "for character " + this
      );
    }

    // Reset the next action then fade to it from the current action
    nextAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);

    this.currentAction
      ? nextAction.crossFadeFrom(this.currentAction, 0.25, false).play()
      : nextAction.play();

    // Next is now current
    this.currentAction = nextAction;
  }

  private setupAnimations() {
    const animations = this.assetManager.animations;

    [AnimationAsset.Idle, AnimationAsset.Walk].forEach((animName) => {
      const clip = animations.get(animName);
      if (!clip) return;

      const action = this.mixer.clipAction(clip);
      this.animations.set(animName, action);
    });
  }
}
