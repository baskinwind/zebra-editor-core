import Component from "../components/component";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getBlockById, createError } from "../components/util";

export interface cursorType {
  id: string;
  offset: number;
}

// 获取光标所在的组件
export const getParent = (
  element: HTMLElement | Node | null | undefined
): HTMLElement => {
  if (element === null || element === undefined)
    throw Error("获取光标所在节点失败");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getParent(element.parentElement);
  }
  if (element instanceof HTMLElement) {
    if (
      element.dataset.structure === StructureType.structure ||
      element.dataset.structure === StructureType.content ||
      element.dataset.structure === StructureType.plainText
    ) {
      return element;
    }
  }
  return getParent(element.parentElement);
};

// 获取光标所在的文本节点
export const getContainer = (
  element: Element | Node | null | undefined
): HTMLElement => {
  if (element === null || element === undefined)
    throw Error("容器节点获取失败");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getContainer(element.parentElement);
  }
  if (element instanceof HTMLElement) {
    if (element instanceof HTMLImageElement) {
      return getContainer(element.parentElement);
    }
    if (element.dataset.structure) {
      return element;
    }
  }
  return getContainer(element.parentElement);
};

// 获取元素的长度，修正图片长度为 0 的错误
export const getElememtSize = (element?: Element): number => {
  if (element === undefined) return 0;
  if (element instanceof HTMLImageElement) return 1;
  if (element instanceof HTMLAudioElement) return 1;
  if (element instanceof HTMLVideoElement) return 1;
  if (element instanceof HTMLElement) {
    let type = element.dataset.type;
    if (type === ComponentType.inlineImage) {
      return 1;
    }
    return element.innerText.length;
  }
  return 0;
};

const findFocusNode = (dom: Node, index: number): [boolean, Node, number] => {
  if (
    dom instanceof HTMLImageElement ||
    dom instanceof HTMLAudioElement ||
    dom instanceof HTMLVideoElement
  ) {
    if (index <= 1) {
      return [true, dom, index];
    }
    return [false, dom, 1];
  }
  if (dom instanceof Element && dom.children.length !== 0) {
    let consume = 0;
    for (let i = 0; i < dom.children.length; i++) {
      const element = dom.children[i];
      let res = findFocusNode(element, index - consume);
      if (res[0]) {
        return res;
      }
      consume += res[2];
    }
    return [false, dom, consume];
  }
  let charLength = dom.textContent?.length || 0;
  if (index > charLength) {
    return [false, dom.childNodes[0], charLength];
  }
  // 兼容 p 标签内的 br 标签
  return [true, dom.childNodes.length ? dom.childNodes[0] : dom, index];
};

// 将某个组件的某个位置，转换为某个 dom 节点中的某个位置，方便 rang 对象使用
export const getCursorPosition = (
  cursor: cursorType
):
  | {
      node: Node;
      index: number;
    }
  | undefined => {
  let dom = document.getElementById(cursor.id);
  if (!dom) return;
  if (dom.dataset.type === ComponentType.media) {
    return {
      node: dom,
      index: cursor.offset === 0 ? 0 : 1
    };
  }
  let focusInfo = findFocusNode(dom, cursor.offset);
  return {
    node: focusInfo[1],
    index: focusInfo[2]
  };
};

// 获取所有选中的叶节点，不包括结构性的组件
export const getSelectedIdList = (startId: string, endId: string) => {
  let component = getBlockById(startId);
  let parent = component.parent;
  if (!parent) throw createError("该节点已失效", component);
  while (parent.type !== ComponentType.article) {
    if (!parent.parent) throw createError("该节点已失效", parent);
    parent = parent.parent;
  }
  return parent.getIdList(startId, endId)[2];
};
