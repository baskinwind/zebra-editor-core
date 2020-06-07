import ComponentType from "./component-type";
import Article from "../components/article";
import Table from "../components/table";
import List from "../components/list";
import Paragraph from "../components/paragraph";
import Title from "../components/title";
import Media from "../components/media";
import Code from "../components/code";
import { rawType } from "../components/component";

const ComponentMap = {
  [ComponentType.article](raw: rawType) {
    let article = Article.create(raw);
    let children = raw.children
      ? raw.children.map((item) => ComponentMap[item.type](item))
      : [];
    article.add(children, 0, true);
    return article;
  },
  [ComponentType.table](raw: rawType) {
    return Table.create(raw);
  },
  [ComponentType.list](raw: rawType) {
    return List.create(raw);
  },
  [ComponentType.title](raw: rawType) {
    return Title.create(raw);
  },
  [ComponentType.paragraph](raw: rawType) {
    return Paragraph.create(raw);
  },
  [ComponentType.media](raw: rawType) {
    return Media.create(raw);
  },
  [ComponentType.code](raw: rawType) {
    return Code.create(raw);
  }
};

export default ComponentMap;
