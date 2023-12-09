
## 创建会话 Session

在一个会话中操作数据库，绘画建立在连接上，连接被引擎管理，当第一次使用数据库时，从引擎维护的连接池中取出一个连接使用。

```python
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
session = Session()  # 实例化一个 session 对象

```

- session 对象线程不安全。所以不同线程应该使用不同的 session 对象
- Session 类和 engine 有一个就行了。

`scoped_session` 是 sqlalchemy 提供的线程安全的 session ，利用的是 ThreadLocal 实现的。



## 数据操作

### 增加数据

| 方法      | 含义                       |
| --------- | -------------------------- |
| add()     | 增加一个对象               |
| add_all() | 增加多个对象，类型为可迭代 |

```python
import sqlalchemy
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import sessionmaker

db_url = 'mysql+pymysql://root:root@127.0.0.1:3306/test'
engine = sqlalchemy.create_engine(db_url, echo=True)

Base = declarative.declarative_base()
DBSession = sessionmaker(bind=engine)
session = DBSession()


class Student(Base):
    __tablename__ = 'student'

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(24), default='null')
    age = Column(Integer, default='null')

    def __repr__(self):
        return '<{} {} {}>'.format(
            self.id, self.name, self.age
        )


zx = Student(id=12, name='正心', age=18)
session.add(zx)
sh = Student(id=13, name='山禾', age=18)
wz = Student(id=14, name='丸子', age=18)
session.add_all((sh, wz))  # 新增两条条数据
session.commit()

```

需要注意的是下面的情况：

```python
zx = Student(name='正心')
zx.age = 40
session.add(zx)  # 1
session.commit()
zx.age = 20
session.add(zx)  # 2
session.commit()
zx.age = 10
session.add_all([zx, zx, zx, zx])  # 3
session.commit()
# <30 zx 10>

```

### 简单查询

使用 session 的 query 方法进行简单查询,格式为：

- `session.query(student)`: 等同于 select * from student;
- `session.query(student).get(2)`: 等同于 select * from student where id = 2 ,这里的 get 方法只能主键查询

```python
students = session.query(Student)
print(students)  # SELECT student.id AS student_id, student.name AS student_name, student.age AS student_age FROM student
print(type(students))  # <class 'sqlalchemy.orm.query.Query'>

```

这里直接打印并不会结果，因为它太懒了，你不迭代它，它就不会真的去数据库查询。

```python
std_list = session.query(Student)
for std in std_list:
    print(std)

# 通过 get 来过滤主键，是可以直接执行返回结果的。
std_list = session.query(Student).get(12)
print(std_list)
```

### 修改数据

修改的数据的流程分为两步：

1. 查找匹配的数据
2. 修改后，提交

```python
std = session.query(Student).get(12)
print(std)  # <12 zx 200>
std.age = 1000
session.add(std)
session.commit()
std = session.query(Student).get(30)
print(std)  # <12 zx 1000>

# 或者
std = session.query(Student).filter(Student.id > 10).update({'name': 'zx'})
std.commit()

```

::: tip

大部分 ORM 是都是这样，必须先查才能改。

:::

在原有数据的基础上批量修改，比如在所有名称后面添加特定的后缀

```python
session.query(Student).filter(Student.id > 0).update({Student.name: Student.name + "099"}, synchronize_session=False)  # 必须为 synchronize_session=False

session.query(Student).filter(Student.id > 0).update({"age": Student.age + 1}, synchronize_session="evaluate")  # 必须 synchronize_session="evaluate"，表示要进行计算

```

### 删除数据(不建议)

使用 session.delete 来删除数据

```python
std = session.query(Student).get(21)
session.delete(std)
session.commit()  # 提交删除操作
std = session.query(Student).get(21)
print(std)  # None
```

### 状态

当我们创建一条数据，或是从数据库中获取一条数据时，数据本身是存在一个状态属性的，用来标识当前数据是否持久化，或者其他状态，在 sqlalchemy 中，`inspect(obj)` 可以用来窥探数据(obj)的状态

```python
zx = Student(name='zx')
zx.age = 10000
state = sqlalchemy.inspect(zx)
print(state)  # <sqlalchemy.orm.state.InstanceState object at 0x00000186EEC38EB8>
std = session.query(Student).get(28)
state = sqlalchemy.inspect(std)
print(state)  # <sqlalchemy.orm.state.InstanceState object at 0x00000186EFDCDA20>
```

我们看到，inspect返回的是一个InstanceState对象。这个对象有以下几个属性：

- session_id：获取数据时的 session ID ，如果是自建数据未持久化 ID 为 None
- `_attached`: 是否是附加的(数据已经加载(已 add )，就差提交的数据库了)
- transient：是否是临时数据(临时创建，还没有提交(还没有 add ))
- pending: 是否是待定的数据
- persistent: 是否是持久的
- deleted: 是否已删除
- detached：是否被分离
- key：key是多少

