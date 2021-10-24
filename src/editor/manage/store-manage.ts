import Block from "../../components/block";
import { walkTree } from "../../util";
import Editor from "..";

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
  }

  getBlockById(id: string): Block {
    return this.blockStore[id];
  }
}

export default StoreManage;
