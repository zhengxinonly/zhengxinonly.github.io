---
title: Linux 防火墙管理（uwf）
description: Linux 防火墙管理
date: 2023-07-04
tags:
  - Linux
---

1、 安装

```shell
sudo apt install ufw
```

2、 相关命令

```shell
#查看防火墙规则 以及相关开启端口
ufw status
#开启防火墙
ufw enable 
#关闭防火墙
ufw disable
#重启防火墙
ufw reload
#开启指定tcp或者udp端口
ufw allow 22/tcp

#同时开启tcp与udp端口
ufw allow 445

#删除53端口
ufw delete allow 53

#拒绝指定tcp或者udp端口
allow/deny 20/tcp
allow/deny 20/udp

#ip访问所有端口
sudo ufw allow from 192.168.8.8

#开启指定范围端口
ufw allow proto tcp from any to any port 16300:32768

#删除指定范围端口
ufw delete allow proto udp from any to any port 16384:32768

#禁止某项规则
sudo ufw deny smtp

#删除某项规则
sudo ufw delete allow smtp

#外来访问默认允许
ufw default allow/deny

#允许HTTP流量（端口80 ）
sudo ufw allow in on eth0 to any port 80

#允许MySQL数据库服务器（端口3306 ）
sudo ufw allow in on eth1 to any port 3306

```

开启 80 和 443 端口

```shell
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow OpenSSH

sudo ufw delete allow OpenSSH
```