::: tip

InstanceState 对象，可以通过 sqlalchemy.orm.state 导入
:::

具体的状态信息与含义如下：

| 状态         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| `transient`  | 实体类尚未加入到session中，同时并没有保存到数据库中          |
| `pending`    | transient的实体被加入到session中，状态切换到pending，但它还没有被flsh到数据库中 |
| `persistent` | session中的实体对象对应着数据库中的真实记录。pending状态在提交成功后可以变成persistent状态，或者查询成功返回的实体也是persistent状态 |
| `deleted`    | 实体被删除且已经flush但未commit完成。事物提交成功了，实体变成detached，事物失败返回persistent状态 |
| `detached`   | 删除成功的实体进入这个状态                                   |

所以数据的状态变化如下：

1. 新建一个实体，状态是 transient 临时的
2. add() 以后，状态变为 pending
3. commit() 以后，状态变为 persistent
4. 查询成功返回的实体状态也是 persistent 状态
5. delete() 并 flush() 以后，状态变为 deleted
6. commit() 以后，变为 detached，提交失败，回退到 persistent 状态

::: tip

flush() 方法，主动把改变应用到数据库中去

:::

删除、修改操作，需要对应一个真实存在的数据，也就是说数据的状态是 persistent 才行。当使用 add 语句新增信息时，如果这个对象已经添加过数据库了，那么它的状态会变为 persistent，如果对 persistent 的数据进行修改继续提交的话，那么使用的将会是 update 语句而非 insert。这也是前面为啥多次对一个数据进行 add，提交了多次只会插入1次的原因。

```python
import sqlalchemy
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import sessionmaker, InstanceState

db_url = 'mysql+pymysql://root:root@127.0.0.1:3306/test'
engine = sqlalchemy.create_engine(db_url, echo=True)

Base = declarative.declarative_base()
DBSession = sessionmaker(bind=engine)
session = DBSession()


class Student(Base):
    __tablename__ = 'student'

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(24), default='Null')
    age = Column(Integer, default='Null')

    def __repr__(self):
        return '<{} {} {}>'.format(
            self.id, self.name, self.age
        )


def getstate(state: InstanceState):
    print("""
    session_id={} transient={} _attached={} pending={} persistent={} deleted={} detached={}
    """.format(state.session_id, state.transient, state._attached, state.pending, state.persistent, state.deleted, state.detached))


zx = Student(name='zx')
zx.age = 10000
state = sqlalchemy.inspect(zx)
getstate(state)  # session_id=None transient=True _attached=False pending=False persistent=False deleted=False detached=False

session.add(zx)
getstate(state)  # session_id=1 transient=False _attached=True pending=True persistent=False deleted=False detached=False

session.commit()
getstate(state)  # session_id=1 transient=False _attached=True pending=False persistent=True deleted=False detached=False

std = session.query(Student).get(28)
state = sqlalchemy.inspect(std)
getstate(state)  # session_id=1 transient=False _attached=True pending=False persistent=True deleted=False detached=False

std = session.query(Student).get(31)
session.delete(std)
state = sqlalchemy.inspect(std)
getstate(state)  # session_id=1 transient=False _attached=True pending=False persistent=True deleted=False detached=False

session.flush()
getstate(state)  # session_id=1 transient=False _attached=True pending=False persistent=False deleted=True detached=False

session.commit()
getstate(state)  # session_id=None transient=False _attached=False pending=False persistent=False deleted=False detached=True

```

### 枚举字段

在数据库的字段类型中，比如性别字段，我们可能会限制数据来源为 M(male) , F(Female) ,这个时候字段类型可以是枚举的，但是在 sqlalchemy 中，原生的字段类型没有枚举类型，那么就需要借助 enum 类了。

```python
import sqlalchemy
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import sessionmaker
import enum

db_url = 'mysql+pymysql://root:root@127.0.0.1:3306/test'
engine = sqlalchemy.create_engine(db_url, echo=True)

Base = declarative.declarative_base()
DBSession = sessionmaker(bind=engine)
session = DBSession()


class GenderEnum(enum.Enum):
    M = 'M'
    F = 'F'


class Student(Base):
    __tablename__ = 'student'

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(24), default='null')
    age = Column(Integer, default='null')
    gender = Column(sqlalchemy.Enum(GenderEnum), nullable=False)

    def __repr__(self):
        return '<{} {} {}>'.format(
            self.id, self.name, self.age
        )
```

用起来很麻烦，所以建议性别使用 1或者 0 来存储，显示的时候做对于转换即可
