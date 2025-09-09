import { Goal } from "./goal";

export class Brain {
  private goals: Goal[] = [];
  private currentGoal?: Goal;

  assignGoal(goal: Goal) {
    if (!this.goals.includes(goal)) this.goals.push(goal);
  }

  update(dt: number) {
    // For now evaluate goals every frame
    this.chooseGoal();

    this.currentGoal?.update(dt);
  }

  private chooseGoal() {
    if (!this.goals.length) return;

    this.goals.sort((a, b) => a.getDesirability() - b.getDesirability());
    const best = this.goals[0];

    if (best === this.currentGoal) return;

    this.currentGoal?.onStop();

    this.currentGoal = best;
    this.currentGoal.onStart();
  }
}
