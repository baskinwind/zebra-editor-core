export default `
html, body {
  height: 100%;
}
body {
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  font-size: 16px;
  line-height: 1.15;
}
* {
  box-sizing: border-box;
}
article {
  overflow: auto
}
[contenteditable="true"] {
  outline: none;
}

#zebra-editor-contain {
  height: 100%;
  white-space: pre-wrap;
  overflow: auto;
}

/** loading 态的图片显示效果 */
.zebra-editor-image-loading {
  position: relative;
  background: rgba(248, 248, 248, 1);
}
.zebra-editor-image-loading img {
  height: 40px;
}
.zebra-editor-image-loading:before {
  content: "···图片加载中···";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 100%;
  line-height: 40px;
  text-align: center;
  color: #ccc;
}

/** placeholder */
.zebra-editor-article > :first-child {
  position: relative;
}
.zebra-editor-article > :first-child.zebra-editor-empty::before {
  content: '开始你的故事 ...';
  color: #ccc;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
}

pre {
  padding: 10px;
  border-radius: 4px;
  font-size: .9em;
  background-color: rgba(248, 248, 248, 1);
}

th, td {
  border: 1px solid #ccc;
  min-width: 2em;
}

p:not(.zebra-editor-code-block) code {
  padding: 2px 2px;
  border-radius: 2px;
  font-size: .9em;
  background-color: rgba(248, 248, 248, 1);
}
`;
