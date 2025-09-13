import * as THREE from "three";
import { AnimationAsset } from "../asset-manager";

export class AnimatedModel {
  protected mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(public model: THREE.Object3D, clips: THREE.AnimationClip[]) {
    this.mixer = new THREE.AnimationMixer(this.model);
    this.mixer.addEventListener("finished", this.onAnimationFinish);
    this.setupActions(clips);
  }

  update(dt: number) {
    this.mixer.update(dt);
  }

  playAnimation(name: AnimationAsset) {
    if (this.currentAction?.getClip().name === name) return;

    // Find the new action with the given name
    const nextAction = this.actions.get(name);
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

  private setupActions(clips: THREE.AnimationClip[]) {
    clips.forEach((clip) => {
      const action = this.mixer.clipAction(clip);

      if (clip.name === AnimationAsset.JumpStart) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else if (clip.name === AnimationAsset.JumpEnd) {
        action.setLoop(THREE.LoopOnce, 1);
      }

      this.actions.set(clip.name, action);
    });
  }

  private onAnimationFinish = (event: { action: THREE.AnimationAction }) => {
    const actionName = event.action.getClip().name as AnimationAsset;

    switch (actionName) {
      case AnimationAsset.JumpStart:
        this.playAnimation(AnimationAsset.JumpLoop);
        break;
    }
  };
}
