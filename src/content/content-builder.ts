import BaseBuilder, { mapData } from "./base-builder";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContainDocument } from "../selection-operator/util";

class ContentBuilder extends BaseBuilder<HTMLElement> {
  static bulider: ContentBuilder;
  static getInstance() {
    if (!this.bulider) {
      this.bulider = new ContentBuilder();
    }
    return this.bulider;
  }

  addStyle(dom: HTMLElement, style?: mapData, data?: mapData) {
    if (style) {
      for (let key in style) {
        dom.style[key] = style[key];
      }
    }
  }

  buildArticle(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    const article = containDocument.createElement("article");
    article.id = id;
    article.classList.add("zebra-draft-article");
    article.dataset.type = ComponentType.article;
    article.dataset.structure = StructureType.structure;
    this.addStyle(article, style, data);
    componentList.forEach((component) => {
      article.appendChild(component);
    });
    return article;
  }

  buildTable(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let containDocument = getContainDocument();
    const figure = containDocument.createElement("figure");
    figure.id = id;
    figure.dataset.structure = StructureType.structure;
    figure.contentEditable = "false";
    this.addStyle(figure, style, data);
    const table = containDocument.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    componentList.forEach((item) => table.appendChild(item));
    figure.appendChild(table);
    return figure;
  }

  buildTableRow(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let containDocument = getContainDocument();
    const tr = containDocument.createElement("tr");
    tr.id = id;
    tr.dataset.structure = StructureType.structure;
    this.addStyle(tr, style, data);
    componentList.forEach((item) => tr.appendChild(item));
    return tr;
  }

  buildTableCell(
    id: string,
    cellType: "th" | "td",
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let containDocument = getContainDocument();
    const td = containDocument.createElement(cellType);
    td.id = id;
    td.dataset.structure = StructureType.structure;
    td.contentEditable = "true";
    componentList.forEach((item) => td.appendChild(item));
    return td;
  }

  buildList(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let tag: string = data.tag || "ul";
    const list = containDocument.createElement(tag);
    list.id = id;
    list.classList.add("zebra-draft-list");
    list.dataset.type = ComponentType.article;
    list.dataset.structure = StructureType.structure;
    this.addStyle(list, style, data);
    componentList.forEach((component) => {
      list.appendChild(component);
    });
    return list;
  }

  buildParagraph(
    id: string,
    inlineList: HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let tag: string = data.tag || "p";
    const parapraph = containDocument.createElement(tag);
    parapraph.id = id;
    parapraph.classList.add(`zebra-draft-${tag}`);
    parapraph.dataset.type = ComponentType.paragraph;
    parapraph.dataset.structure = StructureType.content;
    this.addStyle(parapraph, style, data);
    if (inlineList.length) {
      inlineList.forEach((component) => {
        parapraph.appendChild(component);
      });
    } else {
      parapraph.appendChild(containDocument.createElement("br"));
    }
    return parapraph;
  }

  buildCode(
    id: string,
    content: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    const pre = containDocument.createElement("pre");
    pre.id = id;
    pre.classList.add(`zebra-draft-title-code`);
    pre.dataset.type = ComponentType.code;
    pre.dataset.structure = StructureType.plainText;
    this.addStyle(pre, style, data);
    const code = containDocument.createElement("code");
    code.append(content);
    code.dataset.type = ComponentType.characterList;
    code.dataset.structure = StructureType.partialContent;
    pre.appendChild(code);
    return pre;
  }

  buildeImage(id: string, src: string, style: mapData, data: mapData) {
    let containDocument = getContainDocument();
    let figure = containDocument.getElementById(id);
    if (
      !figure ||
      figure.dataset.src !== src ||
      figure.dataset.link !== data.link
    ) {
      figure = containDocument.createElement("figure");
      figure.id = id;
      figure.classList.add("zebra-draft-image");
      figure.dataset.type = ComponentType.media;
      figure.dataset.structure = StructureType.content;
      figure.dataset.src = src;
      figure.dataset.link = data.link;
    }
    this.addStyle(figure, style, data);

    let child;
    let image = containDocument.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    image.style.maxWidth = "100%";
    image.style.display = "block";
    if (data.link) {
      const link = containDocument.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    figure.appendChild(child);
    return figure;
  }

  buildeAudio(id: string, src: string, style: mapData, data: mapData) {
    let containDocument = getContainDocument();
    const figure = containDocument.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-draft-image");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    this.addStyle(figure, style, data);
    let audio = containDocument.createElement("audio");
    audio.src = src;
    figure.appendChild(audio);
    return figure;
  }

  buildeVideo(id: string, src: string, style: mapData, data: mapData) {
    let containDocument = getContainDocument();
    const figure = containDocument.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-draft-image");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    this.addStyle(figure, style, data);
    let video = containDocument.createElement("video");
    video.src = src;
    figure.appendChild(video);
    return figure;
  }

  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    let wrap = containDocument.createElement("span");
    if (data.code) {
      wrap = containDocument.createElement("code");
    }
    wrap.innerText = charList;
    this.addStyle(wrap, style, data);
    if (data.link) {
      let link = containDocument.createElement("a");
      link.href = data.link;
      link.appendChild(wrap);
      wrap = link;
      link.addEventListener("click", (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey) {
          window.open(link.href);
        } else {
          event.preventDefault();
        }
      });
    }
    wrap.id = id;
    wrap.dataset.type = ComponentType.characterList;
    wrap.dataset.structure = StructureType.partialContent;
    return wrap;
  }

  buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    let containDocument = getContainDocument();
    const span = containDocument.createElement("span");
    span.id = id;
    span.classList.add("zebra-draft-inline-image");
    span.dataset.type = ComponentType.inlineImage;
    span.dataset.structure = StructureType.partialContent;
    this.addStyle(span, style, data);
    let child;
    let image = containDocument.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    image.style.minWidth = "1em";
    if (data.link) {
      const link = containDocument.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    span.appendChild(child);
    return span;
  }
}

export default ContentBuilder;
