---
title: Example Post
description: Example post description.
pubDate: 2024-07-02
---

这是一个综合的 Markdown 语法演示文档，展示了常用的格式化功能。

## 文本格式

### 基本文本样式

这是普通文本。

**这是粗体文本**

*这是斜体文本*

***这是粗体加斜体文本***

~~这是删除线文本~~

`这是行内代码`

### 引用

> 这是一个引用块。
>
> 可以包含多行内容。
>
> > 这是嵌套引用。

## 列表

### 无序列表

- 项目 1
- 项目 2
    - 子项目 2.1
    - 子项目 2.2
        - 子子项目 2.2.1
- 项目 3

### 有序列表

1. 第一项
2. 第二项
    1. 子项目 2.1
    2. 子项目 2.2
3. 第三项

### 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待完成的任务

## 代码

### 行内代码

使用 `console.log()` 来输出信息。

### 代码块

#### JavaScript 示例

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

const message = greet('World');
console.log(message);
```

#### Python 示例

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 生成斐波那契数列
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

#### CSS 示例

```css
.example {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## 链接和图片

### 链接

[GitHub](https://github.com)

[相对链接到关于页面](/about)

[带标题的链接](https://astro.build "Astro 官网")

### 自动链接

https://www.example.com

### 图片

![示例图片](https://camo.githubusercontent.com/c0114da7f483c3f0dde82cbb5d40f5241538342312e5d9affaa2af5208d75444/68747470733a2f2f626c6f672d63646e2e6a617a652e746f702f323032342f30372f36653738313365343464616439613335626536633432623263326534656235332e77656270)

## 表格

| 功能     | 描述      | 支持情况 |
|--------|---------|------|
| **标题** | 多级标题支持  | ✅    |
| **列表** | 有序和无序列表 | ✅    |
| **代码** | 语法高亮    | ✅    |
| **表格** | 数据展示    | ✅    |
| **链接** | 内外链接    | ✅    |

## 水平分割线

---

## 数学公式（如果支持）

行内公式：$E = mc^2$

块级公式：

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 特殊符号和转义

- 版权符号：&copy; 2024
- 商标符号：&trade;
- 注册商标：&reg;
- 箭头：&larr; &uarr; &rarr; &darr;

转义字符示例：

\*这不是斜体\*

\`这不是代码\`

## 脚注

这里有一个脚注引用[^1]。

这里有另一个脚注[^note]。

[^1]: 这是第一个脚注的内容。

[^note]: 这是一个带有标识符的脚注。

## HTML 标签

<details>
<summary>点击展开详细信息</summary>

这是一个可折叠的内容区域。

- 支持 Markdown 语法
- **粗体文本**
- `代码`

</details>

<mark>高亮文本</mark>

<kbd>Ctrl</kbd> + <kbd>C</kbd>

## 总结

这个示例文档展示了 Markdown 的主要语法功能，包括：

1. **文本格式化** - 粗体、斜体、删除线
2. **结构化内容** - 标题、列表、表格
3. **代码展示** - 行内代码和代码块
4. **媒体内容** - 链接和图片
5. **高级功能** - 数学公式、脚注、HTML 标签

希望这个示例对你学习和使用 Markdown 有帮助！
