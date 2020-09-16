enum StructureType {
  // 结构组件，比如 List Table TableRow 等
  structure = "STRUCTURE",
  // 内容组件，比如 Paragraph Header 等
  content = "CONTENT",
  // 多媒体组件
  media = "MEDIA",
  // 单元组件，内容组件由单元组件组成，比如 Character InlineImage 等
  unit = "UNIT",
  // 纯文本组件，代码块
  plainText = "PLAINTEXT",
  // 部分内容组件，用于在 html 上标识
  partialContent = "PARTIALCONTENT",
  // 不可编辑的组件
  canNotEdit = "CANNOTEDIT",
}

export default StructureType;
