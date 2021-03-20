export default `
html, body {
  height: 100%;
  margin: 0;
}
body {
  padding: 10px;
  box-sizing: border-box;
  font-family: -apple-system;
  line-height: 1.3;
  font-size: 16px;
}
* {
  box-sizing: border-box;
}
[contenteditable="true"] {
  outline: none;
}
.zebra-editor-image-loading {
  position: relative;
  background: #f8f8f8;
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
#zebra-editor-contain {
  min-height: 100%;
  white-space: pre-wrap;
}
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
figure {
  margin: 1em 0;
}
pre {
  position: relative;
  padding: 10px;
  font-size: 14px;
  border-radius: 4px;
  background-color: rgba(248, 248, 248, 1);
}
pre::before {
  z-index: 10;
  content: attr(data-language);
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 12px;
  text-transform: uppercase;
  color: #ccc;
}
a {
  color: #1890ff;
}
th, td {
  border: 1px solid #ccc;
  padding: 0;
  min-width: 2em;
}
table p {
  margin: 4px 0;
}
p:not(.zebra-editor-code-block) code {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: .9em;
  background-color: #f8f8f8;
}
`;
