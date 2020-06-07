import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";

export interface mapData {
  [key: string]: any;
}

const addStyle = (dom: HTMLElement, style?: mapData) => {
  if (style) {
    for (let key in style) {
      dom.style[key] = style[key];
    }
  }
};

const contentBuilder = {
  buildArticle(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    const article = document.createElement("article");
    article.id = id;
    article.classList.add("zebra-draft-article");
    article.dataset.type = ComponentType.article;
    article.dataset.structure = StructureType.structure;
    addStyle(article, style);
    componentList.forEach((component) => {
      article.appendChild(component);
    });
    return article;
  },
  buildTable(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    const table = document.createElement("table");
    table.id = id;
    table.dataset.structure = StructureType.structure;
    addStyle(table, style);
    if (style) {
      for (let key in style) {
        table.style[key] = style[key];
      }
    }
    componentList.forEach((item) => table.appendChild(item));
    return table;
  },
  buildTableRow(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    const tr = document.createElement("tr");
    tr.id = id;
    tr.dataset.structure = StructureType.structure;
    addStyle(tr, style);
    if (style) {
      for (let key in style) {
        tr.style[key] = style[key];
      }
    }
    componentList.forEach((item) => tr.appendChild(item));
    return tr;
  },
  buildTableCell(
    id: string,
    cellType: "th" | "td",
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    const td = document.createElement(cellType);
    td.id = id;
    td.dataset.structure = StructureType.structure;
    addStyle(td, style);
    if (style) {
      for (let key in style) {
        td.style[key] = style[key];
      }
    }
    componentList.forEach((item) => td.appendChild(item));
    return td;
  },
  buildList(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let tag = data.tag || "ul";
    const list = document.createElement(tag);
    list.id = id;
    list.classList.add("zebra-draft-list");
    list.dataset.type = ComponentType.article;
    list.dataset.structure = StructureType.structure;
    addStyle(list, style);
    componentList.forEach((component) => {
      list.appendChild(component);
    });
    return list;
  },
  buildParagraph(
    id: string,
    inlineList: HTMLElement[],
    style: mapData,
    data: mapData
  ): HTMLElement {
    let tag = data.tag || "p";
    const parapraph = document.createElement(tag);
    parapraph.id = id;
    parapraph.classList.add(`zebra-draft-${tag}`);
    parapraph.dataset.type = ComponentType.paragraph;
    parapraph.dataset.structure = StructureType.content;
    addStyle(parapraph, style);
    if (inlineList.length) {
      inlineList.forEach((component) => {
        parapraph.appendChild(component);
      });
    } else {
      parapraph.appendChild(document.createElement("br"));
    }
    return parapraph;
  },
  buildCode(
    id: string,
    content: string,
    style: any,
    data: any
  ): HTMLElement {
    const pre = document.createElement('pre');
    pre.id = id;
    pre.classList.add(`zebra-draft-title-code`);
    pre.dataset.type = ComponentType.code;
    pre.dataset.structure = StructureType.content;
    addStyle(pre, style);
    const code = document.createElement('code');
    code.append(content);
    code.dataset.type = ComponentType.characterList;
    code.dataset.structure = StructureType.partialContent;
    pre.appendChild(code);
    return pre;
  },
  buildeImage(id: string, src: string, style: mapData, data: mapData) {
    const figure = document.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-draft-image", "zebra-draft-image-loading");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    addStyle(figure, style);
    let child;
    let image = document.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    image.style.maxWidth = "100%";
    image.style.display = "block";
    image.addEventListener("load", () => {
      figure.classList.remove("zebra-draft-image-loading");
    });
    if (data.link) {
      const link = document.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    figure.appendChild(child);
    return figure;
  },
  buildeAudio(id: string, src: string, style: mapData, data: mapData) {
    const figure = document.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-draft-image");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    addStyle(figure, style);
    let audio = document.createElement("audio");
    audio.src = src;
    figure.appendChild(audio);
    return figure;
  },
  buildeVideo(id: string, src: string, style: mapData, data: mapData) {
    const figure = document.createElement("figure");
    figure.id = id;
    figure.classList.add("zebra-draft-image");
    figure.dataset.type = ComponentType.media;
    figure.dataset.structure = StructureType.content;
    addStyle(figure, style);
    let video = document.createElement("video");
    video.src = src;
    figure.appendChild(video);
    return figure;
  },
  buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    const span = document.createElement("span");
    span.id = id;
    span.dataset.type = ComponentType.characterList;
    span.dataset.structure = StructureType.partialContent;
    addStyle(span, style);
    if (data.link) {
      let link = document.createElement('a');
      link.href = data.link;
      link.innerText = charList;
      span.appendChild(link);
    } else {
      span.innerText = charList;
    }
    return span;
  },
  buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): HTMLElement {
    const span = document.createElement("span");
    span.id = id;
    span.classList.add("zebra-draft-inline-image");
    span.dataset.type = ComponentType.inlineImage;
    span.dataset.structure = StructureType.partialContent;
    addStyle(span, style);
    let child;
    let image = document.createElement("img");
    image.src = src;
    image.alt = data.alt || "";
    image.style.minWidth = "1em";
    if (data.link) {
      const link = document.createElement("a");
      link.href = data.link;
      link.appendChild(image);
      child = link;
    } else {
      child = image;
    }
    span.appendChild(child);
    return span;
  }
};

export default contentBuilder;
