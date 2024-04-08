---
title: Flask-SQLAlchemy 快速上手
description: Flask-SQLAlchemy 是 flask 的一个拓展插件，专门添加对 SQLAlchemy 的支持（ORM，关系对象模型）。使用它可以在 flask 中使用对象直接与 SQLAlchemy 进行交互，大大简化了 SQLAlchemy 与 flask 结合使用的过程，提供了非常方便的一些操作对象，例如引擎、模型、会话、请求等。
date: 2023-06-18
tags:
  - flask
  - flask 插件
---

# Flask-SQLAlchemy

Flask-SQLAlchemy 是 flask 的一个拓展插件，专门添加对 SQLAlchemy 的支持（ORM，关系对象模型）。使用它可以在 flask 中使用对象直接与
SQLAlchemy 进行交互，大大简化了 SQLAlchemy 与 flask 结合使用的过程，提供了非常方便的一些操作对象，例如引擎、模型、会话、请求等。

Flask-SQLAlchemy 不会改变 SQLAlchemy 的工作或使用方式。请参阅 SQLAlchemy 文档以了解如何深入使用 ORM。此处的文档仅涵盖设置扩展，而不涉及如何使用
SQLAlchemy。

> 注意，sqlalchemy 2.0 之后与之前的 1.4 差距蛮大。flask-sqlalchemy 3.0 版本与之前的差距也蛮大。使用是请注意版本。

## 快速开始

Flask-SQLAlchemy 内部封装了很多 SQLAlchemy 的操作来简化 SQLAlchemy 的使用。虽然新增了一些新的有用的功能，但它仍然可以像
SQLAlchemy 一样使用。

本页将带你了解 Flask-SQLAlchemy 的基本使用，有关完整功能和自定义，请参阅文档的其他部分，包括 `SQLAlchemy` 对象的 API 文档。

### 查阅 SQLAlchemy 文档

Flask-SQLAlchemy 是 SQLAlchemy 的一些操作。你应该遵循 SQLAlchemy 的教程来了解并使用它，请查询其文档获取有关功能的详细信息。本文展示了如何设置
Flask-SQLAlchemy 本身，而不是如何使用 SQLAlchemy 。Flask-SQLAlchemy 会自动设置引擎、声明模型类、作用域会话，因此你可以跳过
SQLAlchemy 教程的这部分内容。

### 安装

Flask-SQLAlchemy 在 pypi 上就有，可以直接使用 pip 指令进行安装。例如，要使用最新版本的，可以用 pip 安装或更新到最新版本。

```shell
pip install -U Flask-SQLAlchemy
```

### 配置插件

唯一需要的 Flask 应用程序配置是 `SQLALCHEMY_DATABASE_URI` 键。这是一个连接字符串，它告诉 SQLAlchemy 要连接到哪个数据库。

创建 Flask 应用程序对象之后，加载配置，然后通过调用 `db.init_app` 使用应用程序初始化 `SQLAlchemy` 扩展类。此示例连接到
SQLite 数据库，该数据库存储在应用程序的实例文件夹中。

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# 创建拓展插件实例
db = SQLAlchemy()
# 创建应用程序 app
app = Flask(__name__)
# 配置 SQLite 数据库, 默认存放在 app instance 文件夹下
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
# 讲拓展插件对象绑定到程序实例
db.init_app(app)
```

`db` 对象使您可以访问 `db.Model` 类来定义模型，并访问 `db.session` 来执行查询。

有关链接字符串的说明以及使用的其他配置键，请参阅 [配置](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/config/) , `SQLAlchemy`
对象还采用一些参数来自定义它管理的对象。

### 定义模型

子类 `db.Model` 以定义模型类。 `db` 对象使 `sqlalchemy` 和 `sqlalchemy.orm` 中的名称方便使用，例如 `db.Column`
。该模型将通过将 `CamelCase` 类名转换为 `snake_case` 来生成表名。

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String)
```

表名 `"user"` 将自动分配给模型的表。

有关定义和创建模型和表的更多信息，请参阅[模型和表](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/models/)。

### 创建表

定义所有模型和表后，调用 `SQLAlchemy.create_all()` 在数据库中创建表模式。这需要一个应用程序上下文。由于此时您不在请求中，请手动创建一个。

```python
with app.app_context():
    db.create_all()
```

如果在其他模块中定义了模型，则必须在调用 `create_all` 之前导入它们，否则 SQLAlchemy 将不知道它们，就不会创建对应的数据表。

### 数据查询

在 Flask 视图或 CLI 命令中，可以使用 `db.session` 来执行查询和修改模型数据。

