import Component from "../components/component";
import Collection from "../components/collection";
import focusAt from "../operator-selection/focus-at";
import getSelection, {
  getBeforeSelection
} from "../operator-selection/get-selection";
import updateComponent from "../util/update-component";
import { cursorType } from "../operator-selection/util";
import nextTicket from "../util/next-ticket";

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

// 历史栈
let recoreQueue: recoreType[] = [];
// 当前栈
let newRecord: recoreType;
// 当前历史记录的位置
let nowIndex = -1;
// 当前记录的组件
let nowComponentList: Component[] = [];
// 当前记录的组件的 ID
let nowIdList: string[] = [];
// 纯文字输入优化：是否是在一个持续记录的状态中
let isDurationRecord: boolean = false;
// 优化：在一个 event loop 中记录最多只能发生一次
let isInLoop: boolean = false;

const getRecordStepId = () => {
  return nowIndex;
};

const initRecord = (component: Component) => {
  recoreQueue = [];
  nowIndex = -1;
  nowComponentList = [];
  nowIdList = [];
  component.record.init();
  component.record.store();
  if (component instanceof Collection) {
    component.children.forEach((item) => initRecord(item));
  }
};

const startRecord = (start: cursorType, end: cursorType) => {
  if (isInLoop) return;
  isInLoop = true;
  nextTicket(() => {
    isInLoop = false;
  });
  if (nowIndex === -2) return;
  for (let i = nowIndex + 1; i < recoreQueue.length; i++) {
    let componentList = recoreQueue[i].componentList;
    componentList.forEach((item) => {
      item.record.clear(nowIndex + 1);
    });
  }
  recoreQueue.splice(nowIndex + 1);
  nowComponentList = [];
  nowIdList = [];
  newRecord = {
    undoSelection: { start, end },
    redoSelection: { start, end },
    componentList: nowComponentList,
    idList: nowIdList
  };
  recoreQueue.push(newRecord);
  nowIndex = recoreQueue.length - 1;
  return newRecord;
};

const createRecord = (start?: cursorType, end?: cursorType) => {
  if (isDurationRecord) {
    let selection = getSelection();
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
    isDurationRecord = false;
  }
  if (!start || !end) {
    let selection = getBeforeSelection();
    start = selection.range[0];
    end = selection.range[1];
  }
  if (isDurationRecord) {
    let selection = getSelection();
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
    isDurationRecord = false;
  }
  startRecord(start, end);
  setTimeout(() => {
    let selection = getSelection();
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
  });
};

const createDurationRecord = (start: cursorType, end: cursorType) => {
  if (isDurationRecord) return;
  isDurationRecord = true;
  startRecord(start, end);
};

const recordSnapshoot = (component: Component) => {
  if (nowIndex < 0) return;
  if (nowIdList.includes(component.id)) return;
  nowIdList.push(component.id);
  nowComponentList.push(component);
};

const undo = () => {
  if (isDurationRecord) {
    let selection = getSelection();
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
    isDurationRecord = false;
  }
  if (nowIndex === -1) return;
  let nowRecord = recoreQueue[nowIndex];
  for (let i = 0; i < nowRecord.componentList.length; i++) {
    const item = nowRecord.componentList[i];
    item.record.restore(nowIndex - 1);
  }
  // 将延迟更新的组件一起更新
  updateComponent();
  nowIndex -= 1;
  focusAt(nowRecord.undoSelection.start, nowRecord.undoSelection.end);
};

const redo = () => {
  if (isDurationRecord) {
    let selection = getSelection();
    newRecord.redoSelection = {
      start: selection.range[0],
      end: selection.range[1]
    };
    isDurationRecord = false;
  }
  if (nowIndex === recoreQueue.length - 1) return;
  let nowRecord = recoreQueue[nowIndex + 1];
  for (let i = 0; i < nowRecord.componentList.length; i++) {
    const item = nowRecord.componentList[i];
    item.record.restore(nowIndex + 1);
  }
  // 将延迟更新的组件一起更新
  updateComponent();
  nowIndex += 1;
  focusAt(nowRecord.redoSelection.start, nowRecord.redoSelection.end);
};

export {
  getRecordStepId,
  initRecord,
  createRecord,
  createDurationRecord,
  recordSnapshoot,
  undo,
  redo
};
