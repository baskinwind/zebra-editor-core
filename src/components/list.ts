import Editor from "../editor";
import { OperatorType, JSONType } from "./component";
import { CollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import ComponentType from "../const/component-type";
import { AnyObject } from "../decorate";
import AbstractView from "../view/base-view";
import ComponentFactory from "../factory";

export enum ListType {
  ol = "ol",
  ul = "ul",
}

export interface ListSnapshoot extends CollectionSnapshoot<Block> {
  listType: ListType;
}

class List extends StructureCollection<Block> {
  type = ComponentType.list;
  listType: ListType;

  static create(componentFactory: ComponentFactory, json: JSONType): List {
    let children = (json.children || []).map((each: JSONType) =>
      componentFactory.typeMap[each.type].create(each),
    );

    let list = componentFactory.buildList(json.listType);
    list.add(0, ...children);
    return list;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Block[] {
    let parent = block.getParent();
    if (parent.type === ComponentType.list) {
      (parent as List).setListType(args[0]);
      return [block];
    }

    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    if (parent.type === ComponentType.list && (prev as List).listType === args[0]) {
      (prev as List).add(-1, block);
    } else {
      let newList = componentFactory.buildList(args[0]);
      newList.add(0, block);
      parent.add(index, newList);
    }
    return [block];
  }

  constructor(type: ListType = ListType.ul, children: string[] = [], editor?: Editor) {
    super(editor);
    this.listType = type;
    this.add(0, ...children.map((each) => this.getComponentFactory().buildParagraph(each)));
  }

  setListType(type: ListType = ListType.ul) {
    if (type === this.listType) return;
    this.componentWillChange();
    this.listType = type;
    this.updateComponent([this]);
  }

  add(index: number, ...blockList: Block[]): OperatorType {
    index = index < 0 ? this.getSize() + 1 + index : index;

    // 连续输入空行，截断列表
    if (
      index > 1 &&
      blockList.length === 1 &&
      blockList[0].isEmpty() &&
      this.getChild(index - 1).isEmpty()
    ) {
      this.getChild(index - 1).removeSelf();
      let operator = this.split(index - 1, ...blockList);
      return operator;
    }

    return super.add(index, ...blockList);
  }

  childHeadDelete(block: Block): OperatorType {
    let index = this.findChildrenIndex(block);

    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return;
      return block.sendTo(prev);
    }

    block.removeSelf();
    let parent = this.getParent();
    let parentIndex = parent.findChildrenIndex(this);
    return parent.add(parentIndex, block);
  }

  sendTo(block: Block): OperatorType {
    return block.receive(this);
  }

  receive(block: Block): OperatorType {
    block.removeSelf();

    if (block instanceof List) {
      return this.add(-1, ...block.children);
    } else {
      if (block.isEmpty()) {
        let last = this.getChild(this.getSize() - 1);
        let lastSize = last.getSize();
        return [{ id: last.id, offset: lastSize }];
      }

      return this.add(-1, block);
    }
  }

  snapshoot(): ListSnapshoot {
    let snap = super.snapshoot() as ListSnapshoot;
    snap.listType = this.listType;
    return snap;
  }

  restore(state: ListSnapshoot) {
    this.listType = state.listType;
    super.restore(state);
  }

  createEmpty(): List {
    const list = this.getComponentFactory().buildList(this.listType, []);
    list.modifyDecorate(this.decorate.copyStyle(), this.decorate.copyData());
    return list;
  }

  getType(): string {
    return `${this.type}>${this.listType}`;
  }

  getJSON(): JSONType {
    let json = super.getJSON();
    json.listType = this.listType;
    return json;
  }

  render(contentView: AbstractView) {
    let content = contentView.buildList(
      this.id,
      this.listType,
      () => {
        return this.children.toArray().map((each) => {
          return contentView.buildListItem(each.render(contentView), each.structureType);
        });
      },
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
    return content;
  }
}

export default List;
