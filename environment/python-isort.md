---
title: 使用 isort 对 python 导入模块排序
description: isort 是一个实用的 Python 程序/库，用于按照字母表顺序对 imports 进行排序，并自动按类型（标准库/第三方库/自己的模块/……）划分部分。它为各种编辑器提供了命令行程序、Python库和插件，以快速对所有导入进行排序。
date: 2023-05-16
tags:
  - Python 代码质量
---

# isort

isort 是一个实用的 Python 程序/库，用于按照字母表顺序对 imports 进行排序，并自动按类型（标准库/第三方库/自己的模块/……）划分部分。它为各种编辑器提供了命令行程序、Python
库和插件，以快速对所有导入进行排序。

## 安装

安装非常简单，只需：

```shell
pip install isort
```

::: tip 提示
如果您希望 isort 作为项目的 linter，则可能需要为每个使用它的项目添加 isort 作为显示开发依赖项。另一方面，如果您是个人开发人员，只是使用
isort 作为个人工具来清理您自己的 commit ，那么全局或用户级别的安装是有意义的。两者都在一台机器上无缝支持。 简单使
:::

## 简单使用

1、命令行使用

在特定文件上运行：

```SHELL
isort mypythonfile.py mypythonfile2.py
```

2、递归地使用：

```SHELL
isort .
```

3、在 Python 内使用

```PYTHON
import isort

isort.file("pythonfile.py")
```

## 与 pre-commit 协同

isort 提供对 [pre-commit](https://pre-commit.com/) 的官方支持。

使用方式参考： https://pycqa.github.io/isort/docs/configuration/pre-commit.html

## 附录

[isort 井井有条 —— Python 导入格式化工具_](https://muzing.top/posts/38b1b99e/)

[官方文档](https://pycqa.github.io/isort/) 