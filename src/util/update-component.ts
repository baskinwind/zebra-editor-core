import Component from "../components/component";
import { getComponentById } from "../components/util";

let canUpdate = false;
let delayUpdateQueue: Set<string> = new Set();

const startUpdate = () => {
  canUpdate = true;
};

const stopUpdate = () => {
  canUpdate = false;
};

// 添加延迟更新的组件 id，通常发生在混合输入后
const delayUpdate = (idList: string[]) => {
  idList.forEach((id) => delayUpdateQueue.add(id));
};

// 混合输入后需要根据该方法判断是否有延迟更新的组件
const needUpdate = () => {
  return delayUpdateQueue.size !== 0;
};

// 更新组件
const updateComponent = (
  component: Component | Component[],
  customerUpdate: boolean = false
) => {
  if (customerUpdate) return;
  if (!canUpdate) return;
  console.log("update");
  if (delayUpdateQueue.size) {
    console.log("delay update");
    console.log(delayUpdateQueue);
    delayUpdateQueue.forEach((id) => update(getComponentById(id)));
    delayUpdateQueue.clear();
  }
  if (Array.isArray(component)) {
    component.forEach((item) => update(item));
  } else {
    update(component);
  }
};

const update = (component: Component) => {
  let dom = document.getElementById(component.id);
  if (dom) {
    // 有对应元素时，替换或是删除
    console.log(component.id);
    if (component.active) {
      dom.replaceWith(component.render());
    } else {
      dom.remove();
    }
  } else {
    // 没有对应元素
    // 组件失效，或是组件没有父节点时，不更新
    if (!component.active || !component.parent) return;
    let parentComponent = component.parent;
    let parentDom = document.getElementById(parentComponent.id);

    // 未找到父组件对应的元素时，更新父组件
    if (!parentDom) {
      update(parentComponent);
      return;
    }

    console.log(component.id);
    // 将该组件插入到合适的位置
    let index = parentComponent.children.findIndex(
      (child) => child === component
    );
    if (index === parentComponent.children.size - 1) {
      parentDom.appendChild(component.render());
    } else {
      let afterComId = parentComponent.children.get(index + 1)?.id;
      if (afterComId) {
        parentDom.insertBefore(
          component.render(),
          document.getElementById(afterComId)
        );
      }
    }
  }
};

export default updateComponent;

export { startUpdate, stopUpdate, delayUpdate, needUpdate };
