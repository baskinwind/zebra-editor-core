import modifySelectionDecorate from "../operator-selection/modify-selection-decorate";

// 一些便捷操作
const bold = () => {
  modifySelectionDecorate({}, { bold: true });
};

const deleteText = () => {
  modifySelectionDecorate({}, { deleteText: true });
};

const itailc = () => {
  modifySelectionDecorate({}, { italic: true });
};

const underline = () => {
  modifySelectionDecorate({}, { underline: true });
};

const code = () => {
  modifySelectionDecorate({}, { code: true });
};

const clearAll = () => {
  modifySelectionDecorate({ remove: "all" }, { remove: "all" });
};

const link = (link: string) => {
  if (!link) return;
  modifySelectionDecorate({}, { link });
};

const unlink = () => {
  modifySelectionDecorate({}, { remove: "link" });
};

export { bold, deleteText, itailc, underline, code, link, unlink, clearAll };
