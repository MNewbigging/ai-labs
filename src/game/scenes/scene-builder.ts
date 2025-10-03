import * as THREE from "three";
import { AssetManager, ModelAsset } from "../asset-manager";
import { PathNode } from "../pathfinding/path-node";

interface PathBlock {
  object: THREE.Object3D;
  pathNode: PathNode;
}

export class SceneBuilder {
  private group = new THREE.Group();
  private pathBlocks: PathBlock[] = [];

  constructor(private assetManager: AssetManager) {}

  finish() {
    return { group: this.group, pathBlocks: this.pathBlocks };
  }

  makeFloor(pos: THREE.Vector3) {
    // Create the 3d object
    const object = this.assetManager.getModel(ModelAsset.FloorTileSmall);
    this.group.add(object);

    // Create the path node(s) for it
    const pathNode: PathNode = {
      position: pos.clone(),
      neighbours: [],
    };

    this.pathBlocks.push({ object, pathNode });
  }

  private setPathNodeNeighbours() {
    // On^2
    this.pathBlocks.forEach((currentPathBlock) => {
      for (const comparePathBlock of this.pathBlocks) {
        // Ignore self
        if (currentPathBlock === comparePathBlock) continue;

        const currentNode = currentPathBlock.pathNode;
        const compareNode = comparePathBlock.pathNode;

        if (currentNode.position.distanceTo(compareNode.position) < 1.01) {
          // They are neighbours
          currentNode.neighbours.push(compareNode);
        }
      }
    });
  }
}
