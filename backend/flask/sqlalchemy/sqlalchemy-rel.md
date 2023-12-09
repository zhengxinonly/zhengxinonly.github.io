
## 一对多关系

一对多是一种表与表的关系，在 orm 中创建和使用方式有一写特点，这里单独描述

### 创建关系表

通过 ForeignKey 来创建一对多关系，需要注意的是它内部需要填写对应的真实的表名和字段（非映射的类对象）

```python
class Department(Base):
    __tablename__ = 'department'

    id = Column(Integer, autoincrement=True, primary_key=True)
    dep_name = Column(String(32), nullable=False)


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, autoincrement=True, primary_key=True)
    name = Column(String(32), nullable=False)
    dept_id = Column(Integer, ForeignKey('department.id'))

# CREATE TABLE `user` (
#   `id` int(11) NOT NULL AUTO_INCREMENT,
#   `name` varchar(32) NOT NULL,
#   `dept_id` int(11) DEFAULT NULL,
#   PRIMARY KEY (`id`),
#   KEY `dept_id` (`dept_id`),
#   CONSTRAINT `user_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# CREATE TABLE `department` (
#   `id` int(11) NOT NULL AUTO_INCREMENT,
#   `dep_name` varchar(32) NOT NULL,
#   PRIMARY KEY (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 添加数据

添加部门数据时，只能使用id来插入，当插入的 dept_id 在 department 表中不存在时，会直接爆出异常

```python
# 批量添加部门数据
session.add_all([
    Department(dep_name='运维部'),
    Department(dep_name='开发部'),
    Department(dep_name='产品部'),
    Department(dep_name='测试部')]
)

# 添加用户数据
session.add_all([
    User(name='zx', dept_id=1),
    User(name='sh', dept_id=2),
    User(name='wz', dept_id=3)]
)
session.commit()
```

### relationship

 在表中使用relationship来创建一个关联的对象，便于查询（和django的一对多隐含的对象相同，但在sqlalchemy中必须通过relationship才可以生成），并不会生成新的字段，仅仅是产生一个关联关系。

::: tip

注意 relationship 对象不能作为条件直接进行表查询：session.query(User.name, User.deptment.dept_name) 这样是不行的。

:::

```python
relationship(obj,backref='')
```

- obj: 表示要关联的 ORM 对象
- backref：表示在对方插入一个关键字，用于反向关联 relationship 所在的表对象的本身。

下面是一个例子：

```python
class Department(Base):
    __tablename__ = "department"

    id = Column(Integer, autoincrement=True, primary_key=True)
    dep_name = Column(String(32), nullable=False)


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, autoincrement=True, primary_key=True)
    name = Column(String(32), nullable=False)
    dept_id = Column(Integer, ForeignKey("department.id"))

    department = relationship(Department, backref="user")  # 创建 relationship 关系


# 正向查（通过 User 查 department ）
std = session.query(User).filter(User.id == 1).first()
print(std.name)
print(std.deptment.dep_name)  # 直接通过 department 对象，读取 Department 表中对于的信息

# 反向查（通过 department 查 User）
dep = session.query(Department).filter(Department.id == 1).first()
print(dep.user[0].name)  # 反向查，通过user获取到的数据是一个列表
```

relationship，就是通过在一个映射类中增加一个属性，该属性用于表示连接关系，可以在结果中，访问该属性来访问关联的表信息

### 通过 relationship 添加数据

存在relationship的映射关系时，我们添加数据时，就可以通过relationship使用对象来添加关联数据了

```python
dep = session.query(Department).filter(Department.id == 3).first()
session.add_all(
    [
        User(name="hello", deptment=dep),
        User(name="world", deptment=dep),
    ]
)
session.commit()
```

直接创建新的部门对象也是可以的

```python
user = User(name='zy', deptment=Department(dep_name='管理员'))
session.add(user)
session.commit()
```

## 多对多关系

### 创建多对多关系

模拟主机与业务线的归属问题。

