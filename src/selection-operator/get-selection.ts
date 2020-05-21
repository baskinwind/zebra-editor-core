import { getElememtSize, getParent, getContainer } from "./util";
import ComponentType from "../const/component-type";

export interface selectionType {
  isCollapsed: boolean;
  range: [
    { componentId: string; offset: number },
    { componentId: string; offset: number }
  ];
}

let selectionStore: selectionType = {
  isCollapsed: true,
  range: [
    {
      componentId: "",
      offset: 0,
    },
    {
      componentId: "",
      offset: 0,
    },
  ],
};

// 获取选区信息
const getSelection = () => {
  let root = document.getElementById("zebra-draft-root") as HTMLElement;
  let section = window.getSelection();
  let anchorNode = section?.anchorNode;
  let isArticleDom = (anchorNode as HTMLElement)?.dataset
    ? (anchorNode as HTMLElement)?.dataset.type === ComponentType.article
    : false;
  // 无选区，选区的焦点不在所在的根节点，以及选区的焦点在文章节点上时，直接返回之前的选区内容
  if (
    section?.type === "None" ||
    !root.contains(section?.anchorNode as Node) ||
    isArticleDom
  ) {
    return selectionStore;
  }

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
    const element = focusParent.children[i];
    if (element === focusContainer) break;
    focusOffset += getElememtSize(element as HTMLElement);
  }

  selectionStore = {
    isCollapsed:
      section?.isCollapsed === undefined ? true : section.isCollapsed,
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
  return selectionStore;
};

export default getSelection;
