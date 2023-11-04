---
title: Python 虚拟环境
description: python 虚拟环境，可以认为是 python 环境的多个副本，只是在不同的副本中安装了不同的包。虚拟环境与全局环境不一样：虚拟环境中一般不包含标准库；不包含 python 解释器运行时所需的依赖文件。
date: 2023-05-15
tags:
  - Python 环境
---

# Python 虚拟环境

什么是 python 环境，我们来看一下以下常见：

- 有两个项目 A 和 B，如果 A 和 B 都要用到某一模块，但版本不相同怎么办？
- 在使用 pip 安装包时，会发现在安装的时候会安装其它的依赖包，但当我们用 pip 移除一个包时，却只移除了指定的包

为了解决上面的问题，python
使用了虚拟环境这个概念，可以认为是 python 环境的多个副本，只是在不同的副本中安装了不同的包。虚拟环境与全局环境不一样：虚拟环境中一般不包含标准库；不包含
python 解释器运行时所需的依赖文件；

常用的管理虚拟环境有一下几个

+ Virtualenv（支持 python2 和 python3，不好用）
+ venv （官方python3.3之后新增，方便，有时候有问题，推荐）
+ pipenv（之前有大坑，现在不清楚，不推荐）
+ conda（没用过，不推荐）
+ poetry（好用，就是有点复杂，推荐）

## venv

