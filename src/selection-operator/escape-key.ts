const escapeKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) return true;
  let key = event.key;
  let reg = /^Arrow/;
  if (reg.test(key)) return true;
  event.preventDefault();
  return false;
}

export default escapeKey;