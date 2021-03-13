import Editor from "../editor/editor";
import { StoreData } from "../decorate";
import Article from "./article";
import List, { listType } from "./list";
import Table from "./table";
import Header, { headerType } from "./header";
import Paragraph from "./paragraph";
import Media, { mediaType } from "./media";
import CodeBlock from "./code-block";
import InlineImage from "./inline-image";
import ComponentType from "../const/component-type";
import CustomerCollection from "./customer-collection";

class ComponentFactory {
  static bulider: ComponentFactory;
  static getInstance(editor?: Editor) {
    if (!this.bulider) {
      this.bulider = new ComponentFactory(editor);
    }
    return this.bulider;
  }

  typeMap: { [key: string]: any };

  editor?: Editor;

  constructor(editor?: Editor) {
    this.editor = editor;
    this.typeMap = {
      [ComponentType.article]: Article,
      [ComponentType.list]: List,
      [ComponentType.table]: Table,
      [ComponentType.header]: Header,
      [ComponentType.paragraph]: Paragraph,
      [ComponentType.media]: Media,
      [ComponentType.code]: CodeBlock,
      [ComponentType.inlineImage]: InlineImage,
    };
  }

  buildArticle(style: StoreData = {}, data: StoreData = {}) {
    return new Article(style, data);
  }

  buildCustomerCollection(
    tag: string = "div",
    children: string[] = [],
    style: StoreData = {},
    data: StoreData = {},
  ) {
    return new CustomerCollection(tag, children, style, data);
  }

  buildList(
    type: listType = "ul",
    children: string[] = [],
    style: StoreData = {},
    data: StoreData = {},
  ) {
    return new List(type, children, style, data);
  }

  buildTable(
    row: number,
    col: number,
    head: string[] = [],
    children: (string[] | string)[][] = [],
    style: StoreData = {},
    data: StoreData = {},
  ) {
    return new Table(row, col, head, children, style, data);
  }

  buildHeader(
    type: headerType,
    text?: string,
    style: StoreData = {},
    data: StoreData = {},
  ) {
    return new Header(type, text, style, data);
  }

  buildParagraph(text?: string, style: StoreData = {}, data: StoreData = {}) {
    return new Paragraph(text, style, data);
  }

  buildMedia(
    mediaType: mediaType,
    src: string,
    style: StoreData = {},
    data: StoreData = {},
  ) {
    return new Media(mediaType, src, style, data);
  }

  buildCode(
    content: string = "",
    language: string = "",
    style: StoreData = {},
    data: StoreData = {},
  ) {
    return new CodeBlock(content, language, style, data);
  }

  buildInlineImage(src: string, style: StoreData = {}, data: StoreData = {}) {
    return new InlineImage(src, style, data);
  }
}

const getDefaultComponentFactory = (): ComponentFactory =>
  ComponentFactory.getInstance();

export default ComponentFactory;

export { getDefaultComponentFactory };