Python 从3.3 版本开始，自带了一个虚拟环境模块 [venv](https://docs.python.org/3/library/venv.html)
，关于该模块的详细介绍，可参考 [PEP-405](http://legacy.python.org/dev/peps/pep-0405/) 和。

### 1. 命令概览

查看venv帮助信息：

```
python -m venv -h
```

### 2. 创建虚拟环境

```
python -m venv venv_demo
```

如果是 windows 下生成的目录结构如下

```
C:\Users\xxp\Desktop\venv_demo>tree /f 
│  pyvenv.cfg
│
├─Include
├─Lib
│  └─site-packages
└─Scripts
        activate
        activate.bat
        Activate.ps1
        deactivate.bat
        pip.exe
        pip3.10.exe
        pip3.exe
        python.exe
        pythonw.exe
```

linux 下是这样的

```
.
├── bin
│     ├── activate
│     ├── activate.csh
│     ├── activate.fish
│     ├── Activate.ps1
│     ├── pip
│     ├── pip3
│     ├── pip3.10
│     ├── python -> python3
│     ├── python3 -> /usr/bin/python3
│     └── python3.10 -> python3
├── include
├── lib
│     └── python3.10
│         └── site-packages
├── lib64 -> lib
└── pyvenv.cfg
```

### 3. 虚拟环境的激活

windows 下在虚拟环境的 Scripts 目录中有两个脚本文本 `activate.bat` 和 `deactivate.bat` ，分别用于激活虚拟环境和退出虚拟环境。

1、cmd 命令下进入虚拟环境之后会添加前缀

```
C:\Users\xxp\Desktop\venv_demo>Scripts\activate.bat
(venv_demo) C:\Users\xxp\Desktop\venv_demo>
```

2、退出虚拟环境之后会消失

```
(venv_demo) C:\Users\xxp\Desktop\venv_demo>Scripts\deactivate.bat
C:\Users\xxp\Desktop\venv_demo>
```

关于 pip 指令的用法可以查看 [pip 的使用](use-pip.md)

## poetry 的使用

poetry 是一个 Python 虚拟环境和依赖管理的工具，可以用来代替 venv、pipenv。poetry 和 pipenv 类似，另外还提供了打包和发布的功能。

官方文档：[https://python-poetry.org/docs/](https://python-poetry.org/docs/)

**安装**

```
pip install poetry 
```

### 已有项目添加 poetry 管理

poetry 可以输入 poetry new 来创建一个项目脚手架，包括基本结构、pyproject.toml 文件。

```
ubuntu@VM-4-12-ubuntu:~$ python3 -m poetry new poetry_demo
Created package poetry_demo in poetry_demo
ubuntu@VM-4-12-ubuntu:~$ cd poetry_demo/
ubuntu@VM-4-12-ubuntu:~/poetry_demo$ tree
.
├── poetry_demo
│     └── __init__.py
├── pyproject.toml
├── README.md
└── tests
    └── __init__.py

2 directories, 4 files
```

如果不想使用默认的模板，推荐在已有项目添加 poetry 管理。 在已有的项目使用 poetry ，只需要执行 poetry init 命令来创建一个
pyproject.toml 文件，可看到有很多提示输入，不确定的内容就先按下 Enter 使用默认值，后续可以再修改 pyproject.toml 文件。
指定依赖的环节也可以跳过，后续再安装会更加高效。

```
ubuntu@VM-4-12-ubuntu:~$ mkdir poetry_demo2
ubuntu@VM-4-12-ubuntu:~$ cd poetry_demo2
ubuntu@VM-4-12-ubuntu:~/poetry_demo2$ python3 -m poetry init

This command will guide you through creating your pyproject.toml config.

Package name [poetry_demo2]:
Version [0.1.0]:
Description []:
Author [None, n to skip]:  zhengxinonly
License []:
Compatible Python versions [^3.10]:

Would you like to define your main dependencies interactively? (yes/no) [yes]
You can specify a package in the following forms:
  - A single name (requests): this will search for matches on PyPI
  - A name and a constraint (requests@^2.23.0)
  - A git url (git+https://github.com/python-poetry/poetry.git)
  - A git url with a revision (git+https://github.com/python-poetry/poetry.git#develop)
  - A file path (../my-package/my-package.whl)
  - A directory (../my-package/)
  - A url (https://example.com/packages/my-package-0.1.0.tar.gz)

Package to add or search for (leave blank to skip):

Would you like to define your development dependencies interactively? (yes/no) [yes]
Package to add or search for (leave blank to skip):

Generated file

[tool.poetry]
name = "poetry-demo2"
version = "0.1.0"
description = ""
authors = ["zhengxinonly"]
readme = "README.md"
packages = [{include = "poetry_demo2"}]

[tool.poetry.dependencies]
python = "^3.10"


[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"


Do you confirm generation? (yes/no) [yes]

```

这样就会在当前目录下生成一个 pyproject.toml 文件，里面就有刚刚设置好的内容。

### 创建虚拟环境

1、利用 virtualenvs.create=true 自动创建 当参数 virtualenvs.create=true 时，执行 poetry install 或 poetry add
时会检测当前项目是否有虚拟环境，没有就自动创建。

```
$ poetry add requests
Creating virtualenv py-demo-dWth49HK-py3.10 in C:\Users\pc\AppData\Local\pypoetry\Cache\virtualenvs
Using version ^2.28.1 for requests

Updating dependencies
Resolving dependencies... Downloading https://files.pythonhosted.org/packages/1d/38/fa96a426e0c0e68aabc68e896584b83ad1eeResolving dependencies... (6.3s)

Writing lock file

Package operations: 5 installs, 0 updates, 0 removals

  • Installing certifi (2022.9.24)
  • Installing charset-normalizer (2.1.1)
  • Installing idna (3.4)
  • Installing urllib3 (1.26.12)
  • Installing requests (2.28.1)

```

2、利用 poetry env use 创建

这个命令，可以指定创建虚拟环境时使用的 Python 解释器版本。

```
$ poetry env use python
Creating virtualenv py-demo-dWth49HK-py3.10 in C:\Users\pc\AppData\Local\pypoetry\Cache\virtualenvs
Using virtualenv: C:\Users\pc\AppData\Local\pypoetry\Cache\virtualenvs\py-demo-dWth49HK-py3.10
```

从提示信息，可以看到使用了那个解释器创建虚拟环境. 使用这个命令后，会在虚拟环境路径下创建一个 envs.toml 文件，用来存储哪些虚拟环境指定了
Python 解释器的版本。

```
[py-demo-dWth49HK]
minor = "3.10"
patch = "3.10.8"
```

### 激活虚拟环境

执行 poetry 的命令并不需要激活虚拟环境，因为 poetry 会自动检测当前虚拟环境，如果想在当前目录对应的虚拟环境中执行命令，可以使用以下命令：

```
poetry run <你的命令>
# 例如： poetry run python flask.py
```

如果想显示的激活虚拟环境，使用如下命令：

```
poetry shell
```

### 安装依赖

+ poetry add flask ：安装最新稳定版本的
+ flask poetry add pytest --dev : 指定为开发依赖，会写到 pyproject.toml 中的 `[tool.poetry.dev-dependencies]`区域
+ poetry add flask=2.22.0 : 指定具体的版本
+ poetry install : 安装 pyproject.toml 文件中的全部依赖
+ poetry install --no-dev ： 只安装非 development 环境的依赖，一般部署时使用

### 附录

更多内容推荐阅读： [使用 Python Poetry 进行依赖项管理（翻译）](https://muzing.top/posts/3fa905f9/) 

