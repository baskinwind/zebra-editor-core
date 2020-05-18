import ComponentType from "../const/component-type";

export const getParent = (
  element: HTMLElement | Node | null | undefined
): HTMLElement => {
  if (element === null || element === undefined) throw Error("获取父节点失败");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getParent(element.parentElement);
  }
  let htmlElement = element as HTMLElement;
  let type = htmlElement.dataset.type;
  if (
    type === ComponentType.article ||
    type === ComponentType.paragraph ||
    type === ComponentType.image ||
    type === ComponentType.audio ||
    type === ComponentType.video
  ) {
    return htmlElement;
  }
  return getParent(element.parentElement);
};

export const getContainer = (
  element: HTMLElement | Node | null | undefined
): HTMLElement => {
  if (element === null || element === undefined)
    throw Error("获取容器节点失败");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getContainer(element.parentElement);
  }
  let htmlElement = element as HTMLElement;
  if (htmlElement.dataset.type) {
    return htmlElement;
  }
  return getContainer(element.parentElement);
};

export const getElememtSize = (element?: HTMLElement): number => {
  if (element === undefined) return 0;
  let type = element.dataset.type;
  if (type === ComponentType.characterList) {
    return element.innerText.length;
  }
  if (type === ComponentType.inlineImage) {
    return 1;
  }
  return 0;
};
