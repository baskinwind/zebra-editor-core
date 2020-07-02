import Component from "../components/component";
import Collection from "../components/collection";
import focusAt from "../rich-util/focus-at";
import getSelection from "../selection-operator/get-selection";
import updateComponent from "../util/update-component";
import { cursorType } from "../selection-operator/util";

interface recoreType {
  undoSelection: {
    start: cursorType;
    end: cursorType;
  };
  componentList: Component[];
  idList: string[];
  redoSelection: {
    start: cursorType;
    end: cursorType;
  };
}

let recoreQueue: recoreType[] = [];
let nowIndex = -1;
let nowComponentList: Component[] = [];
let nowIdList: string[] = [];
// 纯文字输入优化
let isTextRecord: boolean = false;

const getRecordStepId = () => {
  return nowIndex;
};

const initRecord = (component: Component) => {
  component.record.store();
  if (component instanceof Collection) {
    component.children.forEach((item) => initRecord(item));
  }
};

const startRecord = (start: cursorType, end: cursorType) => {
  if (nowIndex === -2) return;
  recoreQueue.splice(nowIndex + 1);
  nowComponentList = [];
  nowIdList = [];
  let newRecord = {
    undoSelection: { start, end },
    redoSelection: { start, end },
    componentList: nowComponentList,
    idList: nowIdList
  };
  recoreQueue.push(newRecord);
  nowIndex = recoreQueue.length - 1;
  setTimeout(() => {
    let selection = getSelection();
    if (nowComponentList.length === 0) {
      recoreQueue.length = recoreQueue.length - 1;
      nowIndex = recoreQueue.length - 1;
    }
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
  });
};

const createRecord = (start: cursorType, end: cursorType) => {
  isTextRecord = false;
  startRecord(start, end);
};

const createTextRecord = (start: cursorType, end: cursorType) => {
  if (isTextRecord) return;
  isTextRecord = true;
  startRecord(start, end);
};

const recordSnapshoot = (component: Component) => {
  if (nowIndex < 0) return;
  if (nowIdList.includes(component.id)) return;
  nowIdList.push(component.id);
  nowComponentList.push(component);
};

const undo = () => {
  if (nowIndex === -1) return;
  let nowRecord = recoreQueue[nowIndex];
  for (let i = nowRecord.componentList.length - 1; i >= 0; i--) {
    const item = nowRecord.componentList[i];
    item.record.restore(nowIndex - 1);
  }
  updateComponent();
  nowIndex -= 1;
  focusAt(nowRecord.undoSelection.start, nowRecord.undoSelection.end);
};

const redo = () => {
  if (nowIndex === recoreQueue.length - 1) return;
  let nowRecord = recoreQueue[nowIndex + 1];
  for (let i = nowRecord.componentList.length - 1; i >= 0; i--) {
    const item = nowRecord.componentList[i];
    item.record.restore(nowIndex + 1);
  }
  updateComponent();
  nowIndex += 1;
  focusAt(nowRecord.redoSelection.start, nowRecord.redoSelection.end);
};

// @ts-ignore
window.recoreQueue = recoreQueue;

export {
  getRecordStepId,
  initRecord,
  createRecord,
  createTextRecord,
  recordSnapshoot,
  undo,
  redo
};
