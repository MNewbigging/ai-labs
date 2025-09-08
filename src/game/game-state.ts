import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPipeline } from "./render-pipeline";
import { AssetManager, ModelAsset, TextureAsset } from "./asset-manager";
import { AnimatedObject } from "./animated-object";

export class GameState {
  private renderPipeline: RenderPipeline;
  private clock = new THREE.Clock();

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;

  private animatedObject: AnimatedObject;

  constructor(private assetManager: AssetManager) {
    this.setupCamera();

    this.renderPipeline = new RenderPipeline(this.scene, this.camera);

    this.setupLights();
    this.setupObjects();

    this.controls = new OrbitControls(this.camera, this.renderPipeline.canvas);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

    this.scene.background = new THREE.Color("#1680AF");

    this.animatedObject = new AnimatedObject(assetManager);
    this.animatedObject.position.z = -0.5;
    this.animatedObject.playAnimation("idle");
    this.scene.add(this.animatedObject);

    // Start game
    this.update();
  }

  private setupCamera() {
    this.camera.fov = 75;
    this.camera.far = 500;
    this.camera.position.set(0, 1.5, 3);
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(undefined, 1);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);
  }

  private setupObjects() {
    const wall = this.assetManager.getModel(ModelAsset.Wall_1);
    this.assetManager.applyModelTexture(wall, TextureAsset.SciFi_1A);
    this.scene.add(wall);

    const wallAlt = this.assetManager.getModel(ModelAsset.Wall_1_Alt);
    this.assetManager.applyModelTexture(wallAlt, TextureAsset.SciFi_1A);
    wallAlt.position.x = 5;
    this.scene.add(wallAlt);
  }

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.controls.update();

    this.animatedObject.update(dt);

    this.renderPipeline.render(dt);
  };
}
