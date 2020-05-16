const onClick = (event: MouseEvent) => {
  let target: HTMLElement = event.target as HTMLElement;
  // 修复点击图片未选中图片的问题
  if (target && target.nodeName === "IMG") {
    let section = window.getSelection();
    try {
      section?.removeAllRanges();
    } catch {}
    let range = new Range();
    range.selectNode(target);
    section?.addRange(range);
  }
};

export default onClick;
