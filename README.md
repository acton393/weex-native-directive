# 可回收长列表（`<recycle-list>`）

`<recycle-list>` 是一个新的列表容器，具有节点回收和复用的能力，可以大幅优化内存占用和渲染性能。

> **功能还未完成，请谨慎使用！**

## 设计思路

+ 前端框架中不将长列表展开，而是将列表数据和子节点的结构发送到客户端。
+ 客户端根据数据和子节点的结构渲染生成列表，并且实现节点的回收和复用。

对页面和组件的开发方式有些影响，整体上讲是更强调【数据驱动】和【声明式】的开发方式了。细节请参考 [Design.md](./Design.zh.md) 。

## 使用方法

原有 `<list>` 和 `<cell>` 组件的功能不受影响，针对新功能提供了新的 `<recycle-list>` 和 `<cell-slot>` 组件。如果想利用列表回收和复用的特性，使用新组件即可。

> 在 Vue.js 中，该功能部分依赖与编译工具，请确保 `weex-loader` 的版本高于 `0.6.7`（其依赖的 `weex-vue-loader` 版本要高于 `0.5.6`）。

### `<recycle-list>`

`<recycle-list>` 是一个新的列表容器，只能将 `<cell-slot>` 作为其直接子节点，使用其他节点无效。

**支持的属性**

+ `for`: "(alias, index) in listData" **必选** 列表循环的表达式，该属性和 `v-for` 不同，它循环的不是当前节点，而是其中的子节点，通常配合 `switch` 使用。
  + `alias`: {`String`} 指定数据中的每一项在模板中的别名。
  + `index`: {`String`} 指定当前列表下标的变量名，下标值和列表数据的下标一致。
  + `listData`: {`Array<Object>`} 列表数据，数据的每一项必须是对象，不能是原始值。
+ `switch`: {`String`} 数据中用于区分子模板类型的字段名，默认值是 `"templateType"`。

> `for` 和 `switch` 是仅适用于 Weex 平台的不以 `v-` 开头的模板指令，不能再添加 `v-bind` 的绑定语法。

如果省略了 `switch` 属性，则只会将第一个 `<cell-slot>` 视为模板，多余的模板将会被忽略。

### `<cell-slot>`

`<cell-slot>` 代表的是列表每一项的**模板**，并不是实际的节点，它只用来描述某一类*列表项*的结构，本身并不会渲染。`<cell-slot>` 的个数只表示*列表项*的种类个数，真实*列表项*的个数是由数据决定的，。

**支持的属性**

+ `case`: {`String`} 当前模板的类型，只有和数据中的类型与当前类型匹配时才会渲染。
+ `default`: {`String`} 表示当前模板为默认模板类型，如果数据项的类型没有匹配到任何类型，则渲染当前模板。如果存在多个 `default`，则只会使用第一个默认模板。
+ `key`: {`String`} 列表中每条数据的唯一键值，用于优化。

在写了 `switch` 的情况下，`case` 和 `default` 必须写一个，否则该模板将会被忽略。

### 实例

在上层语法中的使用方式如下：

```html
<recycle-list for="(item, i) in longList" switch="type">
  <cell-slot case="A">
    <text>- A {{i}} -</text>
  </cell-slot>
  <cell-slot case="B">
    <text>- B {{i}} -</text>
  </cell-slot>
</recycle-list>
```

如果有如下数据：

```js
const longList = [
  { type: 'A' },
  { type: 'B' },
  { type: 'B' },
  { type: 'A' },
  { type: 'B' }
]
```

则会生成如下等价节点：

```html
<text>- A 0 -</text>
<text>- B 1 -</text>
<text>- B 2 -</text>
<text>- A 3 -</text>
<text>- B 4 -</text>
```

如果将模板合并成一个，也可以省略 `switch` 和 `case`，将例子进一步简化：

```html
<recycle-list for="(item, i) in longList">
  <cell-slot>
    <text>- {{item.type}} {{i}} -</text>
  </cell-slot>
</recycle-list>
```

## 使用子组件