SQLAlchemy 自动为每个模型定义一个 `__init__` 方法，该方法将任何关键字参数分配给相应的数据库列和其他属性。

`db.session.add(obj)` 将对象添加到会话中，以便插入。修改对象的属性会更新对象。 `db.session.delete(obj)`
删除一个对象。请记住在修改、添加或删除任何数据后调用 `db.session.commit()` 。

`db.session.execute(db.select(...))` 构造一个查询以从数据库中选择数据。构建查询是 SQLAlchemy
的主要功能，因此你需要阅读其关于 [select](https://docs.sqlalchemy.org/en/20/tutorial/data_select.html)
的教程以了解所有相关信息。你通常会使用 `Result.scalars()` 方法获取结果列表，或使用 `Result.scalar()` 方法获取单个结果。

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String)

    def json(self):
        return {"id": self.id, "username": self.username, "email": self.email}


with app.app_context():
    db.create_all()


@app.get("/user")
def user_list():
    users = db.session.execute(db.select(User).order_by(User.username)).scalars()
    return {"message": "ok", "data": [user.json() for user in users]}


@app.post("/user")
def create_user():
    data = request.get_json()
    user = User(username=data.get("username"), email=data.get("email"))
    db.session.add(user)
    db.session.commit()
    return {"message": "ok", "data": user.json()}


@app.get("/user/<int:uid>")
def user_detail(uid):
    user = db.get_or_404(User, uid)
    return {"message": "ok", "data": user.json()}


@app.delete("/user/<int:uid>")
def user_delete(uid):
    user = db.get_or_404(User, uid)
    db.session.delete(user)
    db.session.commit()
    return {"message": "ok", "data": user.json()}
```

您可能会看到使用 `Model.query` 来构建查询。这是一个较旧的查询接口，在 SQLAlchemy
中被认为是遗留的。更喜欢使用 `db.session.execute(db.select(...))` 。

有关查询的更多信息，请参阅[修改和查询数据](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/queries/)。

```python
# 测试代码
from faker import Faker
import requests

faker = Faker('zh-CN')
response = requests.get('http://127.0.0.1:5000/user')
print(response.json())

for i in range(10):
    user = {
        'username': faker.name(),
        'email': faker.email(),
    }
    response = requests.post('http://127.0.0.1:5000/user', json=user)
    print(response.json())

response = requests.get('http://127.0.0.1:5000/user/1')
print(response.json())

response = requests.delete('http://127.0.0.1:5000/user/1')
print(response.json())
```

### 记住什么

大多数情况下，您应该照常使用 SQLAlchemy。 `SQLAlchemy` 扩展实例创建、配置并授予对以下内容的访问权限：

+ `SQLAlchemy.Model` 声明模型基类。它自动设置表名而不需要 `__tablename__` 。
+ `SQLAlchemy.session` 是一个作用域为当前 Flask 应用程序上下文的会话。每次请求后都会清理它。
+ `SQLAlchemy.metadata` 和 `SQLAlchemy.metadatas` 允许访问配置中定义的每个元数据。
+ `SQLAlchemy.engine` 和 `SQLAlchemy.engines` 允许访问配置中定义的每个引擎。
+ `SQLAlchemy.create_all()` 创建所有表。
+ 您必须处于活动的 Flask 应用程序上下文中才能执行查询并访问会话和引擎。

## 模型与数据表

使用 `db.Model` 类定义模型，或使用 `db.Table` 类创建表。两者都处理 Flask-SQLAlchemy 的绑定键以与特定引擎关联。

### 定义模型

有关以声明方式定义模型类的完整信息，请参阅 SQLAlchemy
的 [声明性文档](https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html)。

子类 `db.Model` 以创建模型类。这是一个 SQLAlchemy 声明性基类，它将采用 `Column` 属性并创建一个表。与普通 SQLAlchemy
不同，如果未设置 `__tablename__` 并且定义了主键列，Flask-SQLAlchemy 的模型将自动生成表名。

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy as sa

db = SQLAlchemy()
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
db.init_app(app)


class User(db.Model):
    id = sa.Column(sa.Integer, primary_key=True)
    type = sa.Column(sa.String)
```

为方便起见，扩展对象提供对 `sqlalchemy` 和 `sqlalchemy.orm` 模块中名称的访问。所以你可以使用 `db.Column`
而不是导入和使用 `sqlalchemy.Column` ，尽管两者是等价的。

定义模型不会在数据库中创建它。在定义模型和表后使用 `create_all()` 创建它们。如果您在子模块中定义模型，则必须导入它们，以便
SQLAlchemy 在调用 `create_all` 之前知道它们。

