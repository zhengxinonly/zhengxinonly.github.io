---
title: 使用 flask、htmx、tailwind 实现不需要 JavaScript 的网站小案例
description: 使用 flask + htmx + tailwind CSS 实现一个不需要写 JavaScript 的静态网站小案例
date: 2023-08-01
tags:
  - flask
---
# 使用 flask、htmx、tailwind 实现不需要 JavaScript 的网站小案例

序言：在很早之前，我就使用过 tailwind css 编写前端项目，也想将其使用在 flask 项目当中，但是国内的资源实在太少，恰巧最近看到一篇国外的文章，所以借助翻译工具来翻译一下。

原文地址： https://testdriven.io/blog/flask-htmx-tailwind/

在此教程中，您将学习如何使用 htmx 和 Tailwind CSS 设置 Flask。 htmx 和 Tailwind 的目标都是简化现代 Web 开发，以便您在无需离开
HTML 的舒适性和易用性的同时，确保设计与可交互性。我们还将了解如何使用 Flask-Assets 在 Flask 应用程序中打包和压缩静态资源。

## HTMX

htmx 是一个库，允许您直接从 HTML 访问现代浏览器功能，如 AJAX、CSS 转换、WebSocket 和服务器发送事件，而不是使用
JavaScript。它允许您直接使用标签快速构建用户界面。

htmx 扩展了浏览器中内置的几个功能，例如发出 HTTP 请求和响应事件。例如，您不仅可以通过`a`和`form`元素发出 GET 和 POST
请求，还可以使用 HTML 属性发送 GET、POST、PUT、PATCH 或 DELETE 请求在任何 HTML 元素上：

```
<button hx-delete="/user/1">Delete</button>
```

您还可以更新页面的部分内容以创建单页应用程序 (SPA)：

```html

<script src="https://unpkg.com/htmx.org@1.7.0"></script>

<button
        hx-get="https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode"
        hx-target="#output"
>Click Me
</button>

<p id="output"></p>
```

