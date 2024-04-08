---
title: flask-assets 实现对静态资源的打包与压缩
description: flask-assets 实现对 JavaScript、css 文件打包、压缩
date: 2023-08-01
tags:
  - flask
  - flask 插件
---
# flask-assets

在访问网站应用程序的时候，浏览器会加载 html 之后再下载很多的 CSS/JS 文件，发送很多的请求。虽然现在浏览器支持并行下载，但也是有限制的，所以这也成为了网页加载速度的一个瓶颈。

flask-assets 可以将多个 css/js 文件合并为一个文件，并且将其删除空白符、换行符、压缩，使其体积变小（将近30%）。并且 flask-assets 还会使用特定的 HTTP Response Header 能够让浏览器缓存这些文件，只有这些文件被修改时才会再次下载，提高程序的性能。

## 安装

使用 pip 进行安装

```
pip install Flask-Assets
pip install cssmin jsmin
```

## 用法

可以通过创建  [`Environment`](https://flask-assets.readthedocs.io/en/latest/#flask_assets.Environment "flask_assets.Environment") 实例来初始化应用程序，并且可以使用 bundles 构建打包内容，然后将其注册到 app 对象上

```python
from flask import Flask
from flask_assets import Environment, Bundle

app = Flask(__name__)
assets = Environment(app)

js = Bundle('jquery.js', 'base.js', 'widgets.js',
            filters='jsmin', output='dist/packed.js')
            
assets.register('js_all', js)
```

一个 Bundle 对象包含任意数量的源文件（也可以包含其他嵌套包）、过滤器列表、与输出目标。

所有路径都相对于应用程序的 static 目录或 Flask 蓝图的静态目录。

如果你愿意，也可以在外部配置文件中定义你的资源，并从那里读取它们。 `webassets` 包含一些适用于 YAML 等流行格式的[帮助器类](https://webassets.readthedocs.io/en/latest/loaders.html#loaders)。

与 Flask 的其他扩展一样，flask-asssets 实例可以通过 `init_app` 调用初始化来与多个应用程序一起使用，而不是传递固定的应用程序对象：

```python
app = Flask(__name__)
assets = flask_assets.Environment()
assets.init_app(app)
```

### 使用 bundles

现在，你的静态资源已正确定义，你希望合并并缩小它们，并在网页中包含指向压缩结果的链接：

```html
{% assets "js_all" %}
    <script type="text/javascript" src="{{ ASSET_URL }}"></script>
{% endassets %}
```

就是这样，真的。 Flask-Assets 将在模板首次渲染时自动合并和压缩捆绑包的源文件，并在每次源文件发生更改时自动更新压缩文件。如果您将应用程序配置中的 `ASSETS_DEBUG` 设置为 `True` ，则每个源文件将单独输出。

注意：
1. `Bundel()` 的构造器能够接受无限个文件名作为非关键字参数, 定义那些文件需要被打包, 这里主要打包本地 static 下的 CSS 和 JS 两种类型文件.
2. 关键字参数 `filters` 定义了这些需要被打包的文件通过那些过滤器(可以为若干个)进行预处理, 这里使用了 cssmin/jsmin 会将 CSS/JS 文件中的空白符和换行符去除.
3. 关键字参数 `output` 定义了打包后的包文件的存放路径
4. 上述的所有路径默认都在 `/static` 目录下操作


## 其他事项

### 开发环境不打包

在开发环境下不应该将 CSS/JS 文件打包, 因为我们可能会经常对这些文件进行修改, 所以需要设定在开发环境中不打包, 但生产环境中会自动进行打包.

```python
class DevConfig(Config):
    """Development config class."""

    ASSETS_DEBUG = True
```


### 新旧使用方式

新方式

```html
{% assets "main_css" %} 
	<link rel="stylesheet" type="text/css" href="{{ ASSET_URL }}"> 
{% endassets %}

{% assets "main_js" %}
	<script src="{{ ASSET_URL }}"></script>
{% endassets %}

```

旧方式

```html
<link rel="stylesheet" href="{{ url_for('static', filename='dist/main.css') }}">

<script src="{{ url_for('static', filename='dist/main.js') }}"></script>
```

### flask-assets 指令

可以使用 flask assets 指令进行单独的打包与操作。