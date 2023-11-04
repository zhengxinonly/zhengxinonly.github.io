---
title: VitePress 系列教程：VitePress 快速上手 02
description: VitePress 是一个静态站点生成器，英文名为 SSG (Static Site Generation)。与它类似的还有 vuepress、hexo，python语言也有 shpinx、mkdocs 之类的工具，react 也有 docusaurus。但是在这么多的工具里面，vitepress 是上手成本最低的，也是配置最简单的（需要会 JavaScript ），界面也很漂亮，有适配移动端。只要写 markdown 文件与 javascript 配置文件，就可以快速搭建器一个网站。
date: 2023-11-01
tags:
  - VitePress
---

:::tip
[BV1PH4y167Wg](https://www.bilibili.com/video/BV1PH4y167Wg/)
:::

# VitePress 系列教程：VitePress 快速上手 #2

`vitepress` 是一个静态站点生成器，英文名为 `SSG` (Static Site Generation)
。与它类似的还有 [vuepress](https://vuepress.vuejs.org/) 、[hexo](https://hexo.io/index.html)，`python`
语言也有 [shpinx](https://www.sphinx-doc.org/en/master/)、[mkdocs](https://www.mkdocs.org/) 之类的工具，`react`
也有 [docusaurus](https://docusaurus.io/)。

但是在这么多的工具里面，`vitepress` 是上手成本最低的，也是配置最简单的（需要会 JavaScript
），界面也很漂亮，有适配移动端。只要写 `markdown` 文件与 `javascript` 配置文件，就可以快速搭建器一个网站。

`vitepress` 考虑到用户可能会需要定制化，所以提供了很多的接口与插槽，如果会用 `vue`
开发项目，就可以自己改。并且可以使用`tailwind css`、 `elements-plus` 等框架，使用起来非常方便。

## vitepress 初使用

可以直接在 [vitepress 官网](https://vitepress.dev/) 查看快速上手教程，跟着做就可以快速搭建起一个项目

### 项目创建

操作笔记参考官网文档： https://vitepress.dev/guide/getting-started

创建目录

```shell
mkdir vitepress-tutorial
cd vitepress-tutorial
```

安装依赖

```shell
pnpm add -D vitepress
```

初始化项目

```shell
npx vitepress init
```

:::tip

项目的更目录非常重要。新手建议从 `./docs` 开始，并且不要选择自定义主题。

:::

### 目录结构

```
.
├─ docs		
│  ├─ .vitepress  # 当前目录所在的位置就是文档的根目录
│  │  └─ config.js  # 项目的配置文件，最重要
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

### 路由

https://vitepress.dev/guide/routing

文件路由

### 导航

### 侧边栏

### 项目部署

https://vitepress.dev/guide/deploy

在使用 `vitepress` 的之后需要特别注意不能在 `markdown` 中写一些的代码，例如 `<前端未闭合标签>`、 `{}` 、`location`
。因为 `vitepress` 在运行过程中会识别前端标签并进行转义，如果标签为闭合就会报错。而 `{}` 会被识别为 `javascript`
的变量，如果没有处理好也会报错，最后的 `location` 是在构建打包文件时会报错。

如果不需要权限拦截，当访问量小时最好的方案是采用

+ gitee pages、github pages 静态页面托管。
+ 腾讯云 cos 的存储桶部署。
+ 腾讯云服务器部署（后端权限拦截必须要服务器）

