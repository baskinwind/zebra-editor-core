import Article from "../components/article";
import Paragraph from "../components/paragraph";
import Media from "../components/media";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import updateComponent from "./update-component";
import { getComponentById } from "../components/util";

const deleteSelection = (key?: string) => {
  let selection = getSelection();
  let isEnter = key === "Enter";
  let isBackspace = key === "Backspace";
  // 选取为光标，且输入不为 Enter 或 Backspace 直接返回
  if (selection.isCollapsed && !(isEnter || isBackspace)) return;
  // 删除光标前一个位置
  if (selection.isCollapsed && isBackspace) {
    let component = getComponentById(selection.range[0].id);
    // 段落的处理
    if (component instanceof Paragraph) {
      // 在第一个位置时，需要控制前一块内容
      if (selection.range[0].offset === 0) {
        let prev = component.parent?.getPrev(component);
        // 无前一块，直接返回
        if (!prev) {
          if (component.parent?.parent) {
            component.removeSelf();
            updateComponent([component]);
            component.decorate.removeData('tag');
            let index = component.parent?.parent.findChildrenIndex(component.parent);
            component.addIntoParent(component.parent?.parent, index);
            updateComponent([component]);
            focusAt({
              id: component.id,
              offset: 0,
            });
          }
          return
        };
        // 前一段为段落，则将该段落的内容放到前一段落内
        if (prev instanceof Paragraph) {
          prev.mergaParagraph(component);
          updateComponent([prev, component]);
          focusAt({
            id: prev.id,
            offset: prev.children.size - component.children.size,
          });
          return;
        }
        // 前一段为媒体文件，直接删除前一段
        if (prev instanceof Media) {
          prev.removeSelf();
          updateComponent([prev]);
          focusAt({
            id: component.id,
            offset: 0,
          });
          return;
        }
      }
      // 删除前一个字符
      component.removeChildren(selection.range[0].offset - 1);
      updateComponent(component);
      focusAt({
        id: component.id,
        offset: selection.range[0].offset - 1,
      });
      return;
    }
    // 多媒体直接删除
    if (component instanceof Media) {
      let newParagraph = new Paragraph();
      component.replaceSelf(newParagraph);
      updateComponent([component, newParagraph]);
      focusAt({
        id: newParagraph.id,
        offset: 0,
      });
      return;
    }
  }
  if (selection.isCollapsed && isEnter) {
    let component = getComponentById(selection.range[0].id);
    // 多媒体直接删除
    if (component instanceof Media) {
      if (!component.parent) return;
      let newParagraph = new Paragraph();
      let index = component.parent.findChildrenIndex(component);
      if (selection.range[0].offset === 0) {
        component.parent.addChildren(newParagraph, index);
      }
      if (selection.range[0].offset === 1) {
        component.parent.addChildren(newParagraph, index + 1);
      }
      updateComponent([component, newParagraph]);
      focusAt({
        id: newParagraph.id,
        offset: 0,
      });
      return;
    }
  }
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById<Article>("article");
  // 根据开始和结束的 id 获取所有选中的组件
  let idList = article.getIdList(start.id, end.id)[2];
  if (idList.length === 0) return;
  // 仅选中一行
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    // 段落的处理
    if (component instanceof Paragraph) {
      if (!component.parent) return;
      // 为 Enter 的处理
      if (isEnter) {
        let content = component.children.slice(end.offset).toArray();
        let index = component.parent.findChildrenIndex(component);
        let newParagraph = new Paragraph();
        newParagraph.addChildren(content, 0);
        newParagraph.addIntoParent(component.parent, index + 1);
        component.removeChildren(start.offset, component.children.size);
        updateComponent([component, newParagraph]);
        focusAt({
          id: newParagraph.id,
          offset: 0,
        });
        return;
      }
      // 其他情况直接删除选中内容
      component.removeChildren(start.offset, end.offset - start.offset);
      updateComponent(component);
      focusAt({
        id: component.id,
        offset: start.offset,
      });
      return;
    }
    // 多媒体内容直接删除，换成一个空行
    if (component instanceof Media) {
      let newParagraph = new Paragraph();
      component.replaceSelf(newParagraph);
      updateComponent([component, newParagraph]);
      focusAt({
        id: newParagraph.id,
        offset: 0,
      });
      return;
    }
    return;
  }
  // 选中多行
  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  if (!firstComponent.parent || !lastComponent.parent) return;
  let firstIndex = firstComponent.parent.findChildrenIndex(firstComponent);
  // 首行是段落，删除选中内容
  if (firstComponent instanceof Paragraph) {
    firstComponent.removeChildren(
      start.offset,
      firstComponent.children.size - 1
    );
  }
  // 首行是多媒体，直接删除
  if (firstComponent instanceof Media) {
    firstComponent.removeSelf();
  }
  // 尾行是段落，删除选中内容
  if (lastComponent instanceof Paragraph) {
    lastComponent.removeChildren(0, end.offset);
  }
  // 尾行是多媒体，直接删除
  if (lastComponent instanceof Media) {
    lastComponent.removeSelf();
  }
  // 若为 Enter 则删除中间行即可
  if (isEnter) {
    for (let i = 1; i < idList.length - 2; i++) {
      getComponentById(idList[i]).removeSelf();
    }
    updateComponent(idList.map((id) => getComponentById(id)));
    focusAt({
      id: lastComponent.id,
      offset: 0,
    });
    return;
  }

  // 其他情况
  // 首行和尾行都为段落，则需要合并
  if (
    firstComponent instanceof Paragraph &&
    lastComponent instanceof Paragraph
  ) {
    let lastContent = lastComponent.children.slice(0).toArray();
    firstComponent.addChildren(lastContent, undefined);
    for (let i = 1; i < idList.length - 1; i++) {
      getComponentById(idList[i]).removeSelf();
    }
    updateComponent(idList.map((id) => getComponentById(id)));
    focusAt({
      id: firstComponent.id,
      offset: start.offset,
    });
    return;
  }

  // 不都是段落的情况，保留一行
  // 都不是段落，则新生成一行
  for (let i = 1; i < idList.length - 2; i++) {
    getComponentById(idList[i]).removeSelf();
  }
  let updateList = idList.map((id) => getComponentById(id));
  if (!firstComponent.actived && !lastComponent.actived) {
    let newParagraph = new Paragraph();
    updateList.push(newParagraph);
    article.addChildren(newParagraph, firstIndex);
  }
  updateComponent(updateList);
  // 调整光标的位置
  if (firstComponent.actived) {
    focusAt({
      id: firstComponent.id,
      offset: start.offset,
    });
  } else if (lastComponent.actived) {
    focusAt({
      id: lastComponent.id,
      offset: 0,
    });
  } else {
    focusAt({
      id: updateList[updateList.length - 1].id,
      offset: 0,
    });
  }
  return;
};

export default deleteSelection;
