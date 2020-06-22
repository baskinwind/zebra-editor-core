export default `
html,body{
  min-height:100%;
  margin:0;
}
body{
  padding:10px;
  box-sizing:border-box;
}
.zebra-editor-page{
  min-height:100%;
  white-space:pre-wrap;
  overflow:auto;
}
table td, table th{
  min-width:2em;
  border: 1px solid #a5a5a5;
  word-break: break-all;
}
[contenteditable=true]{
  outline:none
}
p,h1,h2,h3,h4,h5,h6,figure,table,ol,ul,pre{
  margin:10px 0;
}
.zebra-editor-placeholder{
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: -1;
  color: #ccc;
}
`;
