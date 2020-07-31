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
  customerUpdate: boolean = false
) => {
  // 清空延迟更新队列
  if (delayUpdateQueue.size) {
    // console.info("delay update");
    delayUpdateQueue.forEach((id) => update(getBlockById(id)));
    delayUpdateQueue.clear();
    nextTicket(() => {
      document.dispatchEvent(new Event("editorchange"));
    });
  }

  // 不需要更新
  if (!canUpdate || customerUpdate || !block) return;
  if (Array.isArray(block)) {
    block.forEach((item) => update(item));
  } else {
    update(block);
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

const update = (block: Block) => {
  if (!block) return;
  let containDocument = getContainDocument();
  let oldDom = containDocument.getElementById(block.id);

  if (oldDom) {
    let inList = oldDom.parentElement?.tagName.toLowerCase() === "li";
    if (block.active) {
      let newDom: HTMLElement;
      if (inList) {
        newDom = getContentBuilder().buildListItem(block);
        oldDom = oldDom.parentElement;
      } else {
        newDom = block.render();
      }
      // 当仅发生样式变化时，render 返回节点不会变化
      if (newDom === oldDom) return;
      oldDom?.replaceWith(newDom);
    } else {
      // li 需要做特殊处理
      if (inList) {
        oldDom.parentElement?.remove();
      } else {
        oldDom?.remove();
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
      update(parentComponent);
      return;
    }

    // 组件渲染结果
    let newDom: HTMLElement;

    // 列表的子组件需要嵌套 li
    let inList = parentComponent.type === ComponentType.list;
    if (inList) {
      newDom = getContentBuilder().buildListItem(block);
    } else {
      newDom = block.render();
    }

    // 将该组件插入到合适的位置
    let index = parentComponent.findChildrenIndex(block);
    if (index === parentComponent.getSize() - 1) {
      parentDom.appendChild(newDom);
    } else {
      let afterComId = parentComponent.getChild(index + 1).id;
      let afterDom = containDocument.getElementById(afterComId);
      if (inList) {
        afterDom = afterDom?.parentElement as HTMLElement;
      }
      if (afterDom) {
        parentDom.insertBefore(newDom, afterDom);
      } else {
        delayUpdateQueue.add(block.id);
      }
    }
  }
};

export default updateComponent;

export { startUpdate, stopUpdate, delayUpdate, needUpdate };
