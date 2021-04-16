# ZebraEditorCore

ZebraEditorCore 是[斑码编辑器](https://zebrastudio.tech)剔除 `UI` 框架，纯粹的富文本编辑器，该项目将焦点关注于编辑器最为关键的部分！

## 使用

```
yarn add zebra-editor-core

# or

npm i zebra-editor-core
```

```
import { mount } from "zebra-editor-core"

mount('root');
```

## DEMO

[demo](https://acohome.cn/demo/zebra-editor-core/index.html)

## 为什么？

目前，市面上流行的富文本编辑器主要有三大类：

1. `Markdown` 编辑器：结构清晰，但功能有限，比如不能给文字加颜色，设置段落的样式等等。

2. 基于 `contenteditable` 的 `Html` 富文本编辑器，如 `CKEditor` 。功能强大，但不受控，生成的 `Html` 过于混乱，掌控不了文章内容，虽能获取 `Html`，但却控制不了 `Html` 的结构，不能直接生成非 `Html` 结构，局限性很大，只能做 `Html` 相关的操作，却掌控不了文章的内容。

3. 基于 `contenteditable` 的 `JS` 富文本编辑器，与第二类的区别主要在于：文章结构保存在 `JS` 中，`Html` 是文章结构的映射，所有的编辑行为实际操作的是 `JS` 内存中的模型，如 `DraftJs` ，但是目前这类的编辑器，功能简单，可操作性不够。

该项目为第三类的富文本编辑器，相较于其他第三类富文本编辑器，它功能丰富，理论上支持所有 `Css` 属性，支持 `Markdown` 中所有的类型，包括但不限于 标题、表格、列表、引用、图片等，同时表格、列表、支持多层级嵌套，内容由 `JS` 表示，很容易就能生成别的类型：如 `Markdown`。
