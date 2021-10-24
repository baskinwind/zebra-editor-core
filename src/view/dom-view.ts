import BaseView from "./base-view";
import Editor from "../editor";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { HeadingEnum } from "../components/heading";
import { ListType } from "../components/list";
import { AnyObject } from "../decorate";

class ContentBuilder extends BaseView<HTMLElement> {
  editor: Editor;

  constructor(editor: Editor) {
    super();
    this.editor = editor;
  }

  addStyle(dom: HTMLElement, style?: AnyObject, data?: AnyObject) {
    dom.setAttribute("style", "");
    if (style) {
      for (let key in style) {
        dom.style[key] = style[key];
      }
    }
  }

  buildArticle(
    id: string,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let article = containDocument.getElementById(id);
    if (article) {
      this.addStyle(article, style, data);
      return article;
    }
    article = containDocument.createElement("article");
    article.id = id;
    article.classList.add("zebra-editor-article");
    article.dataset.type = ComponentType.article;
    article.dataset.structure = StructureType.structure;
    getChildren().forEach((component) => {
      article?.appendChild(component);
    });
    this.addStyle(article, style, data);
    return article;
  }

  buildCustomCollection(
    id: string,
    tag: string,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let collection = containDocument.getElementById(id);
    if (collection) {
      this.addStyle(collection, style, data);
      return collection;
    }
    collection = containDocument.createElement(tag);
    collection.id = id;
    collection.classList.add("zebra-editor-customer");
    collection.dataset.type = ComponentType.customerCollection;
    collection.dataset.structure = StructureType.structure;
    getChildren().forEach((component) => {
      collection?.appendChild(component);
    });
    this.addStyle(collection, style, data);
    return collection;
  }

  buildTable(
    id: string,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let figure = containDocument.getElementById(id);
    if (figure) {
      this.addStyle(figure, style, data);
      return figure;
    }
    figure = containDocument.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-editor-table");
    figure.dataset.type = ComponentType.table;
    figure.dataset.structure = StructureType.structure;
    figure.contentEditable = "false";
    const table = containDocument.createElement("table");
    getChildren().forEach((each) => table.appendChild(each));
    figure.appendChild(table);
    this.addStyle(figure, style, data);
    return figure;
  }

  buildTableRow(
    id: string,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let tr = containDocument.getElementById(id);
    if (tr) {
      this.addStyle(tr, style, data);
      return tr;
    }
    tr = containDocument.createElement("tr");
    tr.id = id;
    tr.dataset.structure = StructureType.structure;
    getChildren().forEach((each) => tr?.appendChild(each));
    this.addStyle(tr, style, data);
    return tr;
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let cell = containDocument.getElementById(id);
    if (cell) {
      this.addStyle(cell, style, data);
      return cell;
    }
    cell = containDocument.createElement(cellType);
    cell.id = id;
    cell.dataset.structure = StructureType.structure;
    cell.contentEditable = "true";
    getChildren().forEach((each) => cell?.appendChild(each));
    this.addStyle(cell, style, data);
    return cell;
  }

  buildList(
    id: string,
    listType: ListType,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let list = containDocument.getElementById(id);
    if (list && list.tagName.toLowerCase() === listType) {
      this.addStyle(list, style, data);
      return list;
    }
    list = containDocument.createElement(listType);
    list.id = id;
    list.classList.add("zebra-editor-list");
    list.dataset.type = ComponentType.list;
    list.dataset.structure = StructureType.structure;
    getChildren().forEach((component) => {
      list?.appendChild(component);
    });
    this.addStyle(list, style, data);
    return list;
  }

