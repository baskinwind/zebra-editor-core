import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";

export interface cursorType {
  id: string;
  offset: number;
}

// 获取到结构性的节点，段落，列表，表格内容节点等
export const getParent = (
  element: HTMLElement | Node | null | undefined
): HTMLElement => {
  if (element === null || element === undefined) throw Error("获取父节点失败");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getParent(element.parentElement);
  }
  if (element instanceof HTMLElement) {
    if (element.dataset.structure === StructureType.content) {
      return element;
    }
    if (element.dataset.structure === StructureType.collection) {
      return getContainer(element.children[0]);
    }
  }
  return getParent(element.parentElement);
};

// 获取到包含该内容的节点，段落内的字符片断，段落内的图片等
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
    if (
      element.dataset.structure === StructureType.content ||
      element.dataset.structure === StructureType.partialContent
    ) {
      return element;
    }
    if (element.dataset.structure === StructureType.collection) {
      return getContainer(element.children[0]);
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
    if (type === ComponentType.characterList) {
      return element.innerText.length;
    }
    if (type === ComponentType.inlineImage) {
      return 1;
    }
  }
  return 0;
};

// 将某个组件的某个位置，转换为某个 dom 节点中的某个位置，方便 rang 对象使用
export const getCursorPosition = (
  cursor: cursorType
):
  | {
      node: Node | Element;
      index: number;
    }
  | undefined => {
  let dom = document.getElementById(cursor.id);
  let node = dom as Element;
  let now = 0;
  let index = 0;
  if (!dom) return;
  if (dom.dataset.type === ComponentType.image) {
    return {
      node,
      index: cursor.offset === 0 ? 0 : 1
    };
  }
  for (let i = 0; i < dom.children.length; i++) {
    const element = dom.children[i];
    let elementSize = getElememtSize(element);
    if (elementSize === 0) {
      continue;
    }
    if (now + elementSize < cursor.offset) {
      now += elementSize;
    } else {
      node = element;
      index = cursor.offset - now;
      now = 0;
      break;
    }
  }
  if (now !== 0) {
    let last = dom.children[dom.children.length - 1];
    return {
      node: last.childNodes[0],
      index: getElememtSize(last)
    };
  }
  if (!node?.childNodes[0]) return;
  return {
    node: node?.childNodes[0],
    index
  };
};
