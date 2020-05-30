export interface mapData {
  [key: string]: any;
}

const formatStyle = (styleName: string) => {
  return styleName.replace(/([A-Z])/, '-$1').toLocaleLowerCase();
};

const getStyle = (style: mapData) => {
  return Object.keys(style).map((key) => `${formatStyle(key)}:${style[key]};`);
};

const htmlBuilder = {
  buildArticle(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-draft-article";
    return `<article class="${className}" style="${getStyle(style)}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</article>`;
  },
  buildTable(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let className = "zebra-draft-table";
    return `<table class="${className}" style="${getStyle(style)}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</table>`;
  },
  buildTableRow(
    id: string,
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let className = "zebra-draft-tr";
    return `<tr class="${className}" style="${getStyle(style)}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</tr>`;
  },
  buildTableCell(
    id: string,
    cellType: 'th' | 'td',
    componentList: HTMLElement[],
    style: mapData,
    data: mapData
  ) {
    let className = `zebra-draft-${cellType}`;
    return `<${cellType} class="${className}" style="${getStyle(style)}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</${cellType}>`;
  },
  buildList(
    id: string,
    componentList: string[],
    style: mapData,
    data: mapData
  ): string {
    let className = "zebra-draft-list";
    return `<ul class="${className}" style="${getStyle(style)}">${componentList.reduce(
      (acc, item) => acc + item,
      ""
    )}</ul>`;
  },
  buildParagraph(
    id: string,
    inlineList: string[],
    style: mapData,
    data: mapData
  ): string {
    let tag = data.tag || "p";
    let className = `zebra-draft-${tag}`;
    return `<${tag} class="${className}" style="${getStyle(style)}">${inlineList.reduce(
      (acc, item) => acc + item,
      ""
    )}</${tag}>`;
  },
  buildTitle(
    id: string,
    inlineList: string[],
    style: mapData,
    data: mapData
  ): string {
    let tag = data.tag || "p";
    let className = `zebra-draft-${tag}`;
    return `<${tag} class="${className}" style="${getStyle(style)}">${inlineList.reduce(
      (acc, item) => acc + item,
      ""
    )}</${tag}>`;
  },
  buildeImage(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-draft-image`;
    return `<figure class="${className}" style="${getStyle(style)}">${image}</figure>`;
  },
  buildeAudio(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<audio src="${src}" alt="${data.alt}" />`;
    let className = `zebra-draft-image`;
    return `<figure class="${className}" style="${getStyle(style)}">${image}</figure>`;
  },
  buildeVideo(id: string, src: string, style: mapData, data: mapData): string {
    let image = `<video src="${src}" alt="${data.alt}" />`;
    let className = `zebra-draft-image`;
    return `<figure class="${className}" style="${getStyle(style)}">${image}</figure>`;
  },
  buildCharacterList(
    id: string,
    charList: string[],
    style: mapData,
    data: mapData
  ): string {
    return `<span style="${getStyle(style)}">${charList.join("")}</span>`;
  },
  buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): string {
    let image = `<img src="${src}" alt="${data.alt}" />`;
    if (data.link) {
      image = `<a href="${data.link}">${image}</a>`;
    }
    let className = `zebra-draft-inline-image`;
    return `<span class="${className}" style="${getStyle(style)}">${image}</span>`;
  },
};

export default htmlBuilder;
