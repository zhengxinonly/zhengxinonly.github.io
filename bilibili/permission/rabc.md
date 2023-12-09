讲师：正心

b站账号：[正心全栈编程](https://space.bilibili.com/162101364)

视频地址：https://www.bilibili.com/video/BV1tg411X7o5/

源码：加微信 zhengxinonly 回复 `flask 权限管理源码` 免费获取

## RBAC 介绍

rabc 是一种用于设计权限的一种思想，流程图如下

![image-20220530190840467](https://images.zhengxinonly.com/zhengxin_notes/images/bilibili/permission/assets/rabc/image-20220530190840467.png)

RBAC 主要有 user 用户表，role 角色表，power 权限表，以及 role-power 和 user-role 的中间关联表，但是实际上对于一般的需求，我们可以只使用
user 用户表，其余的表直接使用关系进行操作即可。

### 数据表实现

在数据库中创建五张表，两张关系表

user 用户表，role 角色表，power 权限表。user-role 用户-角色关系表，role-power 角色-权限关系表。

每个用户都有自己的角色，通过角色进行权限的关联

```python
from extention import db

# 创建中间表
user_role = db.Table(
    "rt_user_role",  # 中间表名称
    db.Column("id", db.Integer, primary_key=True, autoincrement=True, comment='标识'),  # 主键
    db.Column("user_id", db.Integer, db.ForeignKey("cp_user.id"), comment='用户编号'),  # 属性 外键
    db.Column("role_id", db.Integer, db.ForeignKey("rt_role.id"), comment='角色编号'),  # 属性 外键
)

# 创建中间表
role_power = db.Table(
    "rt_role_power",  # 中间表名称
    db.Column("id", db.Integer, primary_key=True, autoincrement=True, comment='标识'),  # 主键
    db.Column("power_id", db.Integer, db.ForeignKey("rt_power.id"), comment='用户编号'),  # 属性 外键
    db.Column("role_id", db.Integer, db.ForeignKey("rt_role.id"), comment='角色编号'),  # 属性 外键
)


class UserModel(db.Model):
    __tablename__ = 'cp_user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, comment='用户ID')
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120))
    password = db.Column(db.String(128))

    role = db.relationship('RoleModel',
                           secondary="rt_user_role",
                           backref=db.backref('user'),
                           lazy='dynamic')


class RoleModel(db.Model):
    __tablename__ = 'rt_role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, comment='角色名称')
    code = db.Column(db.String(64), unique=True, comment='角色标识')

    power = db.relationship('PowerModel', secondary="rt_role_power", backref=db.backref('role'))


class PowerModel(db.Model):
    __tablename__ = 'rt_power'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(64), unique=True, comment='权限路径')
    code = db.Column(db.String(64), comment='权限标识')

    parent_id = db.Column(db.Integer, db.ForeignKey("rt_power.id"), comment='父类编号')
    parent = db.relationship("PowerModel", remote_side=[id])  # 自关联

```

### 初始化登陆

#### 初始化数据

```Python
@app.cli.command()
def create():
    db.drop_all()
    db.create_all()
    import models

    user = models.UserModel()
    user.username = 'zhengxin'
    user.password = '123456'
    db.session.add(user)
    roles = [
        {'name': '普通用户', 'code': 'level1'},
        {'name': '会员用户', 'code': 'level2'},
        {'name': '管理员用户', 'code': 'level3'},
    ]
    role1 = models.RoleModel(name=roles[0]['name'], code=roles[0]['code'])
    role2 = models.RoleModel(name=roles[1]['name'], code=roles[1]['code'])
    role3 = models.RoleModel(name=roles[2]['name'], code=roles[2]['code'])
    db.session.add(role1)
    db.session.add(role2)
    db.session.add(role3)
    _permission = {
        'read': '/auth/read',
        'commit': '/auth/commit',
        'write': '/auth/write',
        'admin': '/admin',
    }
    power1 = models.PowerModel(code='read', url=_permission['read'])
    power2 = models.PowerModel(code='commit', url=_permission['commit'])
    power3 = models.PowerModel(code='write', url=_permission['write'])
    power4 = models.PowerModel(code='admin', url=_permission['admin'])
    db.session.add(power1)
    db.session.add(power2)
    db.session.add(power3)
    db.session.add(power4)

    role1.power.append(power1)
    role1.power.append(power2)

    role2.power.append(power1)
    role2.power.append(power2)
    role2.power.append(power3)

    role3.power.append(power4)

    user.role.append(role1)
    print(user)

    print([power.code for role in user.role for power in role.power])
    db.session.commit()

```

#### 初始化登陆

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        username = request.json.get('username')
        password = request.json.get('password')
        user = UserModel.query.filter(UserModel.username == username).first()
        session['_user_id'] = user.id
        session['permission'] = ':'.join([power.code for role in user.role for power in role.power])
        return {'status': 'success', 'next': '/home', 'message': '登录账号成功'}
    return render_template('login.html')
```

### 装饰器权限拦截

使用装饰器实现权限拦截

#### 登录拦截

```python
from functools import wraps
from flask import abort, session, g
from models import UserModel


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user_id = session.get('_user_id', 0)
        user = UserModel.query.get(int(user_id))
        if not user:
            return {'status': 'fail', 'message': '请先登录之后再进行操作'}
        g.user = user
        result = func(*args, **kwargs)
        return result

    return wrapper
```

#### 权限拦截

```python
def permission_required(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # print('permission', permission, session.get('permission', ''))
            if permission not in session.get('permission', ''):
                abort(403)
            return f(*args, **kwargs)

        return decorated_function

    return decorator
```

#### 角色拦截

```python
def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            role_code = [_role.code for _role in g.user.role]
            print('role', role, role_code)
            if role not in role_code:
                abort(403)
            return f(*args, **kwargs)

        return decorated_function

    return decorator


def admin_required(f):
    return role_required('level3')(f)
```

