import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager } from "./asset-manager";
import { WanderExperiment } from "./wander/wander-experiment";
import { GridBuilder } from "./grid-builder";
import { JumpExperiment } from "./jump-experiment";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();
  private animFrameRequest = 0;

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;

  private gridBuilder: GridBuilder;
  private wanderExperiment: WanderExperiment;
  private jumpExperiment: JumpExperiment;

  constructor(private assetManager: AssetManager) {
    this.setupCamera();
    this.renderPipeline = new RenderPipeline(this.scene, this.camera);
    this.setupLights();

    this.controls = new OrbitControls(this.camera, this.renderPipeline.canvas);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

    this.scene.background = new THREE.Color("#1680AF");

    //

    window.addEventListener("blur", this.onLoseFocus);
    window.addEventListener("focus", this.onGainFocus);

    //
    this.gridBuilder = new GridBuilder(assetManager);

    this.wanderExperiment = new WanderExperiment(
      this.gridBuilder,
      this.assetManager
    );

    this.jumpExperiment = new JumpExperiment(
      this.gridBuilder,
      this.assetManager
    );

    this.scene.add(this.jumpExperiment.group); // this experiment is active by default so add it now

    // Start game
    this.update();
  }

  private setupCamera() {
    this.camera.fov = 75;
    this.camera.far = 500;
    this.camera.position.set(0, 5, 15);
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(undefined, 1);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);
  }

  private update = () => {
    this.animFrameRequest = requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.controls.update();

    this.jumpExperiment.update(dt);

    this.renderPipeline.render(dt);
  };

  private onLoseFocus = () => {
    cancelAnimationFrame(this.animFrameRequest);
    this.clock.stop();
  };

  private onGainFocus = () => {
    this.clock.start();
    this.update();
  };
}