  buildListItem(list: HTMLElement, structureType: StructureType): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let li = containDocument.createElement("li");
    list.dataset.inList = "true";
    li.appendChild(list);
    let style: AnyObject = {};
    if (structureType !== StructureType.content) {
      style.display = "block";
    }
    this.addStyle(li, style);
    return li;
  }

  buildParagraph(
    id: string,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    const tag: string = data.tag || "p";
    let parapraph = containDocument.createElement(tag);
    parapraph.id = id;
    parapraph.classList.add(`zebra-editor-${tag}`);
    parapraph.dataset.type = ComponentType.paragraph;
    parapraph.dataset.structure = StructureType.content;
    let children = getChildren();
    if (children.length) {
      children.forEach((component) => {
        parapraph?.appendChild(component);
      });
    } else {
      parapraph.classList.add(`zebra-editor-empty`);
      parapraph.appendChild(containDocument.createTextNode("\u200b"));
    }
    this.addStyle(parapraph, style, data);
    return parapraph;
  }

  buildHeading(
    id: string,
    type: HeadingEnum,
    getChildren: () => HTMLElement[],
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let heading = containDocument.createElement(type);
    heading.id = id;
    heading.classList.add(`zebra-editor-${type}`);
    heading.dataset.type = ComponentType.heading;
    heading.dataset.structure = StructureType.content;
    let children = getChildren();
    if (children.length) {
      children.forEach((component) => {
        heading?.appendChild(component);
      });
    } else {
      heading.classList.add(`zebra-editor-empty`);
      heading.appendChild(containDocument.createTextNode("\u200b"));
    }
    this.addStyle(heading, style, data);
    return heading;
  }

  buildCodeBlock(
    id: string,
    content: string,
    language: string,
    style: AnyObject,
    data: AnyObject,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let pre = containDocument.createElement("pre");
    pre.classList.add("zebra-editor-warp-fixed", "zebra-editor-code-block");
    pre.id = id;
    pre.dataset.type = ComponentType.codeBlock;
    pre.dataset.structure = StructureType.plainText;
    const code = containDocument.createElement("code");
    code.textContent = content;
    pre.appendChild(code);
    pre.dataset.language = language;
    this.addStyle(pre, style, data);
    return pre;
  }

  buildeImage(id: string, src: string, style: AnyObject, data: AnyObject): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let figure = containDocument.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-editor-image", "zebra-editor-image-loading");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    figure.dataset.src = src;
    let child;
    let image = containDocument.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    image.style.maxWidth = "100%";
    image.style.display = "block";
    image.addEventListener("load", () => {
      figure?.classList.remove("zebra-editor-image-loading");
    });

    if (data.link) {
      figure.dataset.link = data.link;
      let link = containDocument.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    figure.appendChild(child);
    this.addStyle(figure, style, data);
    return figure;
  }

  buildeAudio(id: string, src: string, style: AnyObject, data: AnyObject): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let figure = containDocument.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-editor-image");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    let audio = containDocument.createElement("audio");
    audio.src = src;
    figure.appendChild(audio);
    this.addStyle(figure, style, data);
    return figure;
  }

  buildeVideo(id: string, src: string, style: AnyObject, data: AnyObject): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let figure = containDocument.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-editor-image");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    let video = containDocument.createElement("video");
    video.src = src;
    figure.appendChild(video);
    this.addStyle(figure, style, data);
    return figure;
  }

  buildCharacterList(id: string, text: string, style: AnyObject, data: AnyObject): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let charWrap;
    let root = containDocument.createElement(data.code ? "code" : "span");
    charWrap = root;

    if (data.bold) {
      let strong = containDocument.createElement("strong");
      charWrap.appendChild(strong);
      charWrap = strong;
    } else if (data.bold === false) {
      style.fontWeight = "normal";
    }
    if (data.italic) {
      let em = containDocument.createElement("em");
      charWrap.appendChild(em);
      charWrap = em;
    }
    if (data.deleteText) {
      let del = containDocument.createElement("del");
      charWrap.appendChild(del);
      charWrap = del;
    }
    if (data.underline) {
      let u = containDocument.createElement("u");
      charWrap.appendChild(u);
      charWrap = u;
    }
    if (data.link) {
      let link = containDocument.createElement("a");
      link.href = data.link;
      link.title = data.title || "";
      charWrap.appendChild(link);
      charWrap = link;
      link.addEventListener("click", (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey) {
          window.open(link.href);
        } else {
          event.preventDefault();
        }
      });
    }

    charWrap.innerText = text;
    this.addStyle(root, style, data);
    root.id = id;
    return root;
  }

  buildInlineImage(id: string, src: string, style: AnyObject, data: AnyObject): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let span = containDocument.getElementById(id);
    if (!span || span.dataset.src !== src || (data.link && span.dataset.link !== data.link)) {
      span = containDocument.createElement("span");
      span.contentEditable = "false";
      span.id = id;
      span.dataset.src = src;
      span.dataset.link = data.link || "";
      span.dataset.type = ComponentType.inlineImage;
      span.classList.add("zebra-editor-inline-image");
      let child;
      let image = containDocument.createElement("img");
      image.src = src;
      image.alt = data.alt || "";
      if (data.link) {
        const link = containDocument.createElement("a");
        link.href = data.link;
        link.appendChild(image);
        child = link;
      } else {
        child = image;
      }
      span.appendChild(child);
    }
    this.addStyle(span, style, data);
    return span;
  }
}

export default ContentBuilder;
