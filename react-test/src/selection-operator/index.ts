import { getParent, getContainer, getElememtSize } from "./util";

export interface sectionType {
  isCollapsed: boolean;
  range: { componentId: string; offset: number }[];
}

let sectionStore: sectionType;

export const fixImageClick = (event: MouseEvent) => {
  let target: HTMLElement = event.target as HTMLElement;
  if (target && target.nodeName === "IMG") {
    let section = window.getSelection();
    try {
      section?.removeAllRanges();
    } catch {}
    let range = new Range();
    range.selectNode(target);
    section?.addRange(range);
  }
};

export const getSelection = () => {
  let section = window.getSelection();
  let anchorOffect = section?.anchorOffset || 0;
  let anchorParent = getParent(section?.anchorNode);
  let anchorContainer = getContainer(section?.anchorNode);
  let focusOffset = section?.focusOffset || 0;
  let focusParent = getParent(section?.focusNode);
  let focusContainer = getContainer(section?.focusNode);
  for (let i = 0; i < anchorParent.children.length; i++) {
    const element = anchorParent.children[i];
    if (element === anchorContainer) break;
    anchorOffect += getElememtSize(element as HTMLElement);
  }
  for (let i = 0; i < focusParent.children.length; i++) {
    const element = anchorParent.children[i];
    if (element === focusContainer) break;
    focusOffset += getElememtSize(element as HTMLElement);
  }
  sectionStore = {
    isCollapsed: section?.isCollapsed || true,
    range: [
      {
        componentId: anchorParent.id,
        offset: anchorOffect,
      },
      {
        componentId: focusParent.id,
        offset: focusOffset,
      },
    ],
  };
  return sectionStore;
};

export const focusAt = (id: string, offset: number) => {
  let dom = document.getElementById(id);
  if (dom === null) {
    console.error(`未获取到 id 为：${id}的元素`);
    return;
  }
  let sizeNow = 0;
  let focusNode: Node;
  let focusOffset = 0;
  for (let i = 0; i < dom.children.length; i++) {
    const element = dom.children[i] as HTMLElement;
    let elementSize = getElememtSize(element);
    if (sizeNow + elementSize < offset) {
      sizeNow += elementSize;
      continue;
    }
    focusNode = element;
    focusOffset = offset - sizeNow;
    break;
  }

  setTimeout(() => {
    let section = window.getSelection();
    try {
      section?.removeAllRanges();
    } catch {}
    let range = new Range();
    range.setStart(focusNode.childNodes[0], 0);
    range.setEnd(focusNode.childNodes[0], focusOffset);
    range.collapse();
    section?.addRange(range);
  });
};

export const getRange = (): sectionType => {
  return sectionStore;
};
