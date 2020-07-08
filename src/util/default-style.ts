export default `
html,body{
  min-height: 100%;
  margin:0;
}
body{
  padding:10px;
  box-sizing: border-box;
}
*{
  box-sizing: border-box;
}
h1,h2,h3,h4,h5,h6,figure,pre,p,ul,ol{
  margin: 10px 0;
  padding: 0;
}
li>h1,li>h2,li>h3,li>h4,li>h5,li>h6,li>p,li>figure,li>pre,li>ul,li>ol{
  margin: 0;
}
a{
  color: #1890ff;
}
table td,table th{
  min-width: 2em;
  border: 1px solid #a5a5a5;
  word-break: break-all;
}
[contenteditable=true]{
  outline:none
}
.zebra-editor-page{
  min-height:100%;
  white-space:pre-wrap;
  overflow:auto;
}
.zebra-editor-placeholder{
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: -1;
  color: #ccc;
}
`;
