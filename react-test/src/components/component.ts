import ComponentType from "../const/component-type";

import Collection, { Operator } from "./collection";
import { getId, saveComponent } from "./util";

export default abstract class Component {
  id: string = getId();
  parent?: Collection<Component | Collection<Component>>;
  abstract type: ComponentType;

  constructor() {
    saveComponent(this);
  }

  addIntoParent(
    collection: Collection<Component | Collection<Component>>,
    index?: number
  ): Operator {
    return collection.addChildren(this, index);
  }

  removeSelf(): Operator {
    return (
      this.parent?.removeChildren(this) || {
        type: "NOPARENT",
        target: [this],
        root: this,
      }
    );
  }

  abstract getContent(): any;
}
