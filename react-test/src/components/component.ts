import getId from "../util/get-id";
import Collection, { Operator } from "./collection";
import { saveComponent } from "../util/manage-component";
import ComponentType from "../const/component-type";

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
