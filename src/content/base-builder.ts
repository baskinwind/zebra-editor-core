import { nextTicket } from "../components/util";

export interface mapData {
  [key: string]: any;
}

abstract class BaseBuilder<T = any> {
  protected constructor() {}

  protected updateDecorate: boolean = false;

  setUpdateDecorate() {
    this.updateDecorate = true;
    nextTicket(() => (this.updateDecorate = false));
  }

  abstract buildArticle(
    id: string,
    getChildren: () => T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildTable(
    id: string,
    getChildren: () => T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildTableRow(
    id: string,
    getChildren: () => T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildList(
    id: string,
    getChildren: () => T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildListItem(
    id: string,
    getChildren: () => T,
    style: mapData,
    data: mapData
  ): T;

  abstract buildParagraph(
    id: string,
    getChildren: () => T[],
    style: mapData,
    data: mapData
  ): T;

  abstract buildCode(
    id: string,
    content: string,
    language: string,
    style: mapData,
    data: mapData
  ): T;

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
