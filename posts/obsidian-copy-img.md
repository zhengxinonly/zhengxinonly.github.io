---
title: onsidian 像 typora 一样复制图片
description: 从 typora 迁移到 obsidian 之后，对于图片复制功能经常感觉不满意，之前都是用 obsidian 写文章 typora 复制文件。偶然一次机会发现 obsidian 也可以像 typora 一样复制图片
date: 2023-05-16
tags:
  - Obsidian
---

# onsidian 像 typora 一样复制图片

从 typora 迁移到 obsidian 之后，对于图片复制功能经常感觉不满意，之前都是用 obsidian 写文章 typora 复制文件。偶然一次机会发现
obsidian 也可以像 typora 一样复制图片

## obsidian 图片保存

obsidian 复制图片的时候默认使用的是 `![[ ]]` 格式，而 markdown 语法都是使用通用的 `![ ]( )` 形式，所以需要更改设置。

![image-20230308034801986](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/obsidian-copy-img/image-20230308034801986.png)

再次尝试插入图片，可以看到新插入的图片已经变成了通用的 `![ ]( )` 形式

## 附件存放插件

obsidian 修改保存文件名之后，但是不能指定对于的路径。如果想与 typora 保持一直，需要安装 `custom attachment location` 插件

在插件市场搜索之后直接安装，安装好了之后勾选启动插件，然后就可以使用了。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/obsidian-copy-img/image-20230308035713614.png)

## obsidian 插件推荐

+ calendar
+ templates
+ custom attachment location
