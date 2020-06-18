import Paragraph from "../components/paragraph";
import Title from "../components/title";
import Code from "../components/code";
import List from "../components/list";
import exchangeComponent from "../selection-operator/exchange-component";
import modifySelectionDecorate from "../selection-operator/modify-selection-decorate";

// 一些便捷操作
const bold = () => {
  modifySelectionDecorate({ fontWeight: "bold" }, { bold: true });
};

const deleteText = () => {
  modifySelectionDecorate({ textDecoration: "line-through" }, { delete: true });
};

const itailc = () => {
  modifySelectionDecorate({ fontStyle: "italic" }, { itailc: true });
};

const underline = () => {
  modifySelectionDecorate({ textDecoration: "underline" }, { underline: true });
};

const code = () => {
  modifySelectionDecorate(
    {
      background: "#f8f8f8",
      padding: "2px 4px",
      borderRadius: "2px"
    },
    { code: true }
  );
};

const color = (color: string) => {
  modifySelectionDecorate({ color: color });
};

const bgColor = (color: string) => {
  modifySelectionDecorate({ backgroundColor: color });
};

const clearAllStyle = () => {
  modifySelectionDecorate(
    { remove: "all" },
    { remove: "bold,delete,itailc,underline,code" }
  );
};

const link = (link: string) => {
  if (!link) return;
  modifySelectionDecorate({}, { link });
};

const unlink = () => {
  modifySelectionDecorate({}, { remove: "link" });
};

type exchangeType = "paragraph" | "title" | "list" | "code";

const classMap = {
  paragraph: Paragraph,
  title: Title,
  list: List,
  code: Code
};

const exchange = (type: exchangeType, args: any[]) => {
  exchangeComponent(classMap[type] || Paragraph, args);
};

export {
  bold,
  deleteText,
  itailc,
  underline,
  code,
  color,
  bgColor,
  link,
  unlink,
  clearAllStyle,
  exchange
};
