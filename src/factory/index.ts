import Editor from "../editor";
import { AnyObject } from "../decorate";
import {
  ComponentType,
  Article,
  Table,
  Heading,
  Paragraph,
  Media,
  CodeBlock,
  InlineImage,
  ListEnum,
  HeadingEnum,
  MediaType,
  CustomCollection,
  List,
} from "../components";

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

  buildArticle(style: AnyObject = {}, data: AnyObject = {}) {
    let article = new Article(style, data);
    article.setEditor(this.editor);
    return article;
  }

  buildCustomCollection(
    tag: string = "div",
    children: string[] = [],
    style: AnyObject = {},
    data: AnyObject = {},
  ) {
    let customCollection = new CustomCollection(tag, children, style, data);
    customCollection.setEditor(this.editor);
    return customCollection;
  }

  buildList(
    type: ListEnum = ListEnum.ul,
    children: string[] = [],
    style: AnyObject = {},
    data: AnyObject = {},
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
    style: AnyObject = {},
    data: AnyObject = {},
  ) {
    let table = new Table(row, col, head, children, style, data);
    table.setEditor(this.editor);
    return table;
  }

  buildHeading(type: HeadingEnum, text?: string, style: AnyObject = {}, data: AnyObject = {}) {
    let heading = new Heading(type, text, style, data);
    heading.setEditor(this.editor);
    return heading;
  }

  buildParagraph(text?: string, style: AnyObject = {}, data: AnyObject = {}) {
    let paragraph = new Paragraph(text, style, data);
    paragraph.setEditor(this.editor);
    return paragraph;
  }

  buildMedia(mediaType: MediaType, src: string, style: AnyObject = {}, data: AnyObject = {}) {
    let media = new Media(mediaType, src, style, data);
    media.setEditor(this.editor);
    return media;
  }

  buildCode(
    content: string = "",
    language: string = "",
    style: AnyObject = {},
    data: AnyObject = {},
  ) {
    let code = new CodeBlock(content, language, style, data);
    code.setEditor(this.editor);
    return code;
  }

  buildInlineImage(src: string, style: AnyObject = {}, data: AnyObject = {}) {
    let image = new InlineImage(src, style, data);
    return image;
  }
}

const getDefaultComponentFactory = (): ComponentFactory => ComponentFactory.getInstance();

export default ComponentFactory;

export { getDefaultComponentFactory };
