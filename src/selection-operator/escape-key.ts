// 判断不需要控制的输入
const escapeKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) return true;
  let key = event.key.toLowerCase();
  if (
    key.length === 1 ||
    key === "process" ||
    key === "enter" ||
    key === "backspace"
  ) {
    return false;
  }
  return true;
};

export default escapeKey;