在 `<recycle-list>` 中使用的子组件也将被视为模板，它的部分功能将会受到到影响。组件将不再执行 `render` 函数，而是执行另一个专门用来生成模板的 `@render` 函数，触发生命周期的时机也将会有差异。在开发组件时，给 `<template>` 标签添加 `recyclable` 属性，就可以表示当前组件可以用在 `<recycle-list>` 中。

### 实例

在 `<recycle-list>` 中使用了组件 `<banner>`：

```html
<recycle-list for="(item, i) in labels">
  <cell-slot>
    <banner></banner>
  </cell-slot>
</recycle-list>
```

`<banner>` 组件的定义如下：

```html
<template recyclable>
  <text class="title">BANNER</text>
</template>
```

更多细节可以参考：[完整代码](http://dotwe.org/vue/4a7446690e2c87ec0d39d8ee4884fa19)。

## 注意事项

> TODO

## 更多例子

**模板语法**

+ [绑定文本 `{{}}`](http://dotwe.org/vue/5b25755d7371d16b3d000e0d173a5cab) ([普通 list](http://dotwe.org/vue/0f7f1c1f0a3271ed30a0c5adb6938976))
+ [绑定属性 `v-bind`](http://dotwe.org/vue/6455e2e8c1a717f9c09363ec9be663d1) ([普通 list](http://dotwe.org/vue/f6a37fbeb5d7abf2d8c4875862b49ebc))
+ [循环 `v-for`](http://dotwe.org/vue/966e644a4cbbbc401ab431889dc48677) ([普通 list](http://dotwe.org/vue/89921581f43493e6bbb617e63be267b6))
+ [多层循环](http://dotwe.org/vue/20a9681f9201ef1b7a68962fd9cb5eb5) ([普通 list](http://dotwe.org/vue/8a961f87c6db8e0aa221748d037b6428))
+ [条件渲染 `v-if`/`v-else`/`v-else-if`](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [双向绑定 `v-model`](http://dotwe.org/vue/87fad731f8ea4cd4baa2906fde727a47) ([普通 list](http://dotwe.org/vue/317b4f70f5e278e6bf095feeab09ed21))
+ [一次性渲染 `v-once`](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [绑定事件 `v-on`](http://dotwe.org/vue/34bb833828861bf37e9d0574241d7c82) ([普通 list](http://dotwe.org/vue/7cdb9f7819f31ea38219b8b61dc87a3f))
+ [绑定样式](http://dotwe.org/vue/a95fca7835aa3fc8bf2c24ec68c7d8cd) ([普通 list](http://dotwe.org/vue/fe129e413d8a7ea5c90fcf2b5e5894a8))
+ [指令搭配使用](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [复杂压测例子](http://dotwe.org/vue/593bb4f3fa7ac1d5da5b2906fa4c8bb0) ([普通 list](http://dotwe.org/vue/07734d19b15e3528c2f7b68ba870126f))

**`<recycle-list>` 组件的功能**

+ [数据更新](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [computed](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [watch](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [生命周期](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [mixin](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [filter](http://dotwe.org/vue/2ee9fdb1bdd36da4bc996fb3273e8caa) ([普通 list](http://dotwe.org/vue/9fd19b7309c8e9e09e83826a44549210))

**使用子组件**

+ [纯静态子组件](http://dotwe.org/vue/4a7446690e2c87ec0d39d8ee4884fa19) ([普通 list](http://dotwe.org/vue/1ab67bd0f19d5cf17fc358d73801f238))
+ [无状态，有 props](http://dotwe.org/vue/f716dfc90f7ec0f2ec142c45d814b76f) ([普通 list](http://dotwe.org/vue/42039b1ed8484c98051cc2fd1ee542bc))
+ [props 更新](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [有内部状态](http://dotwe.org/vue/238224971654b45d29e42c9cfb245c46) ([普通 list](http://dotwe.org/vue/15eee87f0d46ecf60a59792f8be977a1))
+ [内部状态更新](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [绑定事件](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [生命周期](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [生命周期](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)

**复杂用法**

+ [使用各种类型的组件](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [嵌套 list](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [使用 `<component>`](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [使用 `<template>`](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [使用 `<slot>`](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
+ [在子组件中使用 `<recycle-list>`](http://dotwe.org/vue/123b69b57e099036558745298fb6e8ca) (TODO)
