import BaseBuilder, { mapData } from "./base-builder";
import Editor from "../editor/editor";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { headerType } from "../components/header";
import { listType } from "../components/list";

class ContentBuilder extends BaseBuilder<HTMLElement> {
  editor: Editor;

  constructor(editor: Editor) {
    super();
    this.editor = editor;
  }

  addStyle(dom: HTMLElement, style?: mapData, data?: mapData) {
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
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let article = containDocument.createElement("article");
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

  buildCustomerCollection(
    id: string,
    tag: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let collection = containDocument.createElement(tag);
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
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let figure = containDocument.createElement("figure");
    figure.id = id;
    figure.dataset.structure = StructureType.structure;
    figure.contentEditable = "false";
    const table = containDocument.createElement("table");
    table.style.minWidth = "100%";
    table.style.borderCollapse = "collapse";
    getChildren().forEach((item) => table.appendChild(item));
    figure.appendChild(table);
    this.addStyle(figure, style, data);
    return figure;
  }

  buildTableRow(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let tr = containDocument.createElement("tr");
    tr.id = id;
    tr.dataset.structure = StructureType.structure;
    getChildren().forEach((item) => tr?.appendChild(item));
    this.addStyle(tr, style, data);
    return tr;
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let cell = containDocument.createElement(cellType);
    cell.id = id;
    cell.dataset.structure = StructureType.structure;
    cell.contentEditable = "true";
    getChildren().forEach((item) => cell?.appendChild(item));
    this.addStyle(cell, style, data);
    return cell;
  }

  buildList(
    id: string,
    listType: listType,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let tag: string = listType;
    let list = containDocument.createElement(tag);
    list.id = id;
    list.classList.add("zebra-editor-list");
    list.dataset.type = ComponentType.article;
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
    li.appendChild(list);
    let style: mapData = {};
    if (structureType !== StructureType.content) {
      style.display = "block";
    }
    this.addStyle(li, style);
    return li;
  }

  buildParagraph(
    id: string,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData,
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
      parapraph.appendChild(containDocument.createElement("br"));
    }
    this.addStyle(parapraph, style, data);
    return parapraph;
  }

  buildHeader(
    id: string,
    type: headerType,
    getChildren: () => HTMLElement[],
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let header = containDocument.createElement(type);
    header.id = id;
    header.classList.add(`zebra-editor-${type}`);
    header.dataset.type = ComponentType.header;
    header.dataset.structure = StructureType.content;
    let children = getChildren();
    if (children.length) {
      children.forEach((component) => {
        header?.appendChild(component);
      });
    } else {
      header.classList.add(`zebra-editor-empty`);
      header.appendChild(containDocument.createElement("br"));
    }
    this.addStyle(header, style, data);
    return header;
  }

  buildCodeBlock(
    id: string,
    content: string,
    language: string,
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    // FIXED: Chrome 下，如果代码块的下一个内容块不是 p 标签时，
    // 下一行在首字母进行中文输入后按下删除键，那一行会被删除，
    // 这个行为阻止不了，但在代码块外加上 p 标签即可修复这个问题。
    // magic code
    let wrap = containDocument.createElement("p");
    wrap.classList.add("zebra-editor-warp-fixed", "zebra-editor-code");
    wrap.id = id;
    wrap.dataset.type = ComponentType.code;
    wrap.dataset.structure = StructureType.plainText;
    let pre = containDocument.createElement("pre");
    wrap.appendChild(pre);
    const code = containDocument.createElement("code");
    code.textContent = content;
    code.dataset.type = ComponentType.characterList;
    code.dataset.structure = StructureType.partialContent;
    pre.appendChild(code);
    pre.dataset.language = language;
    this.addStyle(pre, style, data);
    return wrap;
  }

  buildeImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData,
  ): HTMLElement {
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

  buildeAudio(
    id: string,
    src: string,
    style: mapData,
    data: mapData,
  ): HTMLElement {
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

  buildeVideo(
    id: string,
    src: string,
    style: mapData,
    data: mapData,
  ): HTMLElement {
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

  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData,
  ): HTMLElement {
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

    charWrap.innerText = charList;
    this.addStyle(root, style, data);
    root.id = id;
    root.dataset.type = ComponentType.characterList;
    root.dataset.structure = StructureType.partialContent;
    return root;
  }

  buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData,
  ): HTMLElement {
    let containDocument = this.editor.mountedDocument;
    let span = containDocument.getElementById(id);
    if (
      !span ||
      span.dataset.src !== src ||
      (data.link && span.dataset.link !== data.link)
    ) {
      span = containDocument.createElement("span");
      span.contentEditable = "false";
      span.id = id;
      span.dataset.src = src;
      span.dataset.link = data.link || "";
      span.dataset.type = ComponentType.inlineImage;
      span.dataset.structure = StructureType.partialContent;
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
