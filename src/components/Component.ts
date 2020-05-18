import Collection from "./collection";
import ComponentType from "../const/component-type";
import { getId, saveComponent } from "./util";
import { $emit } from "../event";

export interface Operator<T extends Component = Component> {
  type: string; // 操作类型
  target: T[]; // 操作新增或是删除的组件
  action: Component; // 操作发生的组件
  tiggerBy: string; // 触发该操作的标识，默认为 customer
  [key: string]: any;
}

export default abstract class Component {
  id: string = getId();
  parent?: Collection<Component | Collection<Component>>;
  abstract type: ComponentType;

  constructor() {
    saveComponent(this);
  }

  addIntoParent(
    collection: Collection<Component | Collection<Component>>,
    index?: number,
    tiggerBy: string = "customer"
  ): Operator {
    return collection.addChildren(this, index, tiggerBy);
  }

  removeSelf(tiggerBy: string = "customer"): Operator {
    return (
      this.parent?.removeChildren(this, undefined, tiggerBy) || {
        type: `NOPARENT:${this.type}`,
        target: [],
        action: this,
        root: this,
        tiggerBy,
      }
    );
  }

  update(event: Operator) {
    if (event.tiggerBy !== "inner") {
      $emit(event.type, event);
    }
  }

  abstract render(): any;
}
