---
title: 修改 PIP 镜像源
description: 由于国内通过 pip 下载 python 包的速度真的很慢，特别是下载包文件比较大的情况下经常会导致下载失败，把默认的 PyPi 源切换化为国内源 tuna, douban, aliyun 从而可以加快 python 包的安装速度。
date: 2023-05-15
tags:
  - Python 环境
---

# PIP换源

## 为什么要换源

由于国内通过 pip 下载 python 包的速度真的很慢，特别是下载包文件比较大的情况下经常会导致下载失败，把默认的 PyPi 源切换化为国内源
tuna, douban, aliyun 从而可以加快 python 包的安装速度。

pip国内的一些镜像

+ http://pypi.douban.com/simple    是豆瓣提供一个镜像源，软件够新，连接速度也很好。
+ http://mirrors.aliyun.com/pypi/simple/     阿里云的源

## 修改源方法

### windows

打开 `C:` 盘，进入个人用户目录

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/modify-pip-source/0.png)

然后新建一个 `pip` 文件夹

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/modify-pip-source/0-16642587653073.png)

进入文件夹，新建一个 `pip.ini` 的文件

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/modify-pip-source/0-16642587782486.png)

如果没有齿轮形状，请先打开可以查看文件后缀名

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/modify-pip-source/0-16642587905569.png)

然后用记事本或者是 `notepad++` 打开这个文件，往里面写入

::: code-group

```shell [豆瓣源]
[global]
timeout = 6000
index-url = http://pypi.douban.com/simple
trusted-host = pypi.douban.com
```

```shell [阿里源]
[global]
timeout = 6000
index-url = http://mirrors.aliyun.com/simple/
trusted-host = mirrors.aliyun.com
```

:::

![img](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/modify-pip-source/0-166425884105312.png)

到此为止，`pip` 的源就修改好了。

### Mac / Linux

首先进入终端页面

先切换到家目录：

```shell
cd ~
```

然后创建 `pip` 的配置文件夹：

```shell
mkdir .pip
```

再写换到 pip 配置文件夹：

```shell
cd .pip
```

创建一个配置文件：
```shell
nano pip.conf
```
然后把配置文件拷贝进去，保存即可生效

:::code-group
```[pip.conf]
[global]
timeout = 6000
index-url = http://mirrors.aliyun.com/simple/
trusted-host = mirrors.aliyun.com
```
:::