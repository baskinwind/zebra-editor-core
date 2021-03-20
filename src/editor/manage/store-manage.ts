import Block from "../../components/block";
import { walkTree } from "../../util/walk-tree";
import Editor from "../editor";

class StoreManage {
  editor: Editor;
  blockStore: { [key: string]: Block } = {};

  constructor(editor: Editor) {
    this.editor = editor;
  }

  init() {
    this.blockStore = {};
    walkTree(this.editor.article, (each) => {
      this.blockStore[each.id] = each;
    });

    this.editor.article.$on("blockCreated", (block: Block) => {
      this.blockStore[block.id] = block;
    });
    this.editor.article.$on("blockDestoryed", (block: Block) => {
      block.editor = undefined;
    });
  }

  saveBlock(block: Block) {
    this.blockStore[block.id] = block;
  }

  getBlockById(id: string): Block {
    return this.blockStore[id];
  }
}

export default StoreManage;
