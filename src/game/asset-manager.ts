import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export enum AnimationAsset {
  Idle = "A_Idle_Standing_Masc.fbx",
  Walk = "A_Walk_F_Masc.fbx",
  JumpStart = "jump_start.fbx",
  JumpLoop = "jump_loop.fbx",
  JumpEnd = "A_Land_IdleSoft_Masc.fbx",
}

export enum ModelAsset {
  Dummy = "PolygonSyntyCharacter.fbx",
}

export enum TextureAsset {
  PrototypeBlack = "texture_06_black.png",
  DummyGreen = "dummy_green.png",
  DummyBlue = "dummy_blue.png",
  DummyYellow = "dummy_yellow.png",
  DummyRed = "dummy_red.png",
}

export class AssetManager {
  private models = new Map<ModelAsset, THREE.Group>();
  textures = new Map<TextureAsset, THREE.Texture>();
  animations = new Map<AnimationAsset, THREE.AnimationClip>();

  private loadingManager = new THREE.LoadingManager();
  private fbxLoader = new FBXLoader(this.loadingManager);
  private gltfLoader = new GLTFLoader(this.loadingManager);
  private rgbeLoader = new RGBELoader(this.loadingManager);
  private textureLoader = new THREE.TextureLoader(this.loadingManager);

  getDummyModel(colour: TextureAsset) {
    const dummy = this.getModel(ModelAsset.Dummy);
    this.applyModelTexture(dummy, colour);

    return dummy;
  }

  getDummyClips() {
    const clips: THREE.AnimationClip[] = [];
    [
      AnimationAsset.Idle,
      AnimationAsset.Walk,
      AnimationAsset.JumpStart,
      AnimationAsset.JumpLoop,
      AnimationAsset.JumpEnd,
    ].forEach((name) => {
      const clip = this.animations.get(name);
      if (clip) clips.push(clip);
    });
    return clips;
  }

  applyModelTexture(model: THREE.Object3D, textureName: TextureAsset) {
    const texture = this.textures.get(textureName);
    if (!texture) {
      return;
    }

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material.clone();
        material.map = texture;
        material.vertexColors = false;
        child.material = material;
      }
    });
  }

  getModel(name: ModelAsset): THREE.Object3D {
    const model = this.models.get(name);
    if (model) {
      return SkeletonUtils.clone(model);
    }

    // Ensure we always return an object 3d
    return new THREE.Mesh(
      new THREE.SphereGeometry(),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
  }

  load(): Promise<void> {
    this.loadModels();
    this.loadTextures();
    this.loadAnimations();

    return new Promise((resolve) => {
      this.loadingManager.onLoad = () => {
        resolve();
      };
    });
  }

  private loadModels() {
    this.loadModel(ModelAsset.Dummy, (group) => {
      group.scale.multiplyScalar(0.01);
    });
  }

  private loadTextures() {
    Object.values(TextureAsset).forEach((filename) =>
      this.loadTexture(filename)
    );
  }

  private loadAnimations() {
    Object.values(AnimationAsset).forEach((filename) =>
      this.loadAnimation(filename)
    );
  }

  private loadModel(
    filename: ModelAsset,
    onLoad?: (group: THREE.Group) => void
  ) {
    const path = `${getPathPrefix()}/models/${filename}`;
    const url = getUrl(path);

    const filetype = filename.split(".")[1];

    // FBX
    if (filetype === "fbx") {
      this.fbxLoader.load(url, (group: THREE.Group) => {
        onLoad?.(group);
        this.models.set(filename, group);
      });

      return;
    }

    // GLTF
    this.gltfLoader.load(url, (gltf: GLTF) => {
      onLoad?.(gltf.scene);
      this.models.set(filename, gltf.scene);
    });
  }

  private loadTexture(filename: TextureAsset) {
    const path = `${getPathPrefix()}/textures/${filename}`;
    const url = getUrl(path);

    const filetype = filename.split(".")[1];
    const loader = filetype === "png" ? this.textureLoader : this.rgbeLoader;

    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.set(filename, texture);
    });
  }

  private loadAnimation(filename: AnimationAsset) {
    const path = `${getPathPrefix()}/anims/${filename}`;
    const url = getUrl(path);

    this.fbxLoader.load(url, (group) => {
      if (group.animations.length) {
        const clip = group.animations[0];
        clip.name = filename;
        this.animations.set(filename, clip);
      }
    });
  }
}

function getPathPrefix() {
  // Using template strings to create url paths breaks on github pages
  // We need to manually add the required /repo/ prefix to the path if not on localhost
  return location.hostname === "localhost" ? "" : "/ai-labs";
}

function getUrl(path: string) {
  return new URL(path, import.meta.url).href;
}
