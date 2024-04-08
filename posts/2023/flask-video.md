---
title: flask 实现简易视频播放网站案例
description: 使用 flask 技术，搭建一个简单的视频播放网站，包含上传、观看功能。
date: 2023-07-08
tags:
  - flask
---

# flask 实现简易视频播放网站案例

本视频主要实现两个目的，上传视频、播放视频。

使用技术： flask、flask-sqlalchemy、layui 

视频地址： https://www.bilibili.com/video/BV1QV411N7qy/

## 搭建项目

直接新建一个 flask 项目，然后下载 layui 的静态文件丢到 static 目录下。然后再编写视频信息展示的首页。当然在此之前需要先做好数据库的模型创建，否则视频信息展示的时候会出问题。

### 创建项目

直接用 pycharm 创建一个 flask 项目，创建成功后目录如下

```
X:\flask-video>tree /f
X:.
│  app.py
│
├─static
└─templates
```

然后访问 [https://layui.dev/](https://layui.dev/) ，点击直接下载之后就能得到 layui 的静态文件，将其复制到 static 目录下，完成之后的目录结构如下

```
X:\flask-video>tree /f
X:.
│  app.py
│
├─static
│  │  layui.js
│  │
│  ├─css
│  │      layui.css
│  │
│  └─font
│          iconfont.eot
│          iconfont.svg
│          iconfont.ttf
│          iconfont.woff
│          iconfont.woff2
│
└─templates
```

### 配置插件

1、安装插件

```shell
pip install flask-sqlalchemy
```

2、添加配置文件

```python
# 配置 SQLite 数据库, 默认存放在 app instance 文件夹下  
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flask-video.db"  
# 图片默认的上传地址  
app.config["UPLOAD_FOLDER"] = 'static/upload/video'
```

3、创建实例对象

```python
from flask_sqlalchemy import SQLAlchemy

# 创建拓展插件实例  
db = SQLAlchemy()  
# 将拓展插件对象绑定到程序实例  
db.init_app(app)
```

4、创建视频数据模型

```python
import sqlalchemy as sa

class MovieORM(db.Model):
    __tablename__ = 'movie'
    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    name = sa.Column(sa.String(255), nullable=False)
    url = sa.Column(sa.String(255), nullable=False)
    create_at = sa.Column(sa.DateTime, default=datetime.now)
```

5、生成测试数据

```python
@app.cli.command()
def create():
    db.drop_all()
    db.create_all()

    mv = MovieORM()
    mv.name = '默认演示电影'
    mv.url = '/static/upload/video/7e245fc2483742414604ce7e67c13111.mp4'
    db.session.add(mv)
    db.session.commit()
```

## 视频观看

1、后端返回数据

```python
@app.route('/')
def hello_world():
    q = db.select(MovieORM)
    movie_list = db.session.execute(q).scalars()
    return render_template('index.html', movie_list=movie_list)
```
2、前端渲染基础页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>正心的视频播放网站</title>
    <link rel="stylesheet" href="/static/css/layui.css">
    <style>
        .title {
            margin-top: 100px;
            text-align: center;
            font-size: 52px;
        }
    </style>
</head>
<body>

<h2 class="title">正心の专属视频播放网站</h2>

<div class="layui-container">

</div>

<script src="/static/layui.js"></script>
</body>
</html>
```

3、渲染搜索表单

```html
<div class="layui-form" style="width: 50%;margin: 20px auto;">
    <div class="layui-form-item">
        <div class="layui-input-group">
            <input type="text" placeholder="请输入电影名" class="layui-input">
            <div class="layui-input-suffix">
                <button type="submit" class="layui-btn" lay-submit lay-filter="demo1">点击搜索</button>
                <a href="/upload_movie" class="layui-btn layui-btn-primary layui-border-green">我要上传</a>
            </div>
        </div>
    </div>
</div>
```

4、渲染视频数据

```html
<table class="layui-table" style="width: 50%;margin: 0 auto">
    <colgroup>
        <col width="120">
        <col width="180">
        <col>
    </colgroup>
    <thead>
    <tr>
        <th>电影名</th>
        <th>上传时间</th>
        <th>观看</th>
    </tr>
    </thead>
    <tbody>
    {% for movie in movie_list %}
        <tr>
            <td>{{ movie.name }}</td>
            <td>{{ movie.create_at.strftime('%Y-%m-%d %H:%M:%S') }}</td>
            <td><a href="{{ movie.url }}" class="layui-btn  layui-btn-sm">点击观看</a>
                <a href="/video_view?url={{ movie.url }}" class="layui-btn  layui-btn-sm">点击观看2</a>
            </td>
        </tr>
    {% endfor %}
    </tbody>
</table>
```

5、新窗口播放视频

先处理后端接口请求

```python
@app.route('/video_view')
def video_view():
    url = request.args.get('url')
    return render_template('video_view.html', url=url)
```

然后再在前端进行渲染

```html
<!--filename:video_view.html-->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>上传视频 | 正心的视频播放网站</title>
    <link rel="stylesheet" href="/static/css/layui.css">
    <style>
        .title {
            margin-top: 100px;
            text-align: center;
            font-size: 52px;
        }
    </style>
</head>
<body>
<div class="layui-container">
    <h2 class="title">视频观看</h2>
    <video style="max-width: 100%;" controls="controls" poster="{{ url }}">
        <source src="{{ url }}" type="video/mp4"/>
    </video>
</div>
<script src="/static/layui.js"></script>
</body>
</html>
```

## 视频上传

1、后端返回视频上传页面

```python
@app.get('/upload_movie')
def upload_movie():
    return render_template('video_upload.html')

```

2、前端进行视频上传

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>上传视频 | 正心的视频播放网站</title>
    <link rel="stylesheet" href="/static/css/layui.css">
    <style>
        .title {
            margin-top: 100px;
            text-align: center;
            font-size: 52px;
        }
    </style>
</head>
<body>
<div class="layui-container">
    <h2 class="title">上传视频文件</h2>
    <div style="width: 50%;margin: 0 auto">
            <button type="button" class="layui-btn demo-class-accept" lay-options="{accept: 'video'}">
        <i class="layui-icon layui-icon-upload"></i>
        上传视频
    </button>
    </div>

</div>
<script src="/static/layui.js"></script>
<script>
    layui.use(function () {
        var upload = layui.upload;
        var layer = layui.layer;
        // 渲染
        upload.render({
            elem: '.demo-class-accept', // 绑定多个元素
            url: '/video_upload', // 此处配置你自己的上传接口即可
            accept: 'file', // 普通文件
            done: function (res) {
                layer.msg('上传成功');
                console.log(res);
            }
        });
    });
</script>
</body>
</html>
```

3、后端接受并保存视频

```python
@app.post('/video_upload')
def upload_movie2():
    file = request.files['file']
    if file:
        filename = file.filename
        content = file.read()
        name = hashlib.md5(content).hexdigest()
        suffix = os.path.splitext(filename)[-1]
        new_filename = name + suffix
        new_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        open(new_path, mode='wb').write(content)

        mv = MovieORM()
        mv.url = '/' + new_path
        mv.name = filename
        db.session.add(mv)
        db.session.commit()

    return {
        'code': 0, 'msg': '上传视频成功'
    }
```

## 项目后续

项目仅仅是一个小案例，不足的地方还有非常多，可以优化的地方也有很多
1. 视频信息没有实现删除功能。在实现删除功能的时候，不仅是需要删除数据库中的数据，还需要删除视频文件。
2. 视频信息没有完成修改的功能。
3. 上传的时候没有做限制，播放的时候也没有分片加载与加密。

有些知识点在往期的文章中有写过，在这里就不赘述了。
