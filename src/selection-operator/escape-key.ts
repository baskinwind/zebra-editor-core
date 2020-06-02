// 判断不需要控制的输入
const escapeKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.isComposing) return true;
  let key = event.key.toLowerCase();
  if (key.length === 1 || key === "enter" || key === "backspace") {
    event.preventDefault();
    return false;
  }
  return true;
};

export default escapeKey;
