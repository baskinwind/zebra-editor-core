import Block from "../components/block";
import { getBlockById } from "../components/util";
import { getContainDocument } from "../operator-selection/util";
import ComponentType from "../const/component-type";
import nextTicket from "./next-ticket";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../content";

let canUpdate = false;
let delayUpdateQueue: Set<string> = new Set();
let inLoop = false;

const startUpdate = () => {
  canUpdate = true;
};

const stopUpdate = () => {
  canUpdate = false;
};

// 添加延迟更新的组件 id，通常发生在大批量删除或历史回退时
const delayUpdate = (id: string | string[]) => {
  if (Array.isArray(id)) {
    id.forEach((item) => delayUpdateQueue.add(item));
  } else {
    delayUpdateQueue.add(id);
  }
};

// 判断是否需要延迟更新
const needUpdate = () => {
  return delayUpdateQueue.size !== 0;
};

// 更新组件
const updateComponent = (
  block?: Block | Block[],
  customerUpdate: boolean = false,
  focus: boolean = false
) => {
  // 清空延迟更新队列
  if (delayUpdateQueue.size) {
    // console.info("delay update");
    delayUpdateQueue.forEach((id) => update(getBlockById(id), focus));
    delayUpdateQueue.clear();
    nextTicket(() => {
      document.dispatchEvent(new Event("editorchange"));
    });
  }

  // 无内容，不更新
  if (!canUpdate || customerUpdate || !block) return;
  // console.info("update");
  if (Array.isArray(block)) {
    block.forEach((item) => update(item, focus));
  } else {
    update(block, focus);
  }

  // 避免过度触发 editorchange 事件
  if (!inLoop) {
    inLoop = true;
    nextTicket(() => {
      inLoop = false;
      document.dispatchEvent(new Event("editorchange"));
    });
  }
};

const update = (block: Block, focus: boolean) => {
  if (!block) return;
  let containDocument = getContainDocument();
  let dom = containDocument.getElementById(block.id);
  if (dom) {
    // console.info(component.id);
    if (block.active) {
      // 结构组件如果存在 dom 并且是有效的，不需要更新，减少更新量
      if (block.structureType === StructureType.structure && !focus) return;
      let newRender = block.render();
      // 当仅发生样式变化时，render 返回节点不会变化
      if (newRender === dom) return;
      dom?.replaceWith(newRender);
    } else {
      // li 需要做特殊处理
      if (dom.parentElement?.tagName.toLowerCase() === "li") {
        dom.parentElement.remove();
      } else {
        dom?.remove();
      }
    }
  } else {
    // 没有对应元素
    // 组件失效，或是组件没有父节点时，不需更新
    if (!block.active || !block.parent) return;
    let parentComponent = block.parent;
    let parentDom = containDocument.getElementById(parentComponent.id);

    // table 组件外层有 figure 标签嵌套
    if (parentComponent.type === ComponentType.table) {
      parentDom = parentDom?.children[0] as HTMLElement;
    }

    // 未找到父组件对应的元素时，更新父组件
    if (!parentDom) {
      update(parentComponent, focus);
      return;
    }

    // console.info(component.id);
    // 渲染组件
    let newElement: HTMLElement;

    // 列表的子组件需要嵌套 li
    let inList = parentComponent.type === ComponentType.list;
    if (inList) {
      // @ts-ignore
      newElement = getContentBuilder().buildListItem(block);
    } else {
      newElement = block.render();
    }

    // 将该组件插入到合适的位置
    let index = parentComponent.findChildrenIndex(block);
    if (index === parentComponent.getSize() - 1) {
      parentDom.appendChild(newElement);
    } else {
      let afterComId = parentComponent.getChild(index + 1).id;
      let afterDom = containDocument.getElementById(afterComId);
      if (inList) {
        afterDom = afterDom?.parentElement as HTMLElement;
      }
      if (afterDom) {
        parentDom.insertBefore(newElement, afterDom);
      } else {
        delayUpdateQueue.add(block.id);
      }
    }
  }
};

export default updateComponent;

export { startUpdate, stopUpdate, delayUpdate, needUpdate };
