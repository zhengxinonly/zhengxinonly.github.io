---
title: 安装 Python 3.10 官方解释器
description: 解释器（英语：Interpreter），是一种电脑程序，能够把高级编程语言一行一行直接转译成机器能够读懂的二进制的数据，然后交给机器运行的程序。python 解释器是用 C 语言开发的，也叫 CPython 。在命令行下运行 python 就是启动 CPython 解释器。CPython 是使用最广的 Python解释器。教程的所有代码也都在CPython 下执行。
date: 2023-05-15
tags:
  - Python 环境
---

# 安装解释器

## 介绍解释器

解释器（英语：Interpreter），是一种电脑程序，能够把高级编程语言一行一行直接转译成机器能够读懂的二进制的数据，然后交给机器运行的程序。

### Python 解释器

python 解释器是用 C 语言开发的，也叫 CPython 。在命令行下运行 python 就是启动 CPython 解释器。CPython 是使用最广的 Python
解释器。教程的所有代码也都在CPython 下执行。

## 下载解释器

Python 的解释器是开源免费的，可以直接去官方网站进行下载。

注意：官网是在国外，默认国内访问与下载速度都会非常慢，如果不想等待可以查看最后附录中的下载方式。

首先访问 https://www.python.org/ 然后点击 Downloads

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PLAd8MBjj5IzaRbsttCyF82.png)

然后选择需要的解释器版本，这里推荐使用 3.10 版本的解释器。

注意：解释器并不是越新越好，做项目最需要的稳定、稳定、稳定！！！新版本解释器往往意味着不兼容，会有比较多的 bug
以及很多第三方库无法使用。在这里我推荐采用比最新版解释器低 1-2 个版本的，除了很久之前的项目，否则也不推荐使用老版本的解释器，原因与最新版的解释器问题差不多。

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PInLIkact9BKZn_A0nGAClu.png)

点击选择之后的解释器，然后往下拉，选择需要下载的操作系统与位数。

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PJZ9ZPNJ59KVKmZgyvqDUUt.png)

然后点击 windows 64 的电脑的安装包，下载之后就可以进行安装了。

注意：如果你的电脑是 32 位的，建议升级为 64 位。如果是 win7 尽量升级到 win10 。否则在学习过程中会出现问题，这些问题往往是新手很难解决的。

## 安装解释器

Python 解释器在电脑中可以存在多个，新手往往不能区分解释器环境会导致各种问题。所以在安装之前需要检查之前是否有安装过，如果只安装过一个并且版本是你需要的，那就可以跳过这一环节。

如果不能区分安装过多少个解释器，并且环境使用起来有问题，那么推荐删除完之后再进行安装。

### 检查命令行窗口

首先打开命令提示符

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PINNyL6P9pA9JhPAgzfzGKJ.png)

在窗口里面输入 python 如果出现了 python 字符就说明进入了 python shell 的命令行，然后可以看到 Python
解释的版本。如果版本不对的话就需要删除安装。

注意：可以使用 win + r 快捷键输入 cmd 进入 命令行窗口

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PILI4iVX0BCKKPCFD8Mxptm.png)

如果什么都没有出现，或者是弹出 windows 系统的微软商店，则说明没有解释器。

### 检查系统软件（删除解释器）

注意：如果之前没有安装过 python 解释器是不需要进入这一环节。

首先进入 windows 的系统设置，点击应用

提示：可以通过 win + i 的快捷键进入

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PJrC39UhpVFDblyBTZQ9W-L.png)

之后就需要检查系统中是否安装过 python 解释器，如果有安装过的就需要删除一下。

注意：如果安装过 Anaconda 也需要删除，没有安装过的跳过。

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PL-BuNPPnJDNJGtPfRiaD-a.png)

删除完了之后可以重新进入命令行窗口检查一下 python 解释器是否存在，输入 python 之后没有反应则说明已经成功删除了。

### 安装解释器

下载好解释器之后，双击软件就可以进行安装。双击之后会出现下图

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PI6f5IWiBtLnKq1qA_YrYTw.png)

先勾选添加到环境变量，然后点击 Customize installation 自定义安装。

然后点击下一步

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PLd6j0vSaBFQ6ruIF18y7W3.png)

然后点击修改安装路径，之后可以自定义安装的位置，这里推荐安装在非系统盘（C盘）。之后点击安装，等待安装好了即可。

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PLJfnWqdu5HILvPPzRUZROz.png)

安装好之后可以在 cmd 窗口中检查

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/install-python310/AgAABctz7PKSvREWkDNIc6BX1iz99-Yz.png)

可以看到解释器版本已经变为 python 3.10.9 说明已经安装成功了。

## 附录

### python 解释器下载地址

windows 64 位 python 3.10.9 版本解释器：

蓝奏云链接：https://wwxs.lanzoum.com/ifApH0mihwte 密码: i5ca

微云网盘链接：https://share.weiyun.com/y0eDNSva 密码：zhengx