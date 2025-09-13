import * as THREE from "three";
import { AssetManager, TextureAsset } from "./asset-manager";

export type NodeType = "floor";

class Node extends THREE.Mesh {
  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    public type: NodeType
  ) {
    super(geometry, material);
  }

  isTraversible() {
    switch (this.type) {
      case "floor":
        return true;
      default:
        return false;
    }
  }
}

export class NodeFactory {
  private floorMaterial: THREE.MeshLambertMaterial;
  private floorGeometry: THREE.BoxGeometry;

  constructor(private assetManager: AssetManager) {
    this.floorMaterial = new THREE.MeshLambertMaterial({
      map: this.assetManager.textures.get(TextureAsset.PrototypeBlack),
    });

    this.floorGeometry = new THREE.BoxGeometry();
    this.floorGeometry.translate(0, -0.5, 0); // so top of box is at floor level
  }

  createFloorNode(position: THREE.Vector3Like): Node {
    const floor = new Node(this.floorGeometry, this.floorMaterial, "floor");
    floor.position.set(position.x, position.y, position.z);

    return floor;
  }

  /**
   * createPillarNode() {}
   * createButtonConsoleNode() {}
   * createSomeOtherNode() {}
   */
}
