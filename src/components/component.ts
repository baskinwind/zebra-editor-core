import Collection from "./collection";
import ComponentType from "../const/component-type";
import { getId, saveComponent } from "./util";

export interface Operator<T extends Component = Component> {
  type: string; // 操作类型
  target: T[]; // 操作新增或是删除的组件
  action: Component; // 操作发生的组件
  start: number; // 开始受影响的位置
  end: number; // 结束影响的位置
  [key: string]: any;
}

export default abstract class Component {
  id: string = getId();
  parent?: Collection<Component | Collection<Component>>;
  actived: boolean = false;
  abstract type: ComponentType;

  constructor() {
    Promise.resolve().then(() => {
      saveComponent(this);
    });
  }

  addIntoParent(
    collection: Collection<Component | Collection<Component>>,
    index?: number,
  ): Operator {
    return collection.addChildren(this, index);
  }

  removeSelf(): Operator {
    return (
      this.parent?.removeChildren(this, undefined) || {
        type: `NOPARENT:${this.type}`,
        target: [],
        action: this,
        start: -1,
        end: -1,
        root: this,
      }
    );
  }

  replaceSelf(component: Component) {
    return (
      this.parent?.replaceChild(component, this) || {
        type: `NOPARENT:${this.type}`,
        target: [],
        action: this,
        start: -1,
        end: -1,
        root: this,
      }
    );
  }

  abstract render(): any;
}
