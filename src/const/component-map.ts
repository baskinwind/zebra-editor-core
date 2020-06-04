import ComponentType from "./component-type";
import Character from "../components/character";
import Paragraph from "../components/paragraph";
import List from "../components/list";
import InlineImage from "../components/inline-image";
import Media from "../components/media";
import Title from "../components/title";
import Table from "../components/table";
import Article from "../components/article";
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
  [ComponentType.image](raw: rawType) {
    return Media.create(raw);
  },
  [ComponentType.video](raw: rawType) {
    return Media.create(raw);
  },
  [ComponentType.audio](raw: rawType) {
    return Media.create(raw);
  }
};

export default ComponentMap;
