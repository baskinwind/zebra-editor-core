export const getJsTextLengthFromUtf8Offset = (
  text: string | null | undefined,
  index: number,
): number => {
  let sureList = [...(text || "")];
  return sureList.slice(0, index).join("").length;
};

export const getUtf8TextLengthFromJsOffset = (
  text: string | null | undefined,
  offset?: number,
): number => {
  if (!text) return 0;
  return [...text.substr(0, offset)].filter((each) => each.charCodeAt(0) !== 8203).length;
};
