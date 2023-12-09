讲师：正心

b站账号：[正心全栈编程](https://space.bilibili.com/162101364)

视频地址：https://www.bilibili.com/video/BV1tg411X7o5/

源码：加微信 zhengxinonly 回复 `flask 权限管理源码` 免费获取

## ACL 介绍

ACL（Access Control List）访问控制列表，是Linux系统中的访问权限控制系统。可用于解决Linux基本文件权限系统中权限分配空白问题。

在网页程序中 ，存在普通用户，协管员，管理员等不同的角色，应当为不同的角色赋予不同的权限。各个用户只能在权限范围内访问页面、进行操作等。

通过一个例子来说明。本例中的用户分为4中：普通用户、会员用户、管理员。不同的用户有着不同的权限。

在数据库中表示不同的权限，权限有这么几种：

| 操作   | 标识      | 访问路径          | 说明     |
|------|---------|---------------|--------|
| 阅读   | read    | /auth/read    | 浏览文档   |
| 评论   | comment | /auth/comment | 留言评论   |
| 写文章  | write   | /auth/write   | 写新文章   |
| 后台管理 | admin   | /admin        | 管理后台数据 |

使用字符串操作比较简单，可以用字符串将权限记录下来。

如果会二进制的操作，使用下面这种会更好：

| 操作   | 标识         | 访问路径          | 说明     |
|------|------------|---------------|--------|
| 阅读   | 0b00000001 | /auth/read    | 浏览文档   |
| 评论   | 0b00000010 | /auth/comment | 留言评论   |
| 写文章  | 0b00000100 | /auth/write   | 写新文章   |
| 后台管理 | 0b00001000 | /admin        | 管理后台数据 |

操作的权限使用8位二进制数表示，现在只用了4位，剩余的可以以后用来扩展。如果权限表非常复杂，用到64位或者128位也可以。

权限的叠加是按位与运算，列如：拥有阅读和写文章的权限应当是 0b00000001&0b00000100 ，结果是0b00000101。

也容易反推出，0b00000011 是 0b00000001&0b00000010，因此权限是：阅读文章和在他人文章中写评论。

## 代码实现

### 创建项目

创建项目与进行插件绑定，代码略

### 权限工具

首先实现一个权限工具类，将之前的权限表实现留待备用

```python
# filename:utils.py
from flask import g


class Permission:
    READ = 'read'
    COMMENT = 'comment'
    WRITE = 'write'
    ADMINISTER = 'admin'

    @classmethod
    def default(cls):
        return ':'.join([cls.READ, cls.COMMENT])

    @classmethod
    def can_permissions(cls, permissions):
        return permissions in g.user.permissions


class Permission2:
    READ = 0b00000001  # 0x01
    COMMENT = 0b00000010  # 0x02
    WRITE = 0b00000100  # 0x04
    ADMINISTER = 0b00001000  # 0x08

    @classmethod
    def default(cls):
        return cls.READ | cls.COMMENT

    @classmethod
    def can_permissions(cls, permissions):
        return (g.user.permissions & permissions) == permissions

```

其中的类方法返回权限值（permission），默认为（Permission.READ |Permission.COMMENT ），其中Permission是定义了各种权限的类。

### 用户模型

```python
from extention import db
from utils import Permission


class UserModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120))
    avatar = db.Column(db.String(32))

    # 权限控制
    permissions = db.Column(db.Integer, default=Permission.default())

    def __repr__(self):
        return '<UserModel %r>' % self.username

```

UserModel，表示普通用户。其中 permissions 属性是用来记录权限值的

### 权限装饰器

```python
from functools import wraps
from flask import abort, g
from flask import session
from models import UserModel
from utils import Permission, Permission2


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user_id = session.get('_user_id')
        user = UserModel.query.get(int(user_id))
        if not user:
            return {'status': 'fail', 'message': '请先登录之后再进行操作'}
        g.user = user
        result = func(*args, **kwargs)
        return result

    return wrapper


def permission_required(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not Permission.can_permissions(permission):
                abort(403)
            return f(*args, **kwargs)

        return decorated_function

    return decorator


def permission_required2(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not Permission2.can_permissions(permission):
                abort(403)
            return f(*args, **kwargs)

        return decorated_function

    return decorator
```

