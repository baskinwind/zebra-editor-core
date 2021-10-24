import Component from "../../components/component";
import { Cursor } from "../../selection/util";
import focusAt from "../../selection/focus-at";
import getSelection from "../../selection/get-selection";
import { walkTree } from "../../util/walk-tree";
import Editor from "..";

interface recoreType {
  componentList: Map<string, Component>;
  startSelection: {
    start: Cursor;
    end: Cursor;
  };
  endSelection: {
    start: Cursor;
    end: Cursor;
  };
}

class HistoryManage {
  editor: Editor;
  // 历史栈
  recordStack: recoreType[] = [];
  // 当前编辑态栈的位置
  nowStackIndex: number = 0;
  // 最新的历史栈
  nowRecordStack!: recoreType;
  // 是否在一次 eventLoop 中
  inLoop = false;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  init() {
    this.recordStack = [];
    this.nowStackIndex = -1;
    this.createRecordStack();

    walkTree(this.editor.article, (each) => {
      each.record.store(this.nowStackIndex);
    });

    this.editor.article.$on("componentWillChange", () => {
      this.createRecord();
    });

    this.editor.article.$on("updateComponent", (componentList: Component[]) => {
      componentList.forEach((each) => this.recordSnapshoot(each));
    });
  }

  createRecordStack() {
    this.nowRecordStack = {
      componentList: new Map(),
      startSelection: {
        start: { id: "", offset: -1 },
        end: { id: "", offset: -1 },
      },
      endSelection: {
        start: { id: "", offset: -1 },
        end: { id: "", offset: -1 },
      },
    };
    this.recordStack.push(this.nowRecordStack);
    this.nowStackIndex += 1;
  }

  createRecord() {
    if (this.inLoop) return;

    // 清除历史快照，重做后在进行编辑会触发该情况
    if (this.nowStackIndex < this.recordStack.length) {
      // 清除组件内无效的历史快照
      for (let i = this.nowStackIndex + 1; i < this.recordStack.length; i++) {
        let componentList = this.recordStack[i].componentList;
        componentList.forEach((each) => {
          each.record.clear(this.nowStackIndex + 1);
        });
      }
      // 清除全局历史栈中无效的历史
      this.recordStack.splice(this.nowStackIndex + 1);
    }

    this.createRecordStack();
    this.inLoop = true;
    let selection = getSelection(this.editor);
    this.nowRecordStack.startSelection = {
      start: selection.range[0],
      end: selection.range[1],
    };

    setTimeout(() => {
      this.inLoop = false;
      let selection = getSelection(this.editor);
      this.nowRecordStack.endSelection = {
        start: selection.range[0],
        end: selection.range[1],
      };
    });
  }

  recordSnapshoot(component: Component) {
    component.record.store(this.nowStackIndex);
    this.nowRecordStack.componentList.set(component.id, component);
  }

  canUndo() {
    return this.nowStackIndex !== 0;
  }

  canRedo() {
    return this.nowStackIndex !== this.recordStack.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    let nowRecord = this.recordStack[this.nowStackIndex];
    nowRecord.componentList.forEach((each) => {
      each.record.restore(this.nowStackIndex - 1);
    });
    this.editor.updateComponent(this.editor, ...nowRecord.componentList.values());
    this.nowStackIndex -= 1;
    focusAt(this.editor, nowRecord.startSelection.start, nowRecord.startSelection.end);
  }

  redo() {
    if (!this.canRedo()) return;
    let nowRecord = this.recordStack[this.nowStackIndex + 1];
    nowRecord.componentList.forEach((each) => {
      each.record.restore(this.nowStackIndex + 1);
    });
    this.editor.updateComponent(this.editor, ...nowRecord.componentList.values());
    this.nowStackIndex += 1;
    focusAt(this.editor, nowRecord.endSelection.start, nowRecord.endSelection.end);
  }
}

export default HistoryManage;
