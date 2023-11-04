---
title: 使用 Black 格式化 python 代码
description: 使用 Python 这么久以来，我尝过不少的代码格式化工具，但是因为配置麻烦最终都放弃了。直到遇见了 `black` 。这个工具实现了零配置将所有的代码格式统一，并且可以配置到 `pre-commit` ， 在用 Git 进行提交之前进行校验，这样就可以非常轻松的实现项目所有代码风格完全统一。
date: 2023-05-16
tags:
  - Python 代码质量
---

# black

使用 Python 这么久以来，我尝过不少的代码格式化工具，但是因为配置麻烦最终都放弃了。直到遇见了 `black`
。这个工具实现了零配置将所有的代码格式统一，并且可以配置到 `pre-commit` ， 在用 Git 进行提交之前进行校验，这样就可以非常轻松的实现项目所有代码风格完全统一。

## 安装与使用

可以通过 pip 直接从 PyPI 下载安装：

```shell  
pip install black  
```

> 注意需要 Python 3.6.2 以上的版本。

如果急于试用最新版本，可以通过下面的命令从 GitHub 安装（不推荐）：

```  
pip install git+git://github.com/psf/black  
```

**简单使用**

1、作为脚本运行

```shell  
black {source_file_or_directory}  
  
# black {文件或者目录}  
```

2、如果将 Black 作为脚本运行不起作用，您可以尝试将其作为包运行：

```shell  
python -m black {source_file_or_directory}  
```

3、如果想要将当前目录下所有文件格式化，也可以使用 `black .`

```
black .
```

接下来看一下效果

```shell
$ cat main.py                                
x = {  'a':37,'b':42,
    
'c':927}  

$ black main.py                              
reformatted main.py

All done! ✨ 🍰 ✨   
1 file reformatted.

$ cat main.py 
x = {"a": 37, "b": 42, "c": 927}
```

## 集成到 Pycahrm

[Black 官方文档](https://black.readthedocs.io/en/stable/integrations/editors.html#pycharm-intellij-idea) 提供了一种集成到
Pycahrm 的方案。

1、安装带有额外 `d` 的 `Black`

```
pip install 'black[d]'
```

2、安装[BlackConnect IntelliJ IDEs 插件](https://plugins.jetbrains.com/plugin/14321-blackconnect)
，也可以直接在插件商店搜索 `BlackConnect` 进行安装。

3、在 PyCharm 中打开插件配置，然后找到插件设置。按下图配置即可

![](https://images.zhengxinonly.com/zhengxin_notes/images/environment/assets/python-black/image-20230518232734511.png)

## 与 pre-commit 协同

[集成到 Git](https://black.readthedocs.io/en/stable/integrations/source_version_control.html)

## 附录

参考： [五彩斑斓的 Black —— Python 代码格式化工具](https://muzing.top/posts/a29e4743/) 