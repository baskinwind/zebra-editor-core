import Component from "../components/component";
import Block from "../components/block";
import Editor from "../editor";
import nextTick from "./next-tick";
import StructureType from "../const/structure-type";
import Inline from "../components/inline";
import ComponentType from "../const/component-type";

const getWrapDom = (containDocument: Document, id: string): HTMLElement | null => {
  let element = containDocument.getElementById(id);
  if (element?.dataset.inList) {
    return element!.parentElement!;
  }
  return element;
};

const getParentDom = (containDocument: Document, id: string): HTMLElement | null => {
  let element = containDocument.getElementById(id);
  if (element?.dataset.wrap) {
    return element!.children[0] as HTMLElement;
  }
  return element;
};

const recallQueue: [string, HTMLElement, HTMLElement][] = [];

const handleRecallQueue = (editor: Editor) => {
  let containDocument = editor.mountedDocument;

  while (recallQueue.length) {
    const [afterComId, newDom, parentDom] = recallQueue.pop()!;

    let afterDom = getWrapDom(containDocument, afterComId);
    if (afterDom) {
      parentDom.insertBefore(newDom, afterDom);
    } else {
      recallQueue.push([afterComId, newDom, parentDom]);
    }
  }
};

let inLoop = false;

// 更新组件
const updateComponent = (editor: Editor, ...componentList: Component[]) => {
  if (!editor.mountedDocument) return;

  componentList.forEach((each) => update(editor, each));

  handleRecallQueue(editor);

  // 避免过度触发 editorChange 事件
  if (!inLoop) {
    inLoop = true;
    nextTick(() => {
      inLoop = false;
      document.dispatchEvent(new Event("editorChange"));
    });
  }
};

const update = (editor: Editor, component: Component) => {
  if (component.type === ComponentType.article) return;

  let containDocument = editor.mountedDocument;
  let oldDom = getWrapDom(containDocument, component.id);

  // 失效节点清除已存在的 DOM
  if (!component.parent) {
    if (oldDom) {
      oldDom.remove();
    }
    return;
  }

  let inList = component.parent.type === ComponentType.list;
  let newDom: HTMLElement = component.render(editor.contentBuilder);
  if (inList) {
    newDom = editor.contentBuilder.buildListItem(
      component.render(editor.contentBuilder),
      component.structureType,
    );
  }

  if (component instanceof Inline) {
    if (oldDom) {
      oldDom.replaceWith(newDom);
    } else if (component.parent) {
      update(editor, component.parent);
    }
    return;
  }

  if (component instanceof Block) {
    // 若结构组件的 DOM 元素已经存在则不需要更新
    if (component.active && component.structureType === StructureType.structure && oldDom) return;

    if (oldDom) {
      if (component.active) {
        oldDom?.replaceWith(newDom);
      } else {
        oldDom?.remove();
      }
      return;
    }

    let parentComponent = component.parent;
    let parentDom = getParentDom(containDocument, parentComponent.id);

    // 未找到父组件对应的元素时，更新父组件
    if (!parentDom) {
      update(editor, parentComponent);
      return;
    }

    // 将该组件插入到合适的位置
    let index = parentComponent.findChildrenIndex(component);
    if (index === parentComponent.getSize() - 1) {
      parentDom.appendChild(newDom);
    } else {
      let afterComId = parentComponent.getChild(index + 1).id;
      let afterDom = getWrapDom(containDocument, afterComId);
      if (afterDom) {
        parentDom.insertBefore(newDom, afterDom);
      } else {
        recallQueue.push([afterComId, newDom, parentDom]);
      }
    }
  }
};

export default updateComponent;
