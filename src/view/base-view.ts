import StructureType from "../const/structure-type";
import { HeadingEnum } from "../components/heading";
import { ListType } from "../components/list";
import { AnyObject } from "../decorate";

abstract class AbstractView<T extends any = any> {
  constructor() {
    this.init();
  }

  init() {}

  abstract buildArticle(id: string, getChildren: () => T[], style: AnyObject, data: AnyObject): T;

  abstract buildCustomCollection(
    id: string,
    tag: string,
    getChildren: () => T[],
    style: AnyObject,
    data: AnyObject,
  ): T;

  abstract buildTable(id: string, getChildren: () => T[], style: AnyObject, data: AnyObject): T;

  abstract buildTableRow(id: string, getChildren: () => T[], style: AnyObject, data: AnyObject): T;

  abstract buildTableCell(
    id: string,
    cellType: "th" | "td",
    getChildren: () => T[],
    style: AnyObject,
    data: AnyObject,
  ): T;

  abstract buildList(
    id: string,
    listType: ListType,
    getChildren: () => T[],
    style: AnyObject,
    data: AnyObject,
  ): T;

  abstract buildListItem(list: T, structureType: StructureType): T;

  abstract buildParagraph(id: string, getChildren: () => T[], style: AnyObject, data: AnyObject): T;

  abstract buildHeading(
    id: string,
    type: HeadingEnum,
    getChildren: () => T[],
    style: AnyObject,
    data: AnyObject,
  ): T;

  abstract buildCodeBlock(
    id: string,
    content: string,
    language: string,
    style: AnyObject,
    data: AnyObject,
  ): T;

  abstract buildeImage(id: string, src: string, style: AnyObject, data: AnyObject): T;

  abstract buildeAudio(id: string, src: string, style: AnyObject, data: AnyObject): T;

  abstract buildeVideo(id: string, src: string, style: AnyObject, data: AnyObject): T;

  abstract buildCharacterList(id: string, text: string, style: AnyObject, data: AnyObject): T;

  abstract buildInlineImage(id: string, src: string, style: AnyObject, data: AnyObject): T;
}

export default AbstractView;
