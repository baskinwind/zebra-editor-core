import Component from "../components/component";

let canUpdate = false;
let delayUpdateQueue: Component[] = [];

const startUpdate = () => {
  canUpdate = true;
};

const stopUpdate = () => {
  canUpdate = false;
};

const delayUpdate = (component: Component[]) => {
  delayUpdateQueue.push(...component);
};

const needUpdate = () => {
  return delayUpdateQueue.length !== 0;
};

// 更新组件
const updateComponent = (
  component: Component | Component[],
  customerUpdate: boolean = false
) => {
  if (customerUpdate) return;
  if (!canUpdate) return;
  console.log("update!!!!");
  if (delayUpdateQueue.length) {
    delayUpdateQueue.forEach((item) => update(item));
    delayUpdateQueue.length = 0;
  }
  if (Array.isArray(component)) {
    component.forEach((item) => update(item));
  } else {
    update(component);
  }
};

const update = (component: Component) => {
  console.log(component.id);
  let dom = document.getElementById(component.id);
  if (dom) {
    if (component.actived) {
      dom.replaceWith(component.render());
    } else {
      dom.remove();
    }
  } else {
    if (!component.actived) return;
    let parentComponent = component.parent;
    if (!parentComponent) return;
    let parentDom = document.getElementById(parentComponent.id);
    if (!parentDom) {
      update(parentComponent);
      return;
    }
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
