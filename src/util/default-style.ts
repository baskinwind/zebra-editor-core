export default `
html,body{
  min-height: 100%;
  margin:0;
}
body{
  padding:10px;
  box-sizing: border-box;
  font-family: -apple-system;
  line-height: 1.4;
}
*{
  box-sizing: border-box;
}
h1,h2,h3,h4,h5,h6,figure,p,ul,ol,blockquote{
  margin: 10px 0;
  padding: 0;
}
li>h1,li>h2,li>h3,li>h4,li>h5,li>h6,li>p,li>ul,li>ol{
  margin: 0;
}
table p{
  margin: 0;
}
a{
  color: #1890ff;
}
pre{
  position: relative;
}
pre::before{
  z-index:10;
  content: attr(data-language);
  position: absolute;
  right: 10px;
  top: 10px;
  text-transform: uppercase;
  color: #ccc;
}
table td,table th{
  min-width: 2em;
  border: 1px solid #a5a5a5;
  word-break: break-all;
}
[contenteditable=true]{
  outline:none
}
.zebra-editor-image-loading{
  position: relative;
  background: #f8f8f8;
}
.zebra-editor-image-loading img{
  height: 40px;
}
.zebra-editor-image-loading:before{
  content: '···图片加载中···';
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
.zebra-editor-placeholder{
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: -1;
  color: #ccc;
}
#zebra-editor-contain{
  min-height:100%;
  white-space:pre-wrap;
}
`;
