import ComponentType from "./component-type";
import Character from "../components/character";
import Paragraph from "../components/paragraph";
import List, { ListItem } from "../components/list";
import InlineImage from "../components/inline-image";
import Media from "../components/media";
import Title from "../components/title";
import Table, { TableItem } from "../components/table";
import Article from "../components/article";

const ComponentMap = {
  [ComponentType.character]: Character,
  [ComponentType.inlineImage]: InlineImage,
  [ComponentType.image]: Media,
  [ComponentType.video]: Media,
  [ComponentType.audio]: Media,
  [ComponentType.paragraph]: Paragraph,
  [ComponentType.title]: Title,
  [ComponentType.list]: List,
  [ComponentType.listItem]: ListItem,
  [ComponentType.table]: Table,
  [ComponentType.tableItem]: TableItem,
  [ComponentType.article]: Article
};

export default ComponentMap;