也可以在线体验： [CodePen link 代码笔链接](https://codepen.io/mjhea0/pen/RwoJYyx)

> 有关更多示例，请查看官方 htmx 文档中的 [UI 示例页面](https://htmx.org/examples/)。

### 优点和缺点

**优点：**

1. 开发人员的生产力：您无需 JavaScript
   即可构建现代用户界面。有关这方面的更多信息，请查看 [SPA 替代方案](https://htmx.org/essays/spa-alternative/)。
2. 功能强大：库本身很小（~10k min.gz'd）、无依赖且[可扩展](https://htmx.org/extensions/)。

**缺点：**

1. 库的成熟度：由于该库相当新，因此文档和示例实现很少。
2. 传输数据的大小：通常，SPA 框架（如 React 和 Vue）通过在客户端和服务器之间以 JSON 格式来回传递数据来工作。接收到的数据然后由客户端呈现。另一方面，htmx
   从服务器接收渲染的 HTML，并用响应替换目标元素。呈现格式的 HTML 在大小上通常比 JSON 响应大。

## Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) 是一个“实用性优先”的 CSS 框架。它不是提供预构建的组件（Bootstrap 和 Bulma
等框架专门提供的组件），而是以实用程序类的形式提供构建块，使人们能够快速轻松地创建布局和设计。

例如，采用以下 HTML 和 CSS：

```html

<style>
    .hello {
        height: 5px;
        width: 10px;
        background: gray;
        border-width: 1px;
        border-radius: 3px;
        padding: 5px;
    }
</style>

<div class="hello">Hello World</div>
```

这可以使用 Tailwind 来实现，如下所示：

```
<div class="h-1 w-2 bg-gray-600 border rounded-sm p-1">Hello World</div>
```

查看 [CSS Tailwind 转换器](https://tailwind-converter.netlify.app/)，将原始 CSS 转换为 Tailwind 中的等效实用程序类。比较结果。

**优点：**

1. 高度可定制：虽然 Tailwind 附带了预构建的类，但可以使用 tailwind.config.js 文件覆盖它们。
2. 优化：您可以[配置 Tailwind](https://tailwindcss.com/docs/content-configuration ) 通过仅加载实际使用的类来优化 CSS 输出。
3. 深色模式：实现 [深色模式](https://tailwindcss.com/docs/dark-mode )
   毫不费力——例如`<div class="bg-white dark:bg-black">`。

**缺点**:

1. 组件：Tailwind
   不提供任何官方预构建组件，如按钮、卡片、导航栏等。组件必须从头开始创建。有一些社区驱动的组件资源，例如 [Tailwind CSS Components](https://tailwindcomponents.com/ )
   和 [Tailwind Toolbox](https://www.tailwindtoolbox.com/ ) 等。 Tailwind
   制造商还提供了一个功能强大但需要付费的组件库，称为 [Tailwind UI](https://tailwindui.com/ )。
2. CSS 是内联的：它将内容和设计结合在一起，从而增加了页面大小并使 HTML 变得混乱。

## Flask-Assets

Flask-Assets 是一个为管理 Flask 应用程序中的静态资源而设计的扩展。使用它，您可以创建一个简单的静态资源管道：

1. 将 Sass 和 LESS 编译为 CSS 样式表
2. 将多个 CSS 和 JavaScript 文件组合并缩小为每个文件
3. 创建资源包以在模板中使用

接下来，让我们看看如何在 Flask 中使用上述每个工具！

## 项目设置

首先，为我们的项目创建一个新目录，创建并激活一个新的虚拟环境，然后安装 Flask 和 Flask-Assets：

```
$ mkdir flask-htmx-tailwind && cd flask-htmx-tailwind
$ python3.10 -m venv venv
$ source venv/bin/activate
(venv)$

(venv)$ pip install Flask==2.1.1 Flask-Assets==2.0
```

接下来，让我们安装 [pytailwindcss](https://github.com/timonweb/pytailwindcss) 并下载它的二进制文件：

```
(venv)$ pip install pytailwindcss==0.1.4
(venv)$ tailwindcss
```

接下来，添加一个 app.py 文件：

```
# app.py

from flask import Flask
from flask_assets import Bundle, Environment

app = Flask(__name__)

assets = Environment(app)
css = Bundle("src/main.css", output="dist/main.css")

assets.register("css", css)
css.build()
```

导入 [Bundle](https://flask-assets.readthedocs.io/en/latest/#flask_assets.Bundle)
和[Environment](https://flask-assets.readthedocs.io/en/latest/#flask_assets.Environment)
后，我们创建了一个新的`Environment`并通过`Bundle`向其中注册了 CSS 资源。

我们创建的包将 src/main.css 作为输入，然后在运行 Tailwind CSS CLI 时对其进行处理并输出到 dist/main.css。

> 由于所有 Flask 静态文件默认都驻留在“static”文件夹中，因此上述“src”和“dist”文件夹驻留在“static”文件夹中。

这样，我们就可以设置 Tailwind。

首先创建 Tailwind 配置文件：

```
(venv)$ tailwindcss init
```

此命令在项目的根目录中创建了 tailwind.config.js 文件。所有与 Tailwind 相关的自定义都进入此文件。

像这样更新 tailwind.config.js ：

```
module.exports = {
  content: [
    './templates/**/*.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

请注意 [content](https://tailwindcss.com/docs/content-configuration) 部分。在这里，您可以配置项目的 HTML 模板的路径。
Tailwind CSS 将扫描您的模板，搜索 Tailwind 类名称。生成的输出 CSS 文件将仅包含模板文件中找到的相关类名称的 CSS。这有助于保持生成的
CSS 文件较小，因为它们仅包含实际使用的样式。

将以下内容添加到 static/src/main.css 中：

```
/* static/src/main.css */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

在这里，我们定义了 Tailwind CSS 中的所有`base`、`components`和`utilities`类。

您现在已经连接了 Flask-Assets 和 Tailwind。接下来，我们将了解如何提供一个 index.html 文件来查看 CSS 的运行情况。

## 简单的例子

将路由添加到 app.py 中以运行 Flask 开发服务器，如下所示：

```
# app.py

from flask import Flask, render_template
from flask_assets import Bundle, Environment

app = Flask(__name__)

assets = Environment(app)
css = Bundle("src/main.css", output="dist/main.css")

assets.register("css", css)
css.build()


@app.route("/")
def homepage():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
```

创建一个 `templates` 文件夹。然后，向其中添加一个 base.html 文件：

```
<!-- templates/base.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {% assets 'css' %}
      <link rel="stylesheet" href="{{ ASSET_URL }}">
    {% endassets %}

    <title>Flask + htmlx + Tailwind CSS</title>
  </head>
  <body class="bg-blue-100">
    {% block content %}
    {% endblock content %}
  </body>
</html>
```

记下`{% assets 'css' %}`块。由于我们在应用程序环境中注册了 CSS 包，因此我们可以使用注册名称`css`
访问它，并且`{{ ASSET_URL }}`将自动使用该路径。

此外，我们通过`bg-blue-100`向 HTML 正文添加了一些颜色，这会将[背景颜色](https://tailwindcss.com/docs/background-color )
更改为浅蓝色。

注意: 附录中有一个地址可以查看预设样式

添加 index.html 文件：

```
<!-- templates/index.html -->

{% extends "base.html" %}

{% block content %}
<h1>Hello World</h1>
{% endblock content %}
```

现在，在项目的根目录中运行以下命令来扫描类模板并生成 CSS 文件：

```
(venv)$ tailwindcss -i ./static/src/main.css -o ./static/dist/main.css --minify
```

您应该在 “static” 文件夹中看到一个名为 “dist” 的新目录。

记下生成的 static/dist/main.css 文件。

通过`python app.py`启动开发服务器并在浏览器中导航到  `http://localhost:5000` 以查看结果。

配置 Tailwind 后，让我们将 htmx 添加到组合中并构建一个实时搜索，在您键入时显示结果。

## 实时搜索示例

我们不是从 CDN 获取 htmx 库，而是下载它并使用 Flask-Assets 捆绑它。

从 https://unpkg.com/htmx.org@1.7.0/dist/htmx.js 下载库并将其保存到“static/src” 。

现在，要为 JavaScript 文件创建新包，请更新 app.py，如下所示：

```
# app.py

from flask import Flask, render_template
from flask_assets import Bundle, Environment

app = Flask(__name__)

assets = Environment(app)
css = Bundle("src/main.css", output="dist/main.css")
js = Bundle("src/*.js", output="dist/main.js") # new

assets.register("css", css)
assets.register("js", js) # new
css.build()
js.build() # new


@app.route("/")
def homepage():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
```

在这里，我们创建了一个名为`js`的新包，它输出到 static/dist/main.js。由于我们在这里没有使用任何过滤器，因此源文件和目标文件将是相同的。

接下来，将新资源添加到我们的 base.html 文件中：

```
<!-- templates/base.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {% assets 'css' %}
      <link rel="stylesheet" href="{{ ASSET_URL }}">
    {% endassets %}

    <!-- new -->
    {% assets 'js' %}
      <script type="text/javascript" src="{{ ASSET_URL }}"></script>
    {% endassets %}

    <title>Flask + htmlx + Tailwind CSS</title>
  </head>
  <body class="bg-blue-100">
    {% block content %}
    {% endblock content %}
  </body>
</html>
```

为了让我们有一些数据可以使用，请将 https://github.com/testdrivenio/flask-htmx-tailwind/blob/master/todo.py 保存到名为
todo.py 的新文件中。

我们将添加根据每个待办事项的标题进行搜索的功能。

像这样更新 index.html 文件：

```
<!-- templates/index.html -->

{% extends 'base.html' %}

{% block content %}
<div class="w-small w-2/3 mx-auto py-10 text-gray-600">
  <input
    type="text"
    name="search"
    hx-post="/search"
    hx-trigger="keyup changed delay:250ms"
    hx-indicator=".htmx-indicator"
    hx-target="#todo-results"
    placeholder="Search"
    class="bg-white h-10 px-5 pr-10 rounded-full text-2xl focus:outline-none"
  >
  <span class="htmx-indicator">Searching...</span>
</div>

<table class="border-collapse w-small w-2/3 mx-auto">
  <thead>
    <tr>
      <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">#</th>
      <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Title</th>
      <th class="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Completed</th>
    </tr>
  </thead>
  <tbody id="todo-results">
    {% include 'todo.html' %}
  </tbody>
</table>
{% endblock content %}
```

让我们花点时间看一下 htmx 定义的属性：

```
<input
  type="text"
  name="search"
  hx-post="/search"
  hx-trigger="keyup changed delay:250ms"
  hx-indicator=".htmx-indicator"
  hx-target="#todo-results"
  placeholder="Search"
  class="bg-white h-10 px-5 pr-10 rounded-full text-2xl focus:outline-none"
>
```

1. 输入将 POST 请求发送到`/search`端点。
2. 该请求通过延迟 250 毫秒的 keyup 事件触发。因此，如果在上次 keyup 后 250 毫秒内输入新的 keyup 事件，则不会触发该请求。
3. 然后，请求的 HTML 响应将显示在`#todo-results`元素中。
4. 我们还有一个指示器，一个加载元素，在发送请求后出现，在响应返回后消失。
   添加 templates/todo.html 文件：

```
<!-- templates/todo.html -->

{% if todos|length>0 %}
  {% for todo in todos %}
    <tr class="bg-white lg:hover:bg-gray-100 flex lg:table-row flex-row lg:flex-row flex-wrap lg:flex-no-wrap mb-10 lg:mb-0">
      <td class="w-full lg:w-auto p-3 text-gray-800 text-center border border-b block lg:table-cell relative lg:static">{{todo.id}}</td>
      <td class="w-full lg:w-auto p-3 text-gray-800 text-center border border-b block lg:table-cell relative lg:static">{{todo.title}}</td>
      <td class="w-full lg:w-auto p-3 text-gray-800 text-center border border-b block lg:table-cell relative lg:static">
        {% if todo.completed %}
          <span class="rounded bg-green-400 py-1 px-3 text-xs font-bold">Yes</span>
        {% else %}
          <span class="rounded bg-red-400 py-1 px-3 text-xs font-bold">No</span>
        {% endif %}
      </td>
    </tr>
  {% endfor %}
{% endif %}
```

该文件呈现与我们的搜索查询匹配的待办事项。

最后，将路由处理程序添加到 app.py：

```
@app.route("/search", methods=["POST"])
def search_todo():
    search_term = request.form.get("search")

    if not len(search_term):
        return render_template("todo.html", todos=[])

    res_todos = []
    for todo in todos:
        if search_term in todo["title"]:
            res_todos.append(todo)

    return render_template("todo.html", todos=res_todos)
```

`/search`端点搜索 todos 并呈现包含所有结果的 todo.html 模板。

更新头部的导入：

```
from flask import Flask, render_template, request
from flask_assets import Bundle, Environment

from todo import todos
```

接下来，更新输出 CSS 文件：

```
(venv)$ tailwindcss -i ./static/src/main.css -o ./static/dist/main.css --minify
```

使用`python app.py`运行应用程序并再次导航到  `http://localhost:5000` 进行测试：

https://testdriven.io/static/images/blog/flask-htmx-tailwind/demo.gif

## 结论

在本教程中，我们了解了如何：

+ 设置 Flask-Assets、htmx 和 Tailwind CSS
+ 使用 Flask、Tailwind CSS 和 htmx 构建实时搜索应用程序

htmx 可以渲染元素而无需重新加载页面。最重要的是，您无需编写任何 JavaScript
即可实现此目的。尽管这减少了客户端所需的工作量，但从服务器发送的数据可能会更大，因为它发送的是渲染的 HTML。

像这样提供部分 HTML 模板在 2000 年代初期很流行。 htmx 为这种方法提供了现代的转折。总的来说，由于 React 和 Vue
等框架的复杂性，提供部分模板再次变得流行。您还可以将 WebSocket 添加到组合中以提供实时更改。著名的 Phoenix LiveView
也使用了相同的方法。您可以在 Web 软件的未来是 HTML-over-WebSockets 和 HTML Over WebSockets 中阅读有关 HTML over
WebSockets 的更多信息。

这个库还很年轻，但未来看起来非常光明。

Tailwind 是一个强大的 CSS 框架，专注于提高开发人员的工作效率。尽管本教程没有涉及它，但 Tailwind 是高度可定制的。请查看以下资源以了解更多信息：

+ [Tailwind CSS Customization](https://tailwindcss.com/docs/configuration)
+ [自定义 Tailwind CSS 主题的完整指南](https://pinegrow.com/tutorials/customizing-a-tailwind-css-theme/)
+ [定制 Tailwind 设计系统](https://egghead.io/lessons/tailwind-customize-the-tailwind-design-system)

使用 Flask 时，请务必将 htmx 和 Tailwind 与 Flask-Assets 结合起来，以简化静态资产管理。

完整的代码可以在 [flask-htmx-tailwind](https://github.com/testdrivenio/flask-htmx-tailwind) 存储库中找到。

## 附录

tailwindi 预设样式： https://rogden.github.io/tailwind-config-viewer/ 

