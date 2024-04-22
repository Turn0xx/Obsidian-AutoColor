import { Observer } from "./observer";
import { Subject } from "./subject";

export class BasicSubject implements Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    if (this.observers.includes(observer)) {
      return;
    }

    this.observers.push(observer);
  }

  public notifyAdd(colorName: string) {
    this.observers.map((o) => o.update('add' , colorName));
  }

  public notifyRemove(colorName: string) {
    this.observers.map((o) => o.update('remove' , colorName));
  }

  detach(observer: Observer): void {
    throw new Error("Method not implemented.");
  }
}