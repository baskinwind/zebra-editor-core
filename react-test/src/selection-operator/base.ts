import { getParent, getContainer, getElememtSize } from "./util";

interface sectionType {
  isCollapsed: boolean;
  range: { componentId: string; offset: number }[];
}

let sectionStore: sectionType;

export default {
  flushRangeByClick(event: MouseEvent) {
    let target: HTMLElement = event.target as HTMLElement;
    if (target && target.nodeName === "IMG") {
      let section = window.getSelection();
      try {
        section?.removeAllRanges();
      } catch {}
      let range = document.createRange();
      range.selectNode(target);
      section?.addRange(range);
    }
    return this.flushRangeBase();
  },
  flushRangeBase() {
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
    console.log(sectionStore);
    return sectionStore;
  },
  getRange(): sectionType {
    return sectionStore;
  },
};
