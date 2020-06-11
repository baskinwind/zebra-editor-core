import focusAt from "../rich-util/focus-at";
import Component from "../components/component";
import StructureCollection from "../components/structure-collection";
import updateComponent from "../util/update-component";
import getSelection from "../selection-operator/get-selection";
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
let canRecord = false;

const startRecord = () => {
  canRecord = true;
};

const getRecordStatus = () => {
  return canRecord;
};

const initRecord = (component: Component) => {
  component.record.store();
  if (component instanceof StructureCollection) {
    component.children.forEach((item) => initRecord(item));
  }
};

const createRecord = (start: cursorType, end: cursorType) => {
  if (!canRecord) return;
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
  if (!canRecord) return;
  nowComponentList.push(component);
};

const undo = () => {
  if (!canRecord) return;
  if (nowIndex === -1) {
    focusAt();
    return;
  }
  let nowRecord = recoreQueue[nowIndex];
  nowRecord.componentList.forEach((item) => {
    item.record.undo();
  });
  updateComponent();
  nowIndex -= 1;
  focusAt(nowRecord.undoSelection.start, nowRecord.undoSelection.end);
};

const redo = () => {
  if (!canRecord) return;
  if (nowIndex >= recoreQueue.length - 1) {
    focusAt();
    return;
  }
  let nowRecord = recoreQueue[nowIndex + 1];
  nowRecord.componentList.forEach((item) => {
    item.record.redo();
  });
  updateComponent();
  nowIndex += 1;
  focusAt(nowRecord.redoSelection.start, nowRecord.redoSelection.end);
};

export { startRecord, getRecordStatus, initRecord, createRecord, recordSnapshoot, undo, redo };
