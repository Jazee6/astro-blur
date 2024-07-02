---
title: 前端八股
description: 前端八股
pubDate: 2023-11-09
isDraft: true
---

## JS

### prototype

- 每个函数都有一个prototype属性，指向一个对象，这个对象的所有属性和方法，都会被构造函数的实例继承
- 每个对象都有一个`__proto__`属性，指向它的原型对象(构造函数的prototype)

### 原型链

- 每个对象都有一个`__proto__`属性，指向它的原型对象
- 原型对象也是对象，也有`__proto__`属性，指向它的原型对象
- 一直往上找，直到`__proto__`为null

### 事件循环

- JS是单线程的，异步任务会被放到任务队列中，等待执行
- 任务队列分为宏任务和微任务
- 宏任务：宿主环境提供的任务，如`setTimeout` `setInterval` `setImmediate` `requestAnimationFrame` `I/O` `UI rendering`
- 微任务：JS引擎提供的任务，如`Promise.then` `MutationObserver` `process.nextTick`
- 执行同步代码 -> 执行所有微任务 -> 执行一个宏任务 -> 执行所有微任务 -> ...

### 闭包

- 闭包是指有权访问另一个函数作用域中的变量的函数
- 作用：保护变量不被污染，保存变量

### this

- 默认绑定：直接调用函数，this指向全局对象
- 隐式绑定：函数作为对象的方法调用，this指向对象
- 显示绑定：`call` `apply` `bind`，this指向指定对象
- new绑定：构造函数调用，this指向实例对象
- 箭头函数：this指向定义时所在的对象

### Object/Map/WeakMap

- Object：键为字符串/符号，键值对无序
- Map：键可以为任意类型，键值对有序（插入顺序），size属性
- WeakMap：键只能为对象，无序不可遍历，键所指向的对象可以被垃圾回收（弱引用）

### 数组去重

#### Set

```js
function unique(arr) {
    return [...new Set(arr)]
}
```

#### indexOf

```js
function unique(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index)
}
```

### for...of/for...in

- for...of：遍历可迭代对象，如数组/字符串/Map/Set的值
- for...in：遍历对象的可枚举属性，包括原型链上的属性

## Browser

### 重绘/重排

- 重绘：元素样式改变，不影响布局
- 重排：元素位置改变，影响布局

### BFC

- 块级格式化上下文，是一个独立的渲染区域，内部元素不会影响外部元素
- 元素在垂直方向一个接一个排列，水平方向占满父元素
- 触发：根元素/浮动元素/绝对定位元素/display为`inline-block` `flex` `grid`等/overflow不为visible
- 作用：清除浮动/防止margin重叠

### MPA/SPA

- MPA：多页面应用，每次跳转都会请求新的页面，首屏快，SEO好，页面切换慢
- SPA：单页面应用，只有一个页面，通过路由切换，只请求数据

### CSS计算过程

- 确定声明值
- 层叠
- 继承
- 使用默认值

## 性能优化

- http缓存（强缓存/协商缓存）
- CDN
- 动态加载（路由/组件/图片懒加载）
- 合并请求
- 骨架屏
- SSR（prerender）
- service worker
- http2/quic
- gzip/br
- webp
- async/defer
- 防抖/节流
- 事件委托

### 缓存

强缓存：浏览器直接从本地缓存中读取资源，不会发请求，状态码为200

`Cache-Control: max-age=31536000` `Expires: Wed, 21 Oct 2020 07:28:00 GMT`

协商缓存：过期，客户端和服务端协商资源是否更新，没有更新，返回304

响应`Last-Modified: Wed, 21 Oct 2020 07:28:00 GMT` `Etag: "5f8f2a80-2b"`

请求`If-Modified-Since: Wed, 21 Oct 2020 07:28:00 GMT` `If-None-Match: "5f8f2a80-2b"`

### 防抖/节流

防抖：事件触发前，n秒内没有再次触发，则执行事件，n秒内再次触发，则重新计时

节流：事件触发后，n秒内只执行一次事件

```js
function debounce(fn, delay) {
    let timer = null
    return function () {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, arguments)
        }, delay)
    }
}
```

```js
function throttle(fn, delay) {
    let timer = null
    return function () {
        if (timer) return
        timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null
        }, delay)
    }
}
```

## 网络

### TLS

1. ->ClientHello，版本号，随机数，加密算法
2. <-ServerHello，版本号，随机数，加密算法
3. <-证书(验证)
4. ->公钥加密的pre-master secret
5. 双方随机数+PMSec生成会话密钥
6. <->ChangeCipherSpec+Finished

### HTTP2

- 多路复用/二进制分帧/首部压缩/服务端推送/流量控制

## 安全

### XSS

- 跨站脚本攻击，向页面注入恶意脚本
- 防范：转义/过滤/限制cookie

### CSRF

- 跨站请求伪造，利用用户登录状态发起恶意请求
- 防范：验证referer/验证token

## 手写

### Promise.all

```js
Promise.all = function (promises) {
    return new Promise((resolve, reject) => {
        let result = []
        let count = 0
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(res => {
                result[i] = res
                count++
                if (count === promises.length) {
                    resolve(result)
                }
            }, err => {
                reject(err)
            })
        }
    })
}
```

### promisify

```js
function promisify(fn) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    }
}
```

### Vue3响应式

```js
function reactive(obj) {
    const handler = {
        get(target, key, receiver) {
            track(target, key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            const oldValue = target[key]
            const result = Reflect.set(target, key, value, receiver)
            if (oldValue !== value) {
                trigger(target, key)
            }
            return result
        }
    }
    return new Proxy(obj, handler)
}
```

### call

```js
Function.prototype.call = function (context, ...args) {
    context = context || window
    context.fn = this
    const result = context.fn(...args)
    delete context.fn
    return result
}
```

### bind

```js
Function.prototype.bind = function (context, ...args) {
    const fn = this
    return function (...args2) {
        return fn.call(context, ...args, ...args2)
    }
}
```

### new

```js
function myNew(fn, ...args) {
    const obj = Object.create(fn.prototype)
    const result = fn.call(obj, ...args)
    return result instanceof Object ? result : obj
}
```

## 算法

### 反转链表

```js
function reverseList(head) {
    let prev = null
    let curr = head
    while (curr) {
        let next = curr.next
        curr.next = prev
        prev = curr
        curr = next
    }
    return prev
}
```

### 二叉树遍历

```js
function preorderTraversal(root) {
    let result = []

    function traversal(root) {
        if (!root) return
        result.push(root.val)
        traversal(root.left)
        traversal(root.right)
    }

    traversal(root)
    return result
}
```

### 二叉树的最近公共祖先

```js
function lowestCommonAncestor(root, p, q) {
    if (!root || root === p || root === q) return root
    let left = lowestCommonAncestor(root.left, p, q)
    let right = lowestCommonAncestor(root.right, p, q)
    if (!left) return right
    if (!right) return left
    return root
}
```

### BFS

```js
function bfs(root) {
    let result = []
    let queue = [root]
    while (queue.length) {
        let node = queue.shift()
        result.push(node.val)
        if (node.left) queue.push(node.left)
        if (node.right) queue.push(node.right)
    }
    return result
}
```
