import { Map } from "immutable";
import ContentCollection from "../components/content-collection";
import Block from "../components/block";
import getSelection from "./get-selection";
import { getSelectedIdList } from "./util";
import { getBlockById } from "../components/util";
import PlainText from "../components/plain-text";

const charMerge = (
  block: Block,
  start: number,
  end: number,
  base?: Map<string, any>[]
) => {
  if (start < 0) return;
  if (!(block instanceof ContentCollection)) return;
  let charStyle = base ? base[0] : block.children.get(start)!.decorate.style;
  let charData = base ? base[1] : block.children.get(start)!.decorate.data;
  start = base ? start : start + 1;
  for (let i = start; i < end; i++) {
    const char = block.children.get(i);
    charStyle = charStyle.merge(char!.decorate.style);
    charData = charData.merge(char!.decorate.data);
  }
  return [charStyle, charData];
};

interface info {
  path: string[];
  blockType: string;
  blockDecorate: {
    style: { [key: string]: any };
    data: { [key: string]: any };
  };
  textDecorate: {
    style: { [key: string]: any };
    data: { [key: string]: any };
  };
}

const getSelectionInfo = (): info => {
  let selection = getSelection();
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(start.id, end.id);
  let res: info = {
    path: [],
    blockType: "",
    blockDecorate: {
      style: {},
      data: {}
    },
    textDecorate: {
      style: {},
      data: {}
    }
  };
  if (idList.length === 0) return res;
  let blockList = idList.map((id) => getBlockById(id));

  // 确定路径
  let pathList: string[][] = [];
  for (let i = 0; i < blockList.length; i++) {
    let block: Block | undefined = blockList[i];
    pathList[i] = [];
    while (block) {
      pathList[i].unshift(block.getType());
      block = block.parent;
    }
  }

  let isSameBlock = true;
  let resPath: string[] = [];
  let count = 0;
  allLoop: while (pathList[0][count]) {
    for (let i = 1; i < pathList.length; i++) {
      if (pathList[i][count] !== pathList[0][count]) {
        isSameBlock = false;
        break allLoop;
      }
    }
    resPath.push(pathList[0][count]);
    count++;
  }
  if (!isSameBlock) {
    resPath.push("...");
  }
  res.path = resPath;
  res.blockType = resPath[resPath.length - 1];

  // 确定选中 block 的 Decorate
  let blockStyle = blockList[0].decorate.style;
  let blockData = blockList[0].decorate.data;
  for (let i = 1; i < blockList.length; i++) {
    let block = blockList[i];
    blockStyle = blockStyle.merge(block.decorate.style);
    blockData = blockStyle.merge(block.decorate.data);
  }
  res.blockDecorate.style = blockStyle.toObject();
  res.blockDecorate.data = blockData.toObject();

  // 确定选中的文字样式
  // 单行
  if (blockList.length === 1) {
    let block = blockList[0];
    if (!(block instanceof ContentCollection)) return res;
    if (selection.isCollapsed) {
      start.offset -= 1;
    }
    let merged = charMerge(blockList[0], start.offset, end.offset);
    if (merged) {
      res.textDecorate.style = merged[0].toObject();
      res.textDecorate.data = merged[1].toObject();
    }
    return res;
  }
  // 多行
  // 处理首尾行
  let merged = charMerge(
    blockList[0],
    start.offset,
    blockList[0].getSize() - 1
  );
  merged = charMerge(blockList[blockList.length - 1], 0, end.offset, merged);
  for (let i = 1; i < blockList.length - 1; i++) {
    const block = blockList[i];
    merged = charMerge(block, 0, block.getSize() - 1, merged);
  }
  if (merged) {
    res.textDecorate.style = merged[0].toObject();
    res.textDecorate.data = merged[1].toObject();
  }
  return res;
};

export default getSelectionInfo;
