import Editor from "../editor";
import { StoreData } from "../decorate";
import Article from "./article";
import List, { ListType } from "./list";
import Table from "./table";
import Heading, { HeadingType } from "./heading";
import Paragraph from "./paragraph";
import Media, { mediaType } from "./media";
import CodeBlock from "./code-block";
import InlineImage from "./inline-image";
import ComponentType from "../const/component-type";
import CustomCollection from "./custom-collection";

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
      [ComponentType.heading]: Heading,
      [ComponentType.paragraph]: Paragraph,
      [ComponentType.media]: Media,
      [ComponentType.codeBlock]: CodeBlock,
      [ComponentType.inlineImage]: InlineImage,
      [ComponentType.customerCollection]: CustomCollection,
    };
  }

  buildArticle(style: StoreData = {}, data: StoreData = {}) {
    let article = new Article(style, data);
    article.setEditor(this.editor);
    return article;
  }

  buildCustomCollection(
    tag: string = "div",
    children: string[] = [],
    style: StoreData = {},
    data: StoreData = {},
  ) {
    let customCollection = new CustomCollection(tag, children, style, data);
    customCollection.setEditor(this.editor);
    return customCollection;
  }

  buildList(
    type: ListType = "ul",
    children: string[] = [],
    style: StoreData = {},
    data: StoreData = {},
  ) {
    let list = new List(type, children, style, data);
    list.setEditor(this.editor);
    return list;
  }

  buildTable(
    row: number,
    col: number,
    head: string[] = [],
    children: (string[] | string)[][] = [],
    style: StoreData = {},
    data: StoreData = {},
  ) {
    let table = new Table(row, col, head, children, style, data);
    table.setEditor(this.editor);
    return table;
  }

  buildHeading(type: HeadingType, text?: string, style: StoreData = {}, data: StoreData = {}) {
    let heading = new Heading(type, text, style, data);
    heading.setEditor(this.editor);
    return heading;
  }

  buildParagraph(text?: string, style: StoreData = {}, data: StoreData = {}) {
    let paragraph = new Paragraph(text, style, data);
    paragraph.setEditor(this.editor);
    return paragraph;
  }

  buildMedia(mediaType: mediaType, src: string, style: StoreData = {}, data: StoreData = {}) {
    let media = new Media(mediaType, src, style, data);
    media.setEditor(this.editor);
    return media;
  }

  buildCode(
    content: string = "",
    language: string = "",
    style: StoreData = {},
    data: StoreData = {},
  ) {
    let code = new CodeBlock(content, language, style, data);
    code.setEditor(this.editor);
    return code;
  }

  buildInlineImage(src: string, style: StoreData = {}, data: StoreData = {}) {
    let image = new InlineImage(src, style, data);
    return image;
  }
}

const getDefaultComponentFactory = (): ComponentFactory => ComponentFactory.getInstance();

export default ComponentFactory;

export { getDefaultComponentFactory };
