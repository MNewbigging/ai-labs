import { Agent } from "../agent/agent";

export abstract class Goal {
  constructor(public agent: Agent) {}

  abstract getDesirability(): number;

  onStart() {}
  abstract update(dt: number): void;
  onStop() {}
  // onComplete?
}

/**
 * Note:
 *
 * - The current setup in Brain means that a goal that is run, then stopped in favour of another, then re-run later will
 *   still be the same instance. Therefore we need to do cleanup/reset in onStop/onStart.
 * - YUKA's method uses a separate goal evaluator which creates a new goal instance when chosen - might be easier in the long run
 */
