import ComponentType from "./component-type";
import Article from "../components/article";
import Table from "../components/table";
import List from "../components/list";
import Paragraph from "../components/paragraph";
import Title from "../components/title";
import Media from "../components/media";
import Code from "../components/code";
import { IRawType } from "../components/component";

const ComponentMap = {
  [ComponentType.article](raw: IRawType) {
    return Article.create(raw);
  },
  [ComponentType.table](raw: IRawType) {
    return Table.create(raw);
  },
  [ComponentType.list](raw: IRawType) {
    return List.create(raw);
  },
  [ComponentType.title](raw: IRawType) {
    return Title.create(raw);
  },
  [ComponentType.paragraph](raw: IRawType) {
    return Paragraph.create(raw);
  },
  [ComponentType.media](raw: IRawType) {
    return Media.create(raw);
  },
  [ComponentType.code](raw: IRawType) {
    return Code.create(raw);
  }
};

export default ComponentMap;
