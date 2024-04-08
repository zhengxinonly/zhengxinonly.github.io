# 关系对象模型（ORM）

> [sqlalchemy 官方文档](https://docs.sqlalchemy.org/en/20/)

Object-Relational Mapping，把关系数据库的表结构映射到对象上。使用面向对象的方式来操作数据库。

![orm](https://images.zhengxinonly.com/zhengxin_notes/images/backend/flask/sqlalchemy/assets/orm.png)

下面是一个关系模型与 Python 对象之间的映射关系：

- table --> class : 表映射为类
- row --> object : 行映射为实例
- column --> property : 字段映射为属性

## sqlalchemy

SQLAlchemy 是一个 ORM 框架。内部是使用了`连接池`
来管理数据库连接。其本身只是做了关系映射，不能连接数据库，也不能执行 sql 语句，它在底层需要使用 pymysql 等模块来连接并执行 sql 语句，要使用 sqlalchemy ，那么需要先进行安装：

```shell
$ pip install sqlalchemy
```

查看版本

```
>>> import sqlalchemy
>>> sqlalchemy.__version__
'1.4.18'
>>>
```

## 基本使用

先来总结一下使用 sqlalchemy 框架操作数据库的一般流程：

1. `创建引擎`(不同类型数据库使用不同的连接方式)
2. `创建基类`(类对象要继承，因为基类会利用元编程为我们的子类绑定关于表的其他属性信息)
3. `创建实体类`(用来对应数据库中的表)
4. `编写实体类属性`(用来对应表中的字段/属性)
5. `创建表`(如果表不存在,则需要执行语句在数据库中创建出对应的表)
6. `实例化`(具体的一条record记录)
7. `创建会话session`(用于执行sql语句的连接)
8. `使用会话执行SQL语句`
9. `关闭会话`

## 创建连接

sqlalchemy 使用引擎管理数据库连接(DATABASE URLS)，连接的一般格式为：

```shell
dialect+driver://username:password@host:port/database
```

- `dialect`：表示什么数据库(比如,mysql,sqlite,oracle等)
- `driver`：用于连接数据库的模块(比如pymysql,mysqldb等)
- `username`：连接数据库的用户名
- `password`：连接数据库的密码
- `host`: 数据库的主机地址
- `port`: 数据库的端口
- `database`: 要连接的数据库名称

pymysql模块是较长用于连接mysql的模块，使用pymysql的连接的语句为：

- `mysql+pymysql://dahl:123456@10.0.0.13:3306/test`

创建引擎用于进行数据库的连接：`create_engine(urls)`

```python
import sqlalchemy

db_url = 'mysql+pymysql://windows:123456@10.0.0.13:3306/test'
engine = sqlalchemy.create_engine(db_url, echo=True)

```

::: tip 特别注意：

创建引擎并不会马上连接数据库，直到让数据库执行任务是才连接。
:::

### 利用连接池执行 sql

sqlalchemy 内部是原生支持连接池的，我们可以仅仅利用它的连接池功能。通过engie的 `raw_connection` 方法就可以获取到一个连接，然后就可以执行
sql 语句了(基本上就是 Pymysql + DBUtils 的实现)

```python
import threading
import time
import sqlalchemy
import pymysql

engine = sqlalchemy.create_engine(
    "mysql+pymysql://root:root@127.0.0.1:3306/test",
    max_overflow=5,
    pool_size=1,
    pool_timeout=30,
    pool_recycle=-1,
)


def func():
    conn = engine.raw_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    time.sleep(2)
    cursor.execute("select * from employees;")
    res = cursor.fetchall()
    print(res)
    cursor.close()
    conn.close()


if __name__ == "__main__":
    for i in range(10):
        threading.Thread(target=func).start()

```

### 利用 session 来执行 sql

上面是通过链接池来执行sql的，其实也可以通过session来执行。

```python
import threading
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    'mysql+pymysql://dahl:123456@10.0.0.13:3306/test',
    max_overflow=5,
    pool_size=1,
    pool_timeout=30,
    pool_recycle=-1
)

db_session = sessionmaker(bind=engine)


def func():
    session = db_session()
    cursor = session.execute('select * from employees;')
    res = cursor.fetchall()
    print(res)
    cursor.close()
    session.close()


if __name__ == '__main__':
    for i in range(10):
        threading.Thread(target=func).start()

```

## 创建基类

使用 `sqlalchemy.ext.declarative.declarative_base` 来构造声明性类定义的基类。因为 sqlalchemy
内部大量使用了元编程，为实例化的子类注入映射所需的属性，所以我们定义的映射要继承自它（必须继承）

::: tip

一般只需要一个这样的基类
:::

```python
from sqlalchemy.ext import declarative

Base = declarative.declarative_base()

```

## 创建实体类

现数据库存在如下表

```sql
CREATE TABLE `student`
(
    `id`   int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(30) DEFAULT NULL,
    `age`  int(11)     DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 10
  DEFAULT CHARSET = utf8mb4;
```

创建对应的实体类

```python
# -*- coding: utf-8 -*-
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer, create_engine

db_url = "mysql+pymysql://root:root@10.0.0.13:3306/test"
engine = create_engine(db_url, echo=True)

# 1. 创建基类
Base = declarative.declarative_base()


# 2. 创建实体类
class Student(Base):
    __tablename__ = "student"

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(20), default="Null")
    age = Column(Integer, default="Null")


print(Student.__dict__)

# {
# '__module__': '__main__',
# '__tablename__': 'student',
# 'id': <sqlalchemy.orm.attributes.InstrumentedAttribute object at 0x000002151D50EAE0>,
# 'name': <sqlalchemy.orm.attributes.InstrumentedAttribute object at 0x000002151D50EB80>,
# 'age': <sqlalchemy.orm.attributes.InstrumentedAttribute object at 0x000002151D50EC20>,
# '__doc__': None, '_sa_class_manager': <ClassManager of <class '__main__.Student'> at 2151d4edb80>,
# '__table__': Table(
#       'student', MetaData(),
#       Column('id', Integer(), table=<student>, primary_key=True, nullable=False),
#       Column('name', String(), table=<student>, default=ColumnDefault('Null')),
#       Column('age', Integer(), table=<student>, default=ColumnDefault('Null')),
#       schema=None
#  ),
# '__init__': <function __init__ at 0x000002151D4F3310>,
# '__mapper__': <Mapper at 0x2151d4f2280; Student>
# }

```

- `__tablename__` : 表明，如果表已存在，则必须指定正确的表名
- Column: 用于构建一个列对象，它的参数一般都和数据库中的列属性是对应的，主要有：
    - name: 数据库中表示的此列的名称
    - `type`：字段类型(比如String、Integer，这里是sqlalchemy包装的类型，对应的是数据库的varchar、int等)，来自TypeEngine的子类
    - `autoincrement`：是否自增
    - default：默认值，可以是值，可调用对象或者类，当写入数据该字段没有指定时，调用。当是可调用对象的时候，建议不要加括号
    - doc：字段说明信息
    - key: 一个可选的字符串标识符，用于标识表上的此Column对象。
    - index: 是否启用索引
    - `nullable`: 是否可以为空
    - onupdate: 如果在更新语句的SET子句中不存在此列，则将在更新时调用该值
    - `primary_key`: 主键
    - server_default:它的值是 FetchedValue实例、字符串、Unicode 或者 text()实例，用作DDL语句中该列的default值

注意：Column和String、Integer等都来自于sqlalchemy下的方法，要么直接导入，要么就使用sqlalchemy.String来引用。

### 常用字段

| 类型名          | python中类型         | 说明                            |
|--------------|-------------------|-------------------------------|
| Integer      | int               | 普通整数，一般是32位                   |
| SmallInteger | int               | 取值范围小的整数，一般是16位               |
| BigInteger   | int或long          | 不限制精度的整数                      |
| Float        | float             | 浮点数                           |
| Numeric      | decimal.Decimal   | 普通整数，一般是32位                   |
| String       | str               | 变长字符串                         |
| Text         | str               | 变长字符串，对较长或不限长度的字符串做了优化        |
| Unicode      | unicode           | 变长Unicode字符串                  |
| UnicodeText  | unicode           | 变长Unicode字符串，对较长或不限长度的字符串做了优化 |
| Boolean      | bool              | 布尔值                           |
| Date         | datetime.date     | 时间                            |
| Time         | datetime.datetime | 日期和时间                         |
| LargeBinary  | str               | 二进制文件                         |

## 实例化

通过我们构建的类，来实例化的对象，在将来就是数据库中的一条条记录。

```python
student = Student()
student.name = 'admin'
student.id = 1
student.age = 20
print(student)

# <__main__.Student object at 0x0000014A7B3541C0>
```

## 创建表

我们自己写的类都是继承自Base，每继承一次Base类，在Base类的metadata属性中就会记录当前子类，metadata提供了方法用于删除/创建表。如果数据库中已经存在对应的表，那么将不会继续创建

- drop_all(bind=None, tables=None, checkfirst=True): 删除metadata中记录的所有表
- create_all(bind=None, tables=None, checkfirst=True): 创建metadata中记录的所有表

```python
# -*- coding: utf-8 -*-
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer, create_engine

db_url = "mysql+pymysql://root:root@127.0.0.1:3306/test"
engine = create_engine(db_url, echo=True)

# 1. 创建基类
Base = declarative.declarative_base()


# 2. 创建实体类
class Student(Base):
    __tablename__ = "student"

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(20), default="null")
    age = Column(Integer, default="null")


Base.metadata.create_all(bind=engine)  # 需要通过引擎去执行

# 下面是 engine 的 echo 为 true 时的输出信息
# 2022-10-07 20:36:02,910 INFO sqlalchemy.engine.Engine SHOW VARIABLES LIKE 'sql_mode'
# 2022-10-07 20:36:02,910 INFO sqlalchemy.engine.Engine [raw sql] {}
# 2022-10-07 20:36:02,913 INFO sqlalchemy.engine.Engine SHOW VARIABLES LIKE 'lower_case_table_names'
# 2022-10-07 20:36:02,913 INFO sqlalchemy.engine.Engine [generated in 0.00008s] {}
# 2022-10-07 20:36:02,915 INFO sqlalchemy.engine.Engine SELECT DATABASE()
# 2022-10-07 20:36:02,915 INFO sqlalchemy.engine.Engine [raw sql] {}
# 2022-10-07 20:36:02,916 INFO sqlalchemy.engine.Engine BEGIN (implicit)
# 2022-10-07 20:36:02,916 INFO sqlalchemy.engine.Engine SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %(table_schema)s AND table_name = %(table_name)s
# 2022-10-07 20:36:02,916 INFO sqlalchemy.engine.Engine [generated in 0.00008s] {'table_schema': 'test', 'table_name': 'student'}
# 2022-10-07 20:36:02,918 INFO sqlalchemy.engine.Engine 
# CREATE TABLE student (
# 	id INTEGER NOT NULL AUTO_INCREMENT, 
# 	name VARCHAR(20), 
# 	age INTEGER, 
# 	PRIMARY KEY (id)
# )
# 
# 
# 2022-10-07 20:36:02,918 INFO sqlalchemy.engine.Engine [no key 0.00006s] {}
# 2022-10-07 20:36:02,927 INFO sqlalchemy.engine.Engine COMMIT
```

- 生产环境很少这样创建表，都是系统上线的时候由脚本生成。
- 生产环境很少删除表，宁可废除都不能删除。

注意：sqlalchemy 只能创建和删除表，不能修改表结构。只能手动的在数据库中修改然后在代码中添加即可。
