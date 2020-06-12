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
  redoSelection: {
    start: cursorType;
    end: cursorType;
  };
}

let recoreQueue: recoreType[] = [];
let nowIndex = -1;
let nowComponentList: any[] = [];

const getRecordStepId = () => {
  return nowIndex;
};

const initComponentRecord = (component: Component) => {
  component.record.store();
  if (component instanceof Collection) {
    component.children.forEach((item) => initComponentRecord(item));
  }
};

const initRecord = (component: Component) => {
  nowIndex = 0;
  initComponentRecord(component);
};

const createRecord = (start: cursorType, end: cursorType) => {
  if (nowIndex === -1) return;
  recoreQueue.splice(nowIndex + 1);
  nowComponentList = [];
  let newRecord = {
    undoSelection: { start, end },
    componentList: nowComponentList,
    redoSelection: { start, end }
  };
  recoreQueue.push(newRecord);
  nowIndex = recoreQueue.length - 1;
  setTimeout(() => {
    let selection = getSelection();
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
  });
};

const recordSnapshoot = (component: Component) => {
  if (nowIndex === -1) return;
  nowComponentList.push(component);
};

const undo = () => {
  if (nowIndex === -1) {
    focusAt();
    return;
  }
  let nowRecord = recoreQueue[nowIndex];
  nowRecord.componentList.forEach((item) => {
    item.record.undo(nowIndex);
  });
  updateComponent();
  nowIndex -= 1;
  focusAt(nowRecord.undoSelection.start, nowRecord.undoSelection.end);
};

const redo = () => {
  if (nowIndex >= recoreQueue.length - 1) {
    focusAt();
    return;
  }
  let nowRecord = recoreQueue[nowIndex + 1];
  nowRecord.componentList.forEach((item) => {
    item.record.redo(nowIndex);
  });
  updateComponent();
  nowIndex += 1;
  focusAt(nowRecord.redoSelection.start, nowRecord.redoSelection.end);
};

export {
  getRecordStepId,
  initRecord,
  createRecord,
  recordSnapshoot,
  undo,
  redo
};
