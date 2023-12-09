
# 复杂查询

## where 条件查询

使用 filter 方法进行条件过滤查询：

- `session.query(student).filter(student.id > 10)`：相当于 select * from student where student.id > 10

::: tip

同时还存在一个filter_by，它的不同之处在于括号中的不是表达式，而是参数。比如：filter(user.id == 10) -> filter_by(user.id = 10)

:::

where条件中的关系：

- `AND`(与) 对应 `and_`
- `OR`(或) 对应 `or_`
- `not`(非) 对应 `not_`
- `in` 对应字段的 `in_`
- `not in` 对应字段的 `notin_`
- `like` 对应 字段的like方法
- `not like` 对应 字段的 notlike 方法

想要使用与或非，需要先行导入

```python
import sqlalchemy
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import sessionmaker
from sqlalchemy import and_, or_, not_

db_url = "mysql+pymysql://root:root@127.0.0.1:3306/test"
engine = sqlalchemy.create_engine(db_url, echo=True)

Base = declarative.declarative_base()
DBSession = sessionmaker(bind=engine)
session = DBSession()


class Student(Base):
    __tablename__ = "student"

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String(24), default="Null")
    age = Column(Integer, default="Null")

    def __repr__(self):
        return "<{} {} {}>".format(self.id, self.name, self.age)


def getresulte(stds):
    for std in stds:
        print(std)
```

条件判断之`AND`(&,and_)

```python
# and
std_list = session.query(Student).filter(and_(Student.id < 30, Student.id > 27))
getresulte(std_list)

# filter 返回的还是一个结果集，所以还可以继续使用 filter 进行过滤
std_list = session.query(Student).filter(Student.id < 30).filter(Student.id > 27)
getresulte(std_list)

# 多个条件一起写，也是 and 的关系
std_list = session.query(Student).filter(Student.id < 30, Student.age > 100)
getresulte(std_list)

std_list = session.query(Student).filter((Student.name == 'zx') & (Student.age > 28))
getresulte(std_list)
```

条件判断之`OR`(or_，|)

```python
# or
std_list = session.query(Student).filter(or_(Student.id > 27, Student.age < 50))
getresulte(std_list)

std_list = session.query(Student).filter((Student.id > 27) | (Student.age < 50))
getresulte(std_list)
```

条件判断之`NOT`(not_,~)

```python
# not
std_list = session.query(Student).filter(not_(Student.id == 32))
getresulte(std_list)

std_list = session.query(Student).filter(~(Student.id == 32))
getresulte(std_list)
```

`like` 和 `in` 及 `not in` 

```python
# like
std_list = session.query(Student).filter(Student.name.like('da%'))
getresulte(std_list)

# not like
std_list = session.query(Student).filter(Student.name.notlike('da%'))
getresulte(std_list)

# in
std_list = session.query(Student).filter(Student.age.in_([10, 30, 50]))
getresulte(std_list)

# not in
std_list = session.query(Student).filter(Student.age.notin_([10, 30, 50]))
getresulte(std_list)
```

## 排序

- order_by：排序
- asc: 升序（默认）
- desc: 降序

```python
# 升序
std_list = session.query(Student).filter(Student.name.like('z%')).order_by(Student.age)
getresulte(std_list)

# 降序
std_list = session.query(Student).filter(Student.name.like('z%')).order_by(Student.age.desc())
getresulte(std_list)
```

## 分页(偏移量)

- limit: 显示结果的条目数
- offset：偏移量

```python
# limit
std_list = session.query(Student).filter(Student.name.like('da%')).order_by(Student.age.desc()).limit(3).offset(2)
getresulte(std_list)
# select * from Student where name like 'da%' order_by age desc limit 3 offset 2
```

## 消费方法

- count(): 获取总条数（仅仅针对结果集，不能all以后再count）
- all(): 取所有行（默认）（列表）
- first()：取首行
- one()：有且只有一行，多行则抛出异常
- delete()：对查询出来的数据直接进行删除
- scalar(): 第一条记录的第一个元素

```python
# count
std_list = session.query(Student)
print(std_list.count())

# first
std_list = session.query(Student).first()
print(std_list)
```

::: tip

first本质上就是limit。

:::

## 分组及聚合方法

sqlalchemy同样提供了聚合方法，使用sqlalchemy.func来调用

- group_by:分组显示

func提供的方法有

- max:求最大值
- min:求最小值
- avg:求平均值
- count:聚合（一般和分组连用）

```python
# max
# select name,max(age) from Student;
std_list = session.query(Student.name, sqlalchemy.func.max(Student.age))  
getresulte(std_list)

# count
# SELECT name, count(id)  FROM student GROUP BY name 
std_list = session.query(Student.name, sqlalchemy.func.count(Student.id)).group_by(Student.name)
getresulte(std_list)
```

## 关联查询

sqlalchemy 提供 ForeignKey 用来进行外键关联，它的格式为

```python
sqlalchemy.ForeignKey(表名.字段名, ondelete='更新规则')

# 如果填写映射后的class，那么可以直接写：类.字段
# 如果填写数据库中的表，那么需要使用引号：'数据库表名.字段名'
```

更新规则和删除规则，可选项如下：

