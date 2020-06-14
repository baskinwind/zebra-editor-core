export interface mapData {
  [key: string]: any;
}

abstract class BaseBuilder<T> {
  private constructor() {}

  abstract buildArticle(
    id: string,
    componentList: T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildTable(
    id: string,
    componentList: T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildTableRow(
    id: string,
    componentList: T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildTableCell(
    id: string,
    cellType: "th" | "td",
    componentList: T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildList(
    id: string,
    componentList: T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildParagraph(
    id: string,
    inlineList: T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildCode(id: string, content: string, style: any, data: any): T;

  abstract buildeImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): T;

  abstract buildeAudio(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): T;

  abstract buildeVideo(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): T;

  abstract buildCharacterList(
    id: string,
    charList: string,
    style: mapData,
    data: mapData
  ): T;

  abstract buildInlineImage(
    id: string,
    src: string,
    style: mapData,
    data: mapData
  ): T;
}

export default BaseBuilder;
