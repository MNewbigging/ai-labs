import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

// todo test floor tiles gltf - do I need the bin file too?
export enum ModelAsset {
  FloorTileSmall = "floor_tile_small.gltf",
  SkeletonMinion = "Skeleton_Minion.glb",
  Barbarian = "Barbarian.glb",
}

export enum TextureAsset {
  SomeTexture = "some_texture.png",
}

export class AssetManager {
  private models = new Map<ModelAsset, THREE.Group>();
  textures = new Map<TextureAsset, THREE.Texture>();

  private loadingManager = new THREE.LoadingManager();
  private fbxLoader = new FBXLoader(this.loadingManager);
  private gltfLoader = new GLTFLoader(this.loadingManager);
  private rgbeLoader = new RGBELoader(this.loadingManager);
  private textureLoader = new THREE.TextureLoader(this.loadingManager);

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

    return new Promise((resolve) => {
      this.loadingManager.onLoad = () => {
        resolve();
      };
    });
  }

  private loadModels() {
    this.loadModel(ModelAsset.FloorTileSmall);
    this.loadModel(ModelAsset.SkeletonMinion);
    this.loadModel(ModelAsset.Barbarian);
  }

  private loadTextures() {
    // No textures to load just now
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
      gltf.scene.animations = gltf.animations;
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
}

function getPathPrefix() {
  // Using template strings to create url paths breaks on github pages
  // We need to manually add the required /repo/ prefix to the path if not on localhost
  return location.hostname === "localhost" ? "" : "/ai-labs";
}

function getUrl(path: string) {
  return new URL(path, import.meta.url).href;
}
