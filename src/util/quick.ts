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
  modifySelectionDecorate(
    {
      backgroundColor: "rgba(248, 248, 248, 1)",
      padding: "2px 4px",
      borderRadius: "2px"
    },
    { code: true }
  );
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
