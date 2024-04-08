---
title: 使用 pre-commit 对 Python 代码校验
description: 使用 pre-commit 对 Python 代码校验
date: 2023-07-27
tags:
  - Python 代码质量
---

视频地址： [BV1kV411V7Pn](https://www.bilibili.com/video/BV1kV411V7Pn/)

# 使用 pre-commit 对 Python 代码校验

一个人写代码的时候，想怎么写就怎么写，能够实现功能就可以了。但是在团队合作的时候，如果不对 git
提交的代码进行校验、风格统一，因为团队成员的水平不一，很容易就出现一些地方空行太多、命名格式不规范等等问题，合作也会直线效率下降。

这种低级的问题应该在提交到远程仓库之前就被解决。git 就提供了 git hooks 专门来处理这些问题，其中 Python 的解决方案是
pre-commit。

## pre-commit 介绍

> https://pre-commit.com/

pre-commit 是用 python 开发的一个功能，能够在 git commit 提交代码之前对将要提交的内容进行校验，如果不符合规范将会打回。在项目中使用
pre-commit 有以下好处

+ 自动化检查代码排版规范，快速而且有效率（例如 black、isort）
+ 低级的问题不会进入到 code review 阶段
    + 多一点时间检查代码逻辑，而不是排查基本的错误（例如空格、换行之类的问题）
    + 大大提升排查不符合规范代码的效率

## 创建项目

使用 pre-commit 之前需要初始化一个 git 项目。

pycharm 创建 flask 项目

```
poetry init
poetry add flask
```

初始化 git 项目

```
git init
touch .gitignore
```

添加忽略文件

```
.idea 
*.py[cod] 
*.log
```

添加代码校验依赖

```
poetry add black --group dev
poetry add isort --group dev
poetry shell
```

## pre-commit 基础使用

### 安装 pre-commit

```
poetry add pre-commit --group dev
```

安装好了之后可以查看版本

```
$ pre-commit --version
pre-commit 3.3.3
```

### 添加预提交校验配置

1. 创建一个 `.pre-commit-config.yaml` 文件
2. 可以使用 `pre-commit sample-config` 指令生成基本的配置文件
3. 这个示例使用来格式化 python 代码，但是 `pre-commit` 适用于任何编程语言
4. 也支持其他的 [git hooks](https://pre-commit.com/hooks.html)

运行 `pre-commit sample-config` 可以生成基本的配置，然后将其复制到 `.pre-commit-config.yaml` 当中。

```
$ pre-commit sample-config                              
# See https://pre-commit.com for more information       
# See https://pre-commit.com/hooks.html for more hooks  
repos:                                                  
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v3.2.0                                         
    hooks:                                              
    -   id: trailing-whitespace                         
    -   id: end-of-file-fixer                           
    -   id: check-yaml                                  
    -   id: check-added-large-files 
```

### 安装 git 钩子脚本

运行`pre-commit install`设置 git hook 脚本

```
$ pre-commit install
pre-commit installed at .git/hooks/pre-commit
```

安装 git hook 之后，当在运行 pre-commit 提交时，将自动校验 pre-commit 的规则。

### 对所有文件进行校验（可选）

使用 `git add .` 先追踪待提交内容，然后运行

```
pre-commit run --all-files
```

校验待提交内容，校验失败之后，一部分内容 `pre-commit` 会自动调整，然后运行 `git add .` 、`pre-commit run --all-files`
。也有可能有一些校验不通过，需要手动进行调整。

**注意：**

pre-commit 只针对需要 git 追踪的内容进行校验

## 添加其他 git hooks

https://pre-commit.com/hooks.html

pre-commit 有那些钩子，可以在官方文档上看到。我比较推荐 `isort`、`black`、`mirrors-prettier` 这三个钩子。前两个是校验 python
代码，后一个是格式化前端代码。

```
repos:
  - repo: https://github.com/commitizen-tools/commitizen
    rev: 3.5.3
    hooks:
      - id: commitizen
        stages: [commit-msg]
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-toml
  - repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
      - id: black
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: "v3.0.0" # Use the sha / tag you want to point at
    hooks:
      - id: prettier
```

使用 prettier 格式化前端代码，需要修改 pycharm
对前端代码默认的格式化方式，可以在 https://www.jetbrains.com/help/pycharm/2020.2/prettier.html 看到。
