import Collection from "../../components/collection";
import Component from "../../components/component";
import { Cursor } from "../../selection/util";
import focusAt from "../../selection/focus-at";
import updateComponent from "../../util/update-component";
import Editor from "../editor";

interface recoreType {
  componentList: Component[];
  idList: string[];
  selection: {
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

  constructor(editor: Editor) {
    this.editor = editor;
  }

  init() {
    this.recordStack = [];
    this.nowStackIndex = -1;
    this.createRecordStack();
    this.initComponentRecord(this.editor.article);
    this.editor.article.$on("componentSnapshot", (component: Component) => {
      this.recordSnapshoot(component);
    });
  }

  initComponentRecord(component: Component) {
    component.record.init();
    component.record.store(this.nowStackIndex);
    if (component instanceof Collection) {
      component.children.forEach((each) => this.initComponentRecord(each));
    }
  }

  createRecordStack() {
    this.nowRecordStack = {
      componentList: [],
      idList: [],
      selection: {
        start: { id: "", offset: -1 },
        end: { id: "", offset: -1 },
      },
    };
    this.recordStack.push(this.nowRecordStack);
  }

  createRecord(start: Cursor, end: Cursor) {
    this.nowRecordStack.selection = {
      start,
      end,
    };
    this.createRecordStack();

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

  recordSnapshoot(component: Component) {
    if (this.nowStackIndex < 0) return;
    component.record.store(this.nowStackIndex);
    if (this.nowRecordStack.idList.includes(component.id)) return;
    this.nowRecordStack.idList.push(component.id);
    this.nowRecordStack.componentList.push(component);
  }

  undo() {
    if (this.nowStackIndex === -1) return;
    let nowRecord = this.recordStack[this.nowStackIndex];
    for (let i = 0; i < nowRecord.componentList.length; i++) {
      const each = nowRecord.componentList[i];
      each.record.restore(this.nowStackIndex - 1);
    }

    // 将延迟更新的组件一起更新
    updateComponent(this.editor);
    this.nowStackIndex -= 1;
    focusAt(this.editor.mountedWindow, nowRecord.selection.start, nowRecord.selection.end);
  }

  redo() {
    if (this.nowStackIndex === this.recordStack.length - 1) return;
    let nowRecord = this.recordStack[this.nowStackIndex + 1];
    for (let i = 0; i < nowRecord.componentList.length; i++) {
      const each = nowRecord.componentList[i];
      each.record.restore(this.nowStackIndex + 1);
    }

    // 将延迟更新的组件一起更新
    updateComponent(this.editor);
    this.nowStackIndex += 1;
    focusAt(this.editor.mountedWindow, nowRecord.selection.start, nowRecord.selection.end);
  }

  getNowRecordId() {
    return this.nowStackIndex;
  }
}

export default HistoryManage;
