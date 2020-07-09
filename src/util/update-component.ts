import { throttle } from "lodash-es";
import Block from "../components/block";
import { getBlockById } from "../components/util";
import { getContainDocument } from "../selection-operator/util";
import StructureType from "../const/structure-type";

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

let lock = false;

// 更新组件
const updateComponent = (
  component?: Block | Block[],
  customerUpdate: boolean = false
) => {
  // 清空延迟更新队列
  if (delayUpdateQueue.size) {
    // console.info("delay update");
    delayUpdateQueue.forEach((id) => update(getBlockById(id)));
    delayUpdateQueue.clear();
  }

  if (!lock) {
    lock = true;
    setTimeout(() => {
      document.dispatchEvent(new Event("editorchange"));
    });
    setTimeout(() => (lock = false), 100);
  }

  // 无内容，不更新
  if (!canUpdate || customerUpdate || !component) return;
  // console.info("update");
  if (Array.isArray(component)) {
    component.forEach((item) => update(item));
  } else {
    update(component);
  }
};

const update = (component: Block) => {
  let containDocument = getContainDocument();
  let dom = containDocument.getElementById(component.id);
  if (dom) {
    // console.info(component.id);
    if (component.active) {
      let newRender = component.render();
      // 当仅发生样式变化时，render 返回节点不会变化
      if (newRender === dom) return;
      dom?.replaceWith(newRender);
    } else {
      dom?.remove();
    }
  } else {
    // 没有对应元素
    // 组件失效，或是组件没有父节点时，不需更新
    if (!component.active || !component.parent) return;
    let parentComponent = component.parent;
    let parentDom = containDocument.getElementById(parentComponent.id);

    // 未找到父组件对应的元素时，更新父组件
    if (!parentDom) {
      update(parentComponent);
      return;
    }
    // console.info(component.id);
    // 将该组件插入到合适的位置
    let index = parentComponent.findChildrenIndex(component);
    if (index === parentComponent.getSize() - 1) {
      parentDom.appendChild(component.render());
    } else {
      let afterComId = parentComponent.getChild(index + 1)?.id;
      if (afterComId) {
        let afterDom = containDocument.getElementById(afterComId);
        // @ts-ignore
        afterDom = afterDom.softLink ? afterDom.softLink : afterDom;
        parentDom.insertBefore(component.render(), afterDom);
      }
    }
  }
};

export default updateComponent;

export { startUpdate, stopUpdate, delayUpdate, needUpdate };
