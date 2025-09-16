import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager } from "./asset-manager";
import { MainScene } from "./scenes/main-scene";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();
  private animFrameRequest = 0;

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;

  private mainScene: MainScene;

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

    this.mainScene = new MainScene(assetManager);
    this.scene.add(this.mainScene.group);

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

    this.mainScene.update(dt);

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
