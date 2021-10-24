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

  buildArticle() {
    let article = new Article();
    article.setEditor(this.editor);
    return article;
  }

  buildCustomCollection(tag: string = "div", children: string[] = []) {
    let customCollection = new CustomCollection(tag, children);
    customCollection.setEditor(this.editor);
    return customCollection;
  }

  buildList(type: ListEnum = ListEnum.ul, children: string[] = []) {
    let list = new List(type, children);
    list.setEditor(this.editor);
    return list;
  }

  buildTable(
    row: number,
    col: number,
    head: string[] = [],
    children: (string[] | string)[][] = [],
  ) {
    let table = new Table(row, col, head, children);
    table.setEditor(this.editor);
    return table;
  }

  buildHeading(type: HeadingEnum, text?: string) {
    let heading = new Heading(type, text);
    heading.setEditor(this.editor);
    return heading;
  }

  buildParagraph(text?: string) {
    let paragraph = new Paragraph(text);
    paragraph.setEditor(this.editor);
    return paragraph;
  }

  buildMedia(mediaType: MediaType, src: string) {
    let media = new Media(mediaType, src);
    media.setEditor(this.editor);
    return media;
  }

  buildCode(content: string = "", language: string = "") {
    let code = new CodeBlock(content, language);
    code.setEditor(this.editor);
    return code;
  }

  buildInlineImage(src: string) {
    let image = new InlineImage(src);
    return image;
  }
}

const getDefaultComponentFactory = (): ComponentFactory => ComponentFactory.getInstance();

export default ComponentFactory;

export { getDefaultComponentFactory };
