import focusAt from "../rich-util/focus-at";
import Component from "../components/component";
import updateComponent from "../util/update-component";
import Collection from "../components/collection";

interface recoreType {
  selection: {
    start: {
      id: string;
      offset: number;
    };
    end: {
      id: string;
      offset: number;
    };
  };
  componentList: Component[];
}

let recoreQueue: recoreType[] = [];
let nowIndex = -1;
let nowComponentList: any[] = [];
let canRecord = false;

const startRecord = () => {
  canRecord = true;
};

const initRecord = (component: Component) => {
  component.record.defaultStore();
  if (component instanceof Collection) {
    component.children.forEach((item) => initRecord(item));
  }
};

const createRecord = (start: any, end: any) => {
  if (!canRecord) return;
  recoreQueue.splice(nowIndex + 1);
  nowComponentList = [];
  let newRecord = {
    selection: { start, end },
    componentList: nowComponentList
  };
  recoreQueue.push(newRecord);
  nowIndex += 1;
};

const recordState = (component: Component) => {
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
  focusAt(nowRecord.selection.start, nowRecord.selection.end);
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
  focusAt(nowRecord.selection.start, nowRecord.selection.end);
};

export { startRecord, initRecord, createRecord, recordState, undo, redo };
