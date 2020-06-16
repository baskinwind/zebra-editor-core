import Paragraph from "../components/paragraph";
import Title from "../components/title";
import Code from "../components/code";
import List from "../components/list";
import exchangeComponent from "../selection-operator/exchange-component";
import modifySelectionDecorate from "../selection-operator/modify-selection-decorate";

// 一些便捷操作
const bold = () => {
  modifySelectionDecorate({ fontWeight: "bold" });
};

const deleteText = () => {
  modifySelectionDecorate({ textDecoration: "line-through" });
};

const itailc = () => {
  modifySelectionDecorate({ fontStyle: "italic" });
};

const underline = () => {
  modifySelectionDecorate({ textDecoration: "underline" });
};

const color = (color: string) => {
  modifySelectionDecorate({ color: color });
};

const bgColor = (color: string) => {
  modifySelectionDecorate({ backgroundColor: color });
};

const clearAllStyle = () => {
  modifySelectionDecorate({ remove: "all" });
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
  color,
  bgColor,
  link,
  unlink,
  clearAllStyle,
  exchange
};
