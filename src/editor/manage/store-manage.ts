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
    this.editor.article.$on("blockCreate", (block: Block) => {
      this.blockStore[block.id] = block;
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
