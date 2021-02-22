import Block from "../../components/block";
import Editor from "../editor";

class StoreManage {
  editor: Editor;
  blockStore: { [key: string]: Block } = {};

  constructor(editor: Editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    this.blockStore = {};
    this.editor.article.$on("blockCreated", (block: Block) => {
      this.blockStore[block.id] = block;
      block.editor = this.editor;
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
