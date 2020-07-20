import Article from "../components/article";
import createEditor, { IOption } from "./create-editor";
import createEmptyArticle from "./create-empty-article";
import { setContentBuilder } from "../content";
import ComponentFactory, {
  setComponentFactory,
  getComponentFactory
} from "../components";
import { createError } from "./handle-error";

// 将组件挂载到某个节点上
const mount = (
  idOrDom: string | HTMLElement,
  article?: Article | ((factory: ComponentFactory) => Article),
  option?: IOption
) => {
  // 设置内容生成器以及组件工厂
  setContentBuilder(option?.contentBuilder);
  setComponentFactory(option?.componentFactory);

  if (!article) article = createEmptyArticle();
  if (article instanceof Function) {
    article = article(getComponentFactory());
  }
  let root;
  if (typeof idOrDom === "string") {
    root = document.getElementById(idOrDom);
  } else {
    root = idOrDom;
  }
  if (!root)
    throw createError("请传入正确的节点或节点 id", undefined, "create");
  return createEditor(root, article, option);
};

export default mount;
