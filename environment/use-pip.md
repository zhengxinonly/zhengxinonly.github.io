---
title: pip 的使用
description: pip 是 Python 的包管理器。
date: 2023-05-15
tags:
  - Python 环境
---

# pip 的使用

**查看帮助：**

```
$ pip -h

Usage:
  pip <command> [options]

Commands:
  install                     Install packages.
  download                    Download packages.
  uninstall                   Uninstall packages.
  freeze                      Output installed packages in requirements format.
  inspect                     Inspect the python environment.
  list                        List installed packages.
  show                        Show information about installed packages.
  check                       Verify installed packages have compatible dependencies.
  config                      Manage local and global configuration.
  search                      Search PyPI for packages.
  cache                       Inspect and manage pip's wheel cache.
  index                       Inspect information available from package indexes.
  wheel                       Build wheels from your requirements.
  hash                        Compute hashes of package archives.
  completion                  A helper command used for command completion.
  debug                       Show information useful for debugging.
  help                        Show help for commands.
```

## 1. 安装

1）安装指定包

```
pip install flask
```

2）安装 `requirements.txt` 文件列出的包

```
pip install -r requriements.txt
```

3）安装 whl 文件

```
pip install wheel
pip install xxxx.whl
```

常用参数主要包括：`-i <url>` 或者 `--index-url <url>`：指定安装源，通常设为国内源会更快

## 2. 更新

```javascript
pip
install--
upgrade
包名称
```

如果要指定升级到某个版本，可以使用 `pip install --upgrade 包名称==版本号`

**注意**：不要使用 `pip install --upgrade pip` 更新pip自身，否则会在更新 pip 的时候删除掉 pip，然后出现 No module named
pip 的情况 ，可运行如下命令安装 pip ： `python -m ensurepip` 如果要更新 pip 自身，可以使用如下命令： `python -m pip install
--upgrade pip`

## 3. 删除

删除指定的包

```
pip uninstall 包名
```

删除 `requriements.txt` 文件中列出的包

```
pip uninstall -r requriements.txt
```

## 4. 查看

列出安装的所有包：

```
pip list
```

查看某一个包的具体信息

```
pip show 包名
```

## 5. 导出安装包列表

```
pip freeze > requirements.txt
```

导出 `pip` 所在环境中所安装的所有包，将其输出到 `requirements.txt` 文件中
