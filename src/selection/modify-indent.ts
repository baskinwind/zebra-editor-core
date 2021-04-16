import Editor from "../editor";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getSelectedIdList } from "./get-selected-id-list";
import Block from "../components/block";
import ComponentType from "../const/component-type";
import { ListEnum } from "../components/list";

const indent = (editor: Editor, block: Block) => {
  while (
    block.parent?.type !== ComponentType.list &&
    block.parent?.type !== ComponentType.article
  ) {
    block = block.getParent();
  }

  let parent = block.getParent();
  let prev = parent.getPrev(block);
  let next = parent.getNext(block);
  if (prev?.type === ComponentType.list) {
    block.sendTo(prev);
    if (next?.type === ComponentType.list) {
      next.sendTo(prev);
    }
  } else if (next?.type === ComponentType.list) {
    block.removeSelf();
    next.add(0, block);
  } else {
    let newList = editor.componentFactory.buildList(ListEnum.ul);
    block.replaceSelf(newList);
    newList.add(0, block);
  }
  return block;
};

// 取消缩进
const outdent = (editor: Editor, block: Block) => {
  while (
    block.parent?.type !== ComponentType.list &&
    block.parent?.type !== ComponentType.article
  ) {
    block = block.getParent();
  }

  let parent = block.getParent();
  if (parent.type === ComponentType.article) {
    return block;
  }
  let index = parent.findChildrenIndex(block);
  block.removeSelf();
  parent.split(index, block);
  return block;
};

// 修改选中组件的缩进
const modifyIndent = (editor: Editor, isOutdent: boolean = false) => {
  let selection = getSelection(editor.mountedWindow);
  let start = selection.range[0];
  let end = selection.range[1];
  let idList = getSelectedIdList(editor.article, start.id, end.id);
  let newStartId: string = "";
  let newEndId: string = "";

  idList.forEach((each, index) => {
    let block = editor.storeManage.getBlockById(each);
    if (isOutdent) {
      block = outdent(editor, block);
    } else {
      block = indent(editor, block);
    }
    if (index === 0) {
      newStartId = block.id;
    }
    if (index === idList.length - 1) {
      newEndId = block.id;
    }
  });

  focusAt(
    editor.mountedWindow,
    { id: newStartId, offset: start.offset },
    { id: newEndId, offset: end.offset },
  );
};

export default modifyIndent;
