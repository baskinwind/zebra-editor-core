// 判断不需要控制的输入
const escapeKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.isComposing) return true;
  let key = event.key;
  let reg = /^Arrow/;
  if (reg.test(key)) return true;
  event.preventDefault();
  return false;
};

export default escapeKey;