```python
with app.app_context():
    db.create_all()
```

### 定义表

有关定义表对象的完整信息，请参阅 SQLAlchemy 的[表文档](https://docs.sqlalchemy.org/core/metadata.html)。

创建 `db.Table` 的实例来定义表。该类采用表名，然后是任何列和其他表部分，例如列和约束。与普通的 SQLAlchemy 不同， `metadata`
参数不是必需的。将根据 `bind_key` 参数选择元数据，否则将使用默认值。

直接创建表的一个常见原因是在定义多对多关系时。关联表不需要自己的模型类，因为它将通过相关模型上的相关关系属性进行访问。

```python
import sqlalchemy as sa

user_book_m2m = db.Table(
    "user_book",
    sa.Column("user_id", sa.ForeignKey(User.id), primary_key=True),
    sa.Column("book_id", sa.ForeignKey(Book.id), primary_key=True),
)
```

## 修改与查询

### 增、改、删

有关使用 ORM 修改数据的更多信息，请参阅 SQLAlchemy
的 [ORM 教程](https://docs.sqlalchemy.org/tutorial/orm_data_manipulation.html) 和其他 SQLAlchemy 文档。

要插入数据，请将模型对象传递给 `db.session.add()` ：

```python
user = User()
db.session.add(user)
db.session.commit()
```

要更新数据，请修改模型对象的属性：

```python
user.verified = True
db.session.commit()
```

要删除数据，将模型对象传递给 `db.session.delete()` ：

```python
db.session.delete(user)
db.session.commit()
```

修改数据后，必须调用 `db.session.commit()` 将修改提交到数据库。否则，它们将在请求结束时被丢弃。

### 查询

有关使用 ORM 查询数据的更多信息，请参阅 SQLAlchemy
的[查询指南](https://docs.sqlalchemy.org/en/20/orm/queryguide/index.html)和其他 SQLAlchemy 文档。

查询通过 `db.session.execute()` 执行。它们可以使用 `select()` 构造。执行 select 会返回一个 `Result` 对象，该对象具有许多用于处理返回行的方法。

```python
users = db.session.execute(db.select(User).order_by(User.username)).scalars()
print([user.json() for user in users])

username = '刘桂花'
user = db.session.execute(db.select(User).filter_by(username=username)).scalar()
print(user)
```

### 视图查询

如果您编写一个 Flask 视图函数，则返回一个 `404 Not Found` 错误以丢失条目通常很有用。 Flask-SQLAlchemy 提供了一些额外的查询方法。

+ [`SQLAlchemy.get_or_404()`](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/api/#flask_sqlalchemy.SQLAlchemy.get_or_404 "flask_sqlalchemy.SQLAlchemy.get_or_404")
  如果具有给定 id 的行不存在， `SQLAlchemy.get_or_404()` 将引发 404，否则它将返回实例。
+ [`SQLAlchemy.first_or_404()`](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/api/#flask_sqlalchemy.SQLAlchemy.first_or_404 "flask_sqlalchemy.SQLAlchemy.first_or_404")
  如果查询未返回任何结果， `SQLAlchemy.first_or_404()` 将引发 404，否则将返回第一个结果。
+ [`SQLAlchemy.one_or_404()`](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/api/#flask_sqlalchemy.SQLAlchemy.one_or_404 "flask_sqlalchemy.SQLAlchemy.one_or_404")
  如果查询没有准确返回一个结果， `SQLAlchemy.one_or_404()` 将引发 404，否则将返回结果。

### 遗留查询接口

您可能会看到使用 `Model.query` 或 `session.query` 来构建查询。该查询接口在 SQLAlchemy
中被认为是遗留的。更喜欢使用 `session.execute(select(...))` 。
有关文档，请参阅[旧版查询接口](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/legacy-query/)。

### 分页查询

如果有很多结果，你可能只想一次显示特定数量，允许用户单击下一个和上一个链接来查看数据页面。这有时称为分页，并使用 `paginate`
实现。

在 select
语句上调用 [`SQLAlchemy.paginate()`](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/api/#flask_sqlalchemy.SQLAlchemy.paginate)
以获得 [`Pagination`](https://flask-sqlalchemy.palletsprojects.com/en/3.0.x/api/#flask_sqlalchemy.pagination.Pagination)
对象。

在请求期间，这将从查询字符串 `request.args` 中获取 `page` 和 `per_page` 参数。传递 `max_per_page`
以防止用户在单个页面上请求太多结果。如果未给出，默认值为第 1 页，每页 20 个项目。

```python
page = db.paginate(db.select(User).order_by(User.id))
print(page.items)
```