- `CASCADE`: 级联删除，删除被关联数据时，从表关联的数据全部删除。
- `SET NULL`:从父表删除或更新行，会设置子表中的外键列为NULL，但必须保证子表没有指定 NOT NULL，也就是说子表的字段可以为NULL才行。
- `RESTRICT`:如果从父表删除主键，如果子表引用了，则拒绝对父表的删除或更新操作。(保护数据)
- `NO ACTION`:表中SQL的关键字，在MySQL中与RESTRICT相同。拒绝对父表的删除或更新操作。

现有如下关系表

```sql
CREATE TABLE `departments`
(
    `dept_no`   char(4)     NOT NULL,
    `dept_name` varchar(40) NOT NULL,
    PRIMARY KEY (`dept_no`),
    UNIQUE KEY `dept_name` (`dept_name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE `employees`
(
    `emp_no`     int(11)        NOT NULL,
    `birth_date` date           NOT NULL,
    `first_name` varchar(14)    NOT NULL,
    `last_name`  varchar(16)    NOT NULL,
    `gender`     enum ('M','F') NOT NULL,
    `hire_date`  date           NOT NULL,
    PRIMARY KEY (`emp_no`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE `dept_emp`
(
    `emp_no`    int(11) NOT NULL,
    `dept_no`   char(4) NOT NULL,
    `from_date` date    NOT NULL,
    `to_date`   date    NOT NULL,
    PRIMARY KEY (`emp_no`, `dept_no`),
    KEY `dept_no` (`dept_no`),
    CONSTRAINT `dept_emp_fk_1` FOREIGN KEY (`emp_no`) REFERENCES `employees` (`emp_no`) ON DELETE CASCADE,
    CONSTRAINT `dept_emp_fk_2` FOREIGN KEY (`dept_no`) REFERENCES `departments` (`dept_no`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
```

创建对应的映射实体类

```python
import sqlalchemy
from sqlalchemy.ext import declarative
from sqlalchemy import Column, String, Integer, Date
from sqlalchemy.orm import sessionmaker
import enum

db_url = "mysql+pymysql://root:root@127.0.0.1:3306/test"
engine = sqlalchemy.create_engine(db_url, echo=True)

Base = declarative.declarative_base()
DBSession = sessionmaker(bind=engine)
session = DBSession()


class Departments(Base):
    __tablename__ = "departments"
    dept_no = Column(String(4), nullable=False, primary_key=True)
    dept_name = Column(String(40), nullable=False, unique=True)

    def __repr__(self):
        return "<{} {} {}>".format(
            self.__class__.__name__, self.dept_no, self.dept_name
        )


class GenderEnum(enum.Enum):
    M = "M"
    F = "F"


class Employees(Base):
    __tablename__ = "employees"
    emp_no = Column(Integer, nullable=False, primary_key=True)
    birth_date = Column(Date, nullable=False)
    first_name = Column(String(14), nullable=False)
    last_name = Column(String(16), nullable=False)
    gender = Column(sqlalchemy.Enum(GenderEnum), nullable=False)
    hire_date = Column(Date, nullable=False)

    def __repr__(self):
        return "<{} {} {} {} {} {}>".format(
            self.__class__.__name__,
            self.emp_no,
            self.birth_date,
            self.first_name,
            self.last_name,
            self.gender,
            self.hire_date,
        )


class Dept_emp(Base):
    __tablename__ = "dept_emp"
    emp_no = Column(
        Integer,
        sqlalchemy.ForeignKey(Employees.emp_no, ondelete="CASCADE"),
        primary_key=True,
    )
    dept_no = Column(
        String(4),
        sqlalchemy.ForeignKey(Departments.dept_no, ondelete="CASCADE"),
        nullable=False,
    )
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)

    def __repr__(self):
        return "<{} emp_no={} dept_no={}>".format(
            self.__class__.__name__, self.emp_no, self.dept_no
        )


def getres(emps):
    for emp in emps:
        print(emp)
```

查询10010员工所在的部门编号及员工信息

**隐式连接**

```python
emps = session.query(Employees, Dept_emp).filter(
    and_(Employees.emp_no == Dept_emp.emp_no, Employees.emp_no == '10010')).all()
getres(emps)

emps = session.query(Employees, Dept_emp).filter(Employees.emp_no == Dept_emp.emp_no).filter(
    Employees.emp_no == '10010').all()
getres(emps)
```

**join连接**

使用 join() 关键字来进行连表查询，其 isouter 参数用于指定 join 的类型，默认情况下使用的是 inner join ,当 isouter=True 时，就表示是 left join(right join没有实现，需要自己交换前面表的顺序)

```python
# join连接
std_list = (
    session.query(Employees)
    .join(Dept_emp, Employees.emp_no == Dept_emp.emp_no, isouter=True)
    .filter(Employees.emp_no == "10010")
)
getres(std_list)

std_list = (
    session.query(Employees)
    .join(Dept_emp)
    .filter((Employees.emp_no == Dept_emp.emp_no) & (Employees.emp_no == "10010"))
)
getres(std_list)

# 如果 query 中，仅列出一个表明，相当于
# select employees.* from employees inner join dept_emp on employees.emp_no = dept_emp.emp_no where employees.emp_no = '10010';
```
