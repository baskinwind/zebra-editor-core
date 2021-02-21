import { storeData } from "../decorate";
import Article from "./article";
import List, { listType } from "./list";
import Table from "./table";
import Header, { headerType } from "./header";
import Paragraph from "./paragraph";
import Media, { mediaType } from "./media";
import Code from "./code";
import InlineImage from "./inline-image";
import ComponentType from "../const/component-type";
import CustomerCollection from "./customer-collection";
import Editor from "../editor/editor";
import Block from "./block";

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
      [ComponentType.code]: Code,
      [ComponentType.inlineImage]: InlineImage,
    };
  }

  addEditor(block: Block) {
    block.editor = this.editor;
  }

  buildArticle(style: storeData = {}, data: storeData = {}) {
    const block = new Article(style, data);
    this.addEditor(block);
    return block;
  }

  buildCustomerCollection(
    tag: string = "div",
    children: string[] = [],
    style: storeData = {},
    data: storeData = {},
  ) {
    const block = new CustomerCollection(tag, children, style, data);
    this.addEditor(block);
    return block;
  }

  buildList(
    type: listType = "ul",
    children: string[] = [],
    style: storeData = {},
    data: storeData = {},
  ) {
    const block = new List(type, children, style, data);
    this.addEditor(block);
    return block;
  }

  buildTable(
    row: number,
    col: number,
    children: (string[] | string)[][] = [],
    needHead: boolean = true,
    style: storeData = {},
    data: storeData = {},
  ) {
    const block = new Table(row, col, children, needHead, style, data);
    this.addEditor(block);
    return block;
  }

  buildHeader(
    type: headerType,
    text?: string,
    style: storeData = {},
    data: storeData = {},
  ) {
    const block = new Header(type, text, style, data);
    this.addEditor(block);
    return block;
  }

  buildParagraph(text?: string, style: storeData = {}, data: storeData = {}) {
    const block = new Paragraph(text, style, data);
    this.addEditor(block);
    return block;
  }

  buildMedia(
    mediaType: mediaType,
    src: string,
    style: storeData = {},
    data: storeData = {},
  ) {
    const block = new Media(mediaType, src, style, data);
    this.addEditor(block);
    return block;
  }

  buildCode(
    content: string = "",
    language: string = "",
    style: storeData = {},
    data: storeData = {},
  ) {
    const block = new Code(content, language, style, data);
    this.addEditor(block);
    return block;
  }

  buildInlineImage(src: string, style: storeData = {}, data: storeData = {}) {
    return new InlineImage(src, style, data);
  }
}

const getDefaultComponentFactory = (): ComponentFactory =>
  ComponentFactory.getInstance();

export default ComponentFactory;

export { getDefaultComponentFactory };
