import Block from "../components/block";
import HtmlBuilder from "../content/html-builder";
import { changeContentBuiler } from "../content";

// 生成 HTML
const getHtml = (component: Block) => {
  changeContentBuiler(HtmlBuilder.getInstance());
  return component.render();
};

export default getHtml;
