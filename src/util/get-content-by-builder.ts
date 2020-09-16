import Block from "../components/block";
import HtmlBuilder from "../content/html-builder";
import BaseBuilder from "../content/base-builder";
import { changeContentBuiler } from "../content";

// 使用特定的 Builder 生成内容
const getContentByBuilder = (
  component: Block,
  builder?: BaseBuilder,
  onlyDecorate: boolean = false,
) => {
  changeContentBuiler(builder || HtmlBuilder.getInstance());
  return component.render(onlyDecorate);
};

export default getContentByBuilder;
