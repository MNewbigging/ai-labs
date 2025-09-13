import * as THREE from "three";
import { NodeFactory } from "./node-factory";

export class NodeExperiment {
  group = new THREE.Group();

  constructor(private nodeFactory: NodeFactory) {
    this.buildScene();
  }

  private buildScene() {
    // Two blocks either side of a 1 meter gap
    const left1 = this.nodeFactory.createFloorNode({ x: 0, y: 0, z: 0 });
    const left2 = this.nodeFactory.createFloorNode({ x: 1, y: 0, z: 0 });
    const right1 = this.nodeFactory.createFloorNode({ x: 3, y: 0, z: 0 });
    const right2 = this.nodeFactory.createFloorNode({ x: 4, y: 0, z: 0 });

    this.group.add(left1, left2, right1, right2);
  }
}
