import { storeData } from "../decorate";
import Article from "./article";
import List, { listType } from "./list";
import Table from "./table";
import Title, { titleType } from "./title";
import Paragraph from "./paragraph";
import Media, { mediaType } from "./media";
import Code from "./code";
import InlineImage from "./inline-image";
import ComponentType from "../const/component-type";

class ComponentFactory {
  static bulider: ComponentFactory;
  static getInstance() {
    if (!this.bulider) {
      this.bulider = new ComponentFactory();
    }
    return this.bulider;
  }

  typeMap: { [key: string]: any };

  protected constructor() {
    this.typeMap = {
      [ComponentType.article]: Article,
      [ComponentType.list]: List,
      [ComponentType.table]: Table,
      [ComponentType.title]: Title,
      [ComponentType.paragraph]: Paragraph,
      [ComponentType.media]: Media,
      [ComponentType.code]: Code,
      [ComponentType.inlineImage]: InlineImage
    };
  }

  buildArticle(style: storeData = {}, data: storeData = {}) {
    return new Article(style, data);
  }

  buildList(
    type: listType = "ul",
    children: string[] = [],
    style: storeData = {},
    data: storeData = {}
  ) {
    return new List(type, children, style, data);
  }

  buildTable(
    row: number,
    col: number,
    children: (string[] | string)[][] = [],
    needHead: boolean = true,
    style: storeData = {},
    data: storeData = {}
  ) {
    return new Table(row, col, children, needHead, style, data);
  }

  buildTitle(
    type: titleType,
    text?: string,
    style: storeData = {},
    data: storeData = {}
  ) {
    return new Title(type, text, style, data);
  }

  buildParagraph(text?: string, style: storeData = {}, data: storeData = {}) {
    return new Paragraph(text, style, data);
  }

  buildMedia(
    mediaType: mediaType,
    src: string,
    style: storeData = {},
    data: storeData = {}
  ) {
    return new Media(mediaType, src, style, data);
  }

  buildCode(
    content: string = "",
    language: string = "",
    style: storeData = {},
    data: storeData = {}
  ) {
    return new Code(content, language, style, data);
  }

  buildInlineImage(src: string, style: storeData = {}, data: storeData = {}) {
    return new InlineImage(src, style, data);
  }
}

let nowFactory = ComponentFactory.getInstance();

const setComponentFactory = (factory: ComponentFactory) => {
  nowFactory = factory;
};

const getComponentFactory = () => nowFactory;

export default ComponentFactory;

export { setComponentFactory, getComponentFactory };
