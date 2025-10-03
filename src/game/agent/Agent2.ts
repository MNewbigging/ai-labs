import * as THREE from "three";

export class Agent2 {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(public model: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(this.model);
    this.setupAnimations();
  }

  update(dt: number) {
    this.mixer.update(dt);
  }

  playAnimation(name: string) {
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

  private setupAnimations() {
    const names: string[] = [];

    this.model.animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);

      this.actions.set(clip.name, action);
      names.push(clip.name);
    });

    names.sort();

    //console.log("names", names);
  }
}
