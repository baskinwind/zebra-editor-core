import { Operator } from "../components/component";
import { focusAt } from "../selection-operator/selection";

export default {
  "ADDCHILDREN:PARAGRAPH"(event: Operator) {
    console.log(event);
    if (event.tiggerBy === "onkeydown") {
      // 以下内容非必要，强制更新 DOM 元素，使得表现一致。
      document
        .getElementById(event.action.id)
        ?.replaceWith(event.action.render());
      focusAt(event.action.id, event.index + event.target.length);
    }
  },
  "REMOVECHILDREN:PARAGRAPH"(event: Operator) {
    console.log(event);
    if (event.tiggerBy === "onkeydown") {
      // 以下内容非必要，强制更新 DOM 元素，使得表现一致。
      // event.preventDefault();
      // 更新 DOM 内容
      // document.getElementById(component.id)?.replaceWith(component.getContent());
      // 设置光标位置
      // focusAt(component.id, start);
    }
  },
  "SUBPARAGRAPH:PARAGRAPH"(event: Operator) {
    console.log(event);
    // 生成新段落，并放在老段落后面
    let oldDom = document.getElementById(event.action.id);
    let newDom = event.target[0].render();
    if (oldDom?.nextElementSibling) {
      oldDom.parentElement?.insertBefore(newDom, oldDom.nextElementSibling);
    } else {
      oldDom?.parentElement?.appendChild(newDom);
    }
    oldDom?.replaceWith(event.action.render());
    // 设置光标位置
    focusAt(event.target[0].id, 0);
  },
};
