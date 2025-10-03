import * as THREE from "three";

// All the completed nodes for the level
export type PathNodeNetwork = PathNode[];

// An invidiual waypoint in the level, corresponds to a traversible 3d object in the scene
export interface PathNode {
  position: THREE.Vector3; // Will be used as a waypoint
  neighbours: PathNode[];
}

interface SceneBlock {}
