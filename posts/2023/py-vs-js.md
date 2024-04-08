---
title: 对比 python 学 JavaScript
description: Python 与 JavaScript 是两门使用非常广泛的语言，并且常常需要在一起使用，但是它们在语法层面的差距不小，我们就来对比学习一下。
date: 2023-07-14
tags:
  - flask
  - JavaScript
---

# 对比 python 学 JavaScript

## 基础语法

### 注释

<div class="row">
<div class="col">

python 注释用 `#` 实现单行注释，用三引号 `"""""""` 实现块注释。

```python:no-line-numbers
# 单行注释

"""
多
行
注
释
"""
```

</div>
<div class="col">

JavaScript 用 `//` 实现单行注释，用 `/**/` 实现块注释。

```javascript:no-line-numbers
// 单行注释

/*
多
行
注
释
*/
```

</div>
</div>

### 变量声明

<div class="row">
<div class="col">

在 python 里直接写变量声明，无前缀，定义之后就可以使用。

```python:no-line-numbers
name = '正心'
age = 18
mobile = '18675867241'
```

</div>
<div class="col">

在变量声明上 JavaScript 使用的是 `var`、`let`、`const` 分别声明全局变量、变量、常量。

```javascript:no-line-numbers
var name = '正心'
let age = 18
const mobile = '18675867241'
```

</div>
</div>

关于命名规则，python 中用蛇形命名法较多，而 JavaScript 用小驼峰命名法更多。

## 字符串

使用单引号或者双引号定义字符串，二者是没有区别的，区别在于字符串格式化，在 JavaScript 中叫模板字符串。

<div class="row">
<div class="col">

python 中的字符串格式化方法有三种，最与 JavaScript 模板字符串的是 `f""` 。

```python:no-line-numbers
name = '正心'

print(f'{name} 是一名 python 开发者')
#  '正心 是一名 python 开发者'
```

</div>
<div class="col">

javascript es6 的模板字符串与 python 的 `f` 模板字符串非常相似，使用反引号声明。

```javascript:no-line-numbers
const name = '正心'

console.log(`${name} 是一名 JavaScript 开发者`)
// '正心 是一名 JavaScript 开发者'
```

</div>
</div>

### 字符串查找

python 的字符串与 javascript 的字符串的功能差不多，但是实现的方法差距蛮大。

先看一下他们的查找方法

<div class="row">

<div class="col">

在 python 中查找字符串使用身份运算符 `in` 就可以很方便的找到。使用 `.index` 方法获取位置。

```python:no-line-numbers
name = '正心'
name_str = '丸子,正心,山禾'

print(name in name_str)
# True

print(name_str.index(name))
# 3
```

</div>
<div class="col">

在 javascript 中使用 `.includes` 方法查找。使用 `.indexOf` 可以获取到 元素所在的位置

```javascript:no-line-numbers
const name = '正心'
const name_str = '丸子,正心,山禾'

console.log(name_str.includes(name))
// true

console.log(name_str.indexOf(name))
// 3
```

</div>
</div>

### 分割与合并

<div class="row">
<div class="col">

```python:no-line-numbers
name_str = '丸子,正心,山禾'
print(name_str.split(','))
# ['丸子', '正心', '山禾']

print(','.join(['丸子', '正心', '山禾']))
# '丸子,正心,山禾'
```

</div>
<div class="col">

```javascript:no-line-numbers
const name_str = '丸子,正心,山禾'
console.log(name_str.split(','))
// ['丸子', '正心', '山禾']

console.log(''.concat(['丸子', '正心', '山禾']))
// '丸子,正心,山禾'
```

</div>
</div>

### 字符串取值

python 的字符串支持取值与切片，但是 javascript 没有这个特性，需用用其他的方法来进行补充。

<div class="row">
<div class="col">

```python:no-line-numbers
name_str = '丸子,正心,山禾'
print(name_str[3:])
# '正心,山禾'
print(name_str[3:5])
# '正心'
```

</div>
<div class="col">

```javascript:no-line-numbers
const name_str = '丸子,正心,山禾'
console.log(name_str.substring(3))
// '正心,山禾'
console.log(name_str.substring(3, 5))
// '正心'
```

</div>
</div>

关于 JavaScript
字符串还有其他不少方法，具体内容可以查看： [String MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/trim)

## 列表

[MDN Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)

### 列表切片

<div class="row">
<div class="col">

```python:no-line-numbers
arr = ['a', 'b', 'c', 'd', 'e']

print(arr[0])
# 'a'
print(arr[0:3])
# [ 'a', 'b', 'c' ]
print(arr[0: -1])
# [ 'a', 'b', 'c' ]
```

</div>
<div class="col">

```javascript:no-line-numbers
const arr = ['a', 'b', 'c', 'd', 'e']

console.log(arr[0])
// 'a'
console.log(arr.slice(0, 3))
// [ 'a', 'b', 'c' ]
console.log(arr.slice(0, -1))
// [ 'a', 'b', 'c' ]
```

</div>
</div>

### 新增与删除

<div class="row">
<div class="col">

```python:no-line-numbers
arr = ['a', 'b', 'c']

arr.append('d')
print(arr)
# [ 'a', 'b', 'c', 'd' ]
arr.insert(0, 'A')
print(arr)
# [ 'A', 'a', 'b', 'c', 'd' ]
arr.pop()
print(arr)
# [ 'A', 'a', 'b', 'c' ]
arr.pop(0)
print(arr)
# [ 'a', 'b', 'c' ]
```

</div>
<div class="col">

```javascript:no-line-numbers
const arr = ['a', 'b', 'c']

arr.push('d')
console.log(arr)
// [ 'a', 'b', 'c', 'd' ]
arr.unshift('A')
console.log(arr)
// [ 'A', 'a', 'b', 'c', 'd' ]
arr.pop()
console.log(arr)
// [ 'A', 'a', 'b', 'c' ]
arr.shift()
console.log(arr)
// [ 'a', 'b', 'c' ]
```

</div>
</div>

### 遍历列表

<div class="row">
<div class="col">

```python:no-line-numbers
arr = ['a', 'b', 'c']

for index, element in enumerate(arr):
    print(index, element)
# 0 a
# 1 b
# 2 c
```

</div>
<div class="col">

```javascript:no-line-numbers
const arr = ['a', 'b', 'c']
arr.forEach(function (element, index) {
    console.log(index, element)
});
// 0 a
// 1 b
// 2 c
```

</div>
</div>

filter

<div class="row">
<div class="col">

```python:no-line-numbers
words = ['python', 'java', 'c', 'javascript']

result = filter(lambda x: len(x) >= 6, words)

print(list(result))
# ['python', 'javascript']
```

</div>
<div class="col">

```javascript:no-line-numbers
const words = ['python', 'java', 'c', 'javascript'];

const result = words.filter(word => word.length >= 6);

console.log(result);
// ['python', 'javascript']
```

</div>
</div>

map

<div class="row">
<div class="col">

```python:no-line-numbers
arr = [1, 2, 3, 4]

map1 = map(lambda x: x ** 2, arr)

print(list(map1))
# [1, 4, 9, 16]
```

</div>
<div class="col">

```javascript:no-line-numbers
const arr = [1, 2, 3, 4];

const map1 = arr.map(x => x ** 2);

console.log(map1);
// [1, 4, 9, 16]
```

</div>
</div>

<style>
.row {
    width: 100%;display: flex;font-size: 14px;
}

.row .col {
    width: 50%;
}

.row .col:first-child {
    padding-right: 2px;
    border-right: 1px solid black;
}
.row .col:last-child {
    padding-left: 2px;
    border-left: 1px solid black;
}
</style>