- 主机可以属于多个业务线
- 一个业务线可以包含多个主机

这是一个典型的多对多关系，需要额外一张关系表来记录。

```python
from datetime import datetime
import sqlalchemy
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import sessionmaker

db_url = "mysql+pymysql://root:root@127.0.0.1:3306/test"
engine = sqlalchemy.create_engine(db_url, echo=True)

Base = declarative.declarative_base()
DBSession = sessionmaker(bind=engine)
session = DBSession()


class Service2host(Base):
    __tablename__ = 'service_to_host'
    id = Column(Integer, primary_key=True, nullable=False, unique=True, autoincrement=True)
    s_id = Column(Integer, ForeignKey('service.id'))
    h_id = Column(Integer, ForeignKey('host.id'))

    __table_args__ = (
        # 联合唯一索引
        UniqueConstraint('s_id', 'h_id', name='serivce_to_host'),
    )  # 业务id和主机id不能重复，这里创建唯一索引来约束


class Service(Base):
    __tablename__ = 'service'
    id = Column(Integer, primary_key=True, nullable=False, unique=True, autoincrement=True)
    ser_name = Column(String(16), nullable=False)


class Host(Base):
    __tablename__ = 'host'

    id = Column(Integer, primary_key=True, nullable=False, unique=True, autoincrement=True)
    hostname = Column(String(16), nullable=False)
    datetime = Column(DateTime, default=datetime.now, nullable=False)

# CREATE TABLE `host` (
#   `id` int(11) NOT NULL AUTO_INCREMENT,
#   `hostname` varchar(16) NOT NULL,
#   `datetime` date NOT NULL,
#   PRIMARY KEY (`id`),
#   UNIQUE KEY `id` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


# CREATE TABLE `service` (
#   `id` int(11) NOT NULL AUTO_INCREMENT,
#   `ser_name` varchar(16) NOT NULL,
#   PRIMARY KEY (`id`),
#   UNIQUE KEY `id` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


# CREATE TABLE `service_to_host` (
#   `id` int(11) NOT NULL AUTO_INCREMENT,
#   `s_id` int(11) DEFAULT NULL,
#   `h_id` int(11) DEFAULT NULL,
#   PRIMARY KEY (`id`),
#   UNIQUE KEY `id` (`id`),
#   UNIQUE KEY `serivce_to_host` (`s_id`,`h_id`),
#   KEY `h_id` (`h_id`),
#   CONSTRAINT `service_to_host_ibfk_1` FOREIGN KEY (`s_id`) REFERENCES `service` (`id`),
#   CONSTRAINT `service_to_host_ibfk_2` FOREIGN KEY (`h_id`) REFERENCES `host` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 通过 relationship 操作数据

如果没有 relationship 关联对象，那么我们将需要分别操作三张表，使用 relationship 将会大大简化这个过程，那么在 Service 中创建关系:

```python
hosts = relationship('host', secondary='service_to_host', backref='services')
```

创建后：

- 在Service中存在一个hosts属性，对应host表
- 在Host中被动注入一个services属性，对应service表
- secondary='service_to_host' 表示通过第三张表来关联关系

```python
# 添加一个业务，并创建几台主机
session.add(
    Service(
        ser_name="运营",
        hosts=[
            Host(hostname="openstack"),
            Host(hostname="nginx"),
        ],
    )
)

# 添加一个主机，并关联几个业务线
service = (
    session.query(Service)
    .filter(or_(Service.ser_name == "运营", Service.ser_name == "运维"))
    .all()
)
session.add(Host(hostname="Tomcat", services=service))

# 查询一个业务线下都有哪些主机
service = session.query(Service).filter(Service.ser_name == "运营").first()
for host in service.hosts:
    print(host.id, host.hostname)

# 查询一台主机都归属哪些业务线
host = session.query(Host).filter(Host.hostname == "openstack").first()
for servcie in host.services:
    print(service.id, service.ser_name)
```