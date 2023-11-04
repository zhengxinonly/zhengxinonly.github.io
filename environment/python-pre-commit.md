---
title: 使用 pre-commit 对提交代码进行校验
description: pre-commit 是一种用于管理和维护多种语言编写的预提交 hook 的框架。它是预提交挂钩的多语言包管理器。我们可以指定所需的挂钩列表，并且在每次提交之前预先提交管理以任何语言编写的任何挂钩的安装和执行。
date: 2023-05-16
tags:
  - Python 代码质量
---

## git hooks 介绍

+ git hooks 是一些自定义脚本，用于控制 git 的工作流程，分为客户端钩子和服务端钩子
+ 客户端钩子包括：pre-commit、prepare-commit-msg、post-commit 等。主要用于控制客户端 git
  的提交工作流。服务端钩子包括：pre-receive、post-receive、update ,主要在服务端接收提交对象时、推送到服务器之前调用。
+ git hooks 位于每个 git 项目下的隐藏文件 .git/hooks 文件夹里。进入文件夹会看到一些官方给的示例，它们都是以 .sample 结尾的文件。这些以
  .sample 结尾的示例脚本是不会执行的，只有重命名后才会生效

## pre-commit

官网：https://pre-commit.com/

简介：pre-commit 是一种用于管理和维护多种语言编写的预提交 hook
的框架。它是预提交挂钩的多语言包管理器。我们可以指定所需的挂钩列表，并且在每次提交之前预先提交管理以任何语言编写的任何挂钩的安装和执行。

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/python-pre-commit/406895fbf0965f775bdab0eb0580ca85.png)

1、安装pre-commit

```
pip install pre-commit
```

2、在你的 python 项目的根目录下新建 `.pre-commit-config.yaml` 文件
3、在文件里面配置需要的验证规则。

```shell
repos:
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v2.3.0
    hooks:
    -   id: check-yaml
    -   id: end-of-file-fixer
    -   id: trailing-whitespace
-   repo: https://github.com/psf/black
    rev: 22.10.0
    hooks:
    -   id: black
```

4、安装 git hook 脚本

```
$ pre-commit install
pre-commit installed at .git/hooks/pre-commit
```

5、运行所配置的所有规则，使其起作用

```
pre-commit run --all-files
```

后续进行 git commit 提交的时候，就会进行校验，会自动执行某些脚本检测代码 pre-commit
如果检测出错，则阻止 commit 代码， 也就无法 push

这样，通过 pre-commit 减轻了因开发者个人导致的代码格式不规范继而影响多人协作开发的问题。
