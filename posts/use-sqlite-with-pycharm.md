---
title: SQLite 的使用
description: 关于 SQLite 的学习方式，很多教程都是从命令行开始的。但是我个人习惯使用工具，所以就从图形化界面开始。
date: 2023-05-24
tags:
  - Sqlite
---

# SQLite 的使用

关于 SQLite 的学习方式，很多教程都是从命令行开始的。但是我个人习惯使用工具，所以就从图形化界面开始。

## Pycahrm 操作 SQLite

打开 PyCharm， 在最右侧，有一个 Database 的标识，点击。

如果没有找到这个选项， 点击 View -> Tool Windows -> Database 同样可以打开 Database 窗体。

如果是中文版则是点击 `视图` -> `工具窗口` -> `数据库` 同样可以打开。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524023221230.png)

之后点击 `+` 号，选择 `SQLite`

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524023246071.png)

然后点击更新驱动。如果顺利的话会直接更新成功。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524023412272.png)
但是因为国内的网络环境原因，大部分时候都不会成功，可以多试几次，还是不想就需要先到网站上下载 `SQLite`
的驱动，然后手动进行安装。那就需要点击驱动程序旁边的 `SQLite` 蓝色字，然后到里面添加驱动。

## SQLite 文件概念

`SQLite`
是文件型的数据库，每一个文件都是一个数据库，数据库里面可以有很多张数据表。一个程序也可以同时使用很多个数据库（`SQLite`
文件）。同时在创建的时候，文件名就相当于数据库名。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524023946933.png)

我在创建是就将文件名修改为 `student.sqlite` 。后缀名为 `.sqlite` 或者 `.db` 都可以，这是平时用的比较多的。

新建好了之后，就会在当前项目跟目录下生成一个文件名为 `student.sqlite`
的文件，这就是刚刚创建的数据库，但是数据库里面有一张默认的数据表。我们也可以在右边的数据库面板看到具体的内容。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524024556148.png)

之后便可以在 `console`  控制台操作数据库了。

## SQLite 操作

`SQLite` 与 `MySQL` 虽说有不少差距，但是大部分的增删改查语句都是类似的。关于更详细的操作等我后续有时间了再进行整理，我们先来看一个简单的增删改查案例。

### 数据表创建

```sql
create table student
(
    id      integer primary key,
    name    varchar(255),
    chinese float not null,
    math    float not null,
    english float not null
);

select *
from student;
```

运行上面的指令之后，可以得到下面的结果。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524025432498.png)

### 插入数据

```sql
insert into student(id, name, chinese, math, english)
values (1, '张三', 60, 60, 60);

insert into student(id, name, chinese, math, english)
values (0, '李四', 60, 60, 60);

insert into student(name, chinese, math, english)
values ('王五', 60, 60, 60),
       ('正心', 100, 100, 100);

select *
from student;
```

运行插入语句之后，可以发现与 `MySQL` 是一样的。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524030018866.png)

### 更新数据

```sql
update student
set chinese=60,
    math=60,
    english=60
where name = '正心';

select *
from student;
```

运行与 `MySQL` 一样的更新语句之后，发现结果也变了。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524030233538.png)

### 查询语句

`SQLite` 的查询语句与 `MySQL` 保持一致，前面使用的 `select * from student;` 就是，逻辑运算符、比较运算符、分组、过滤、排序皆可用，暂时就不演示了。

### 删除语句

使用 `delete from student where name='正心';` 就可以删除正心这一条满足删除条件的数据，与 `MySQL` 保持一致。

## Python 操作 SQLite

python 内置了 SQLite 数据库通过内置 sqlite3 模块可以直接访问数据库

```python
# 导入 sqlite3 模块（内置模块，不需要安装）  
import sqlite3

# 1. 创建连接对象，连接本地文件  
conn = sqlite3.connect('student.sqlite')
# 2. 创建游标对象，用于执行 sql 语句  
cursor = conn.cursor()
# 3. 执行 sql 语句  
cursor.execute('select * from student;')
# 4. 打印查询结果  
print('查询的结果:', cursor.fetchall())
# 5. 关闭游标对象、关闭连接对象  
cursor.close()
conn.close()
```

打印的结果如下：

```
查询的结果: [(0, '李四', 60.0, 60.0, 60.0), (1, '张三', 60.0, 60.0, 60.0), (2, '王五', 60.0, 60.0, 60.0), (3, '正心', 60.0, 60.0, 60.0)]
```

大致的操作与 `pymysql` 类似。同时也可以进行参数化执行，只不过占位符变成了 `?` 号。

```python
cursor.execute('select * from student where name=?', ('正心',))
print('查询的结果:', cursor.fetchall())
```

结果如下

```
查询的结果: [(3, '正心', 60.0, 60.0, 60.0)]
```

## sqlite 命令行

如果想要使用 `SQLite`
的命令行，则需要先下载对于的工具。可以在附录中下载  [`SQLite` 命令行工具](https://sqlite.org/2023/sqlite-tools-win32-x86-3420000.zip)
。注意需要下载对版本否则无法使用。

我是 window 电脑，下载的是 `sqlite-tools-win32-x86-3420000.zip` 文件，然后将其解压到 `D`
盘同时添加到环境变量，这样就可以直接在 `cmd` 窗口直接使用了。

![](https://images.zhengxinonly.com/zhengxin_notes/images/posts/assets/use-sqlite-with-pycharm/image-20230524032605368.png)

然后便可以用以下这些指令

```sql
sqlite
>
.open name.db   --若数据库存在则打开，否则创建
.database       --显示当前打开的数据库文件
.tables         --查看当前数据库中的所有表
.schema tbname  --查看表结构信息
.exit           --退出交互模式
.help           --列出命令的提示信息
```

下面是在当前项目中尝试了一些指令。

```
$ sqlite3
SQLite version 3.42.0 2023-05-16 12:36:15
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.
sqlite> .open student.sqlite
sqlite> .table
student 
sqlite> .databases
main: D:\sqlite_demo\student.sqlite r/w
sqlite> .exit
```

## 附录

`SQLite` 命令行工具： https://sqlite.org/download.html

`SQLite` 驱动下载地址:https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/