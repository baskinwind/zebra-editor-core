import Editor from "../editor";
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
    return new Article(this.editor);
  }

  buildCustomCollection(tag: string = "div", children: string[] = []) {
    return new CustomCollection(tag, children, this.editor);
  }

  buildList(type: ListEnum = ListEnum.ul, children: string[] = []) {
    return new List(type, children, this.editor);
  }

  buildTable(
    row: number,
    col: number,
    head: string[] = [],
    children: (string[] | string)[][] = [],
  ) {
    return new Table(row, col, head, children, this.editor);
  }

  buildHeading(type: HeadingEnum, text?: string) {
    return new Heading(type, text, this.editor);
  }

  buildParagraph(text?: string) {
    return new Paragraph(text, this.editor);
  }

  buildMedia(mediaType: MediaType, src: string) {
    return new Media(mediaType, src, this.editor);
  }

  buildCode(content: string = "", language: string = "") {
    return new CodeBlock(content, language, this.editor);
  }

  buildInlineImage(src: string) {
    return new InlineImage(src);
  }
}

export default ComponentFactory;
