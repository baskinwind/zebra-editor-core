export default {
  getSelectRange() {
    let section = window.getSelection();
    let anchorEle = section?.anchorNode;
    let anchorOffect = section?.anchorOffset;
    console.log(section);
    console.log((anchorEle as any).dataset);

    debugger;
    while (
      anchorEle?.nodeType === 3 ||
      (anchorEle as any).dataset.type !== "PARAGRAPH"
    ) {
      anchorEle = anchorEle?.parentElement;
    }
    for (let i = 0; i < (anchorEle ? anchorEle.childNodes.length : 0); i++) {
      const element = anchorEle?.childNodes[i];
      if (element === section?.anchorNode?.parentElement) break;
      anchorOffect += (element as any).innerText?.length || 0;
    }
    console.log(anchorEle, anchorOffect);

    return {
      startCollection: "1234",
      startIndex: 2,
      endCollection: "1234",
      endIndex: 8,
      rang: ["1344", "1234", "1234"],
    };
  },
};
