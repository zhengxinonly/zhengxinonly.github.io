讲师：正心

b站账号：正心全栈编程

视频地址：https://www.bilibili.com/video/BV1zB4y1v7wN/

源码：加微信 zhengxinonly 回复 `flask 前后端分离与不分离源码` 免费获取

---

### 全栈开发网站的几种实现方式，以 python flask 为例演示

#### 视频介绍

大家好，我是正心老师 - 现在做全栈开发，主要有那几种方式 ?

本次课程，就用一个案例来演示全栈开发的几种方式：前后端不分离、前后端半分离、前后端分离

- 前后端不分离：bootstrap5、flask/jinja2

- 前后端半分离：bootstrap5、jQuery/fetch、flask

- vue 半分离：bootstrap5、vue/fetch、flask

- vue 全分离：bootstrap5、vue/fetch、nginx、flask

### 静态模板开发

所有网站都会有一个比较好看的页面，为了让后面案例学习来体验不是很糟糕，静态模板使用 bootstrap 开发。

bootstrap5 官网：https://v5.bootcss.com/

前端代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>flask todo list</title>
    <!-- CSS only -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
          crossorigin="anonymous">
    <!-- JavaScript Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
            crossorigin="anonymous"></script>
</head>
<body>
<div class="container mt-3">
    <div class="row">
        <div class="col-6 m-auto">
            <form action="/add_todo" method="post">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="请输入任务" name="todo">
                    <button type="submit" class="btn btn-primary">添加事项</button>
                </div>
            </form>
        </div>
    </div>

    <div class="row">
        <div class="col-6 m-auto">
            <div class="list-group  mb-3">
                <label class="list-group-item">
                    <input class="form-check-input me-1 todo-input" type="checkbox"
                           checked value="1">
                    <span class="text-muted">去菜市场买菜</span>
                    <a class="text-decoration-none float-end" href="/clear_todo?id=1">删除</a>
                </label>
                <label class="list-group-item">
                    <input class="form-check-input me-1 todo-input" type="checkbox"
                           checked value="1">
                    <span class="text-muted">约朋友吃饭</span>
                    <a class="text-decoration-none float-end" href="/clear_todo?id=1">删除</a>
                </label>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-6 m-auto d-flex justify-content-between">
            <button type="button" class="btn text-decoration-none" disabled>10 条剩余</button>

            <div class="btn-group">
                <a href="/?key=all" class="btn btn-outline-primary active">全部</a>
                <a href="/?key=undone" class="btn btn-outline-primary">未完成</a>
                <a href="/?key=done" class="btn btn-outline-primary">已完成</a>
            </div>

            <a href="/clear_done?key=done" class="btn btn-link text-decoration-none">清除已完成</a>
        </div>
    </div>
</div>
</body>
</html>
```

Python 代码

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)

```

### flask + jinja2 前后端不分离

#### 数据模型介绍

因为是一个小案例，就没有用数据库了，直接用类对象定义一个简单的数据模型进行操作。

```python
class TodoList:
    def __init__(self, task_list):
        self.todo_list = task_list
        self.count = len(task_list)

    @property
    def undone_list(self):
        return list(filter(lambda item: not item['done'], self.todo_list))

    @property
    def done_list(self):
        return list(filter(lambda item: item['done'], self.todo_list))


todo_list = [
    {"id": 1, "title": "出门买菜做饭", "done": True},
    {"id": 2, "title": "锻炼20分钟", "done": False},
    {"id": 3, "title": "记单词30分钟", "done": False},
    {"id": 4, "title": "写作30分钟", "done": True},
    {"id": 5, "title": "冥想30分钟", "done": False}
]

todo = TodoList(todo_list)
if __name__ == '__main__':
    print(todo.todo_list)
    print(todo.done_list)
    print(todo.undone_list)

```

#### 渲染任务数据

后端渲染

```python
from flask import Flask, render_template, request, redirect

from models import todo

app = Flask(__name__)


@app.route('/')
def hello_world():
    key = request.args.get('key', 'all')

    todo_list = []
    if key == 'undone':
        todo_list = todo.undone_list
    elif key == 'done':
        todo_list = todo.done_list
    elif key == 'all':
        todo_list = todo.todo_list

    return render_template('todos.html',
                           todo_list=todo_list,
                           key=key,
                           undone_count=len(todo.undone_list))

```

前端渲染

```html

<div class="row">
    <div class="col-6 m-auto">
        <div class="list-group  mb-3">
            {% for todo in todo_list %}
            <label class="list-group-item">
                <input class="form-check-input me-1 todo-input" type="checkbox"
                       {% if todo.done %} checked {% endif %}
                       value="{{ todo.id }}">
                <span class="text-muted">{{ todo.title }}</span>
                <a class="text-decoration-none float-end" href="/clear_todo?id={{ todo.id }}">删除</a>
            </label>
            {% endfor %}
        </div>
    </div>
</div>

```

#### 添加任务

前端渲染

```html

<div class="row ">
    <div class="col-6 m-auto">
        <form action="/add_todo" method="post">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="请输入任务" name="title">
                <button type="submit" class="btn btn-primary">添加事项</button>
            </div>
        </form>
    </div>
</div>

```

后端渲染

```python
@app.route('/add_todo', methods=["POST"])
def add_todo():
    info = request.form.get('info', None)
    if info:
        todo.count += 1
        item = {
            'id': todo.count,
            'info': info,
            'done': False
        }
        todo.todo_list.append(item)

    return redirect('/')

```

#### 删除任务

```python
@app.route('/clear_todo')
def clear_todo():
    todo_id = request.args.get('id', None)
    print(todo_id)
    if todo_id and todo_id.isdigit():
        todo_id = int(todo_id)
        current_todo = list(filter(lambda item: item['id'] == todo_id, todo.todo_list))
        if current_todo[0] in todo.todo_list:
            todo.todo_list.remove(current_todo[0])
    return redirect('/')
```

#### 删除已完成

```python
@app.route('/clear_done')
def clear_done():
    for item in todo.done_list:
        todo.todo_list.remove(item)

    return redirect('/')

```

### flask + ajax 动态加载（部分分离）

jquery: https://jquery.com/

jquery cdn: http://releases.jquery.com/

#### 前端部分

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>flask todo list</title>
    <link rel="stylesheet" href="/static/css/bootstrap.css">
    <script src="/static/js/bootstrap.bundle.js"></script>
</head>
<body>
<div class="container mt-3">
    <div class="row">
        <div class="col-6 m-auto">
            <form action="JavaScript:;" method="post">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="请输入任务" name="todo">
                    <button type="submit" class="btn btn-primary add">添加事项</button>
                </div>
            </form>
        </div>
    </div>

    <div class="row">
        <div class="col-6 m-auto">
            <ul class="list-group  mb-3">
                {#
                <li class="list-group-item">#}
                    {# <input class="form-check-input me-1 todo-input" type="checkbox" #}
                              {# checked value="1">#}
                    {# <span class="text-muted">去菜市场买菜</span>#}
                    {# <a class="text-decoration-none float-end" href="JavaScript:;">删除</a>#}
                    {#
                </li>
                #}
                {#
                <li class="list-group-item">#}
                    {# <input class="form-check-input me-1 todo-input" type="checkbox" #}
                              {# checked value="1">#}
                    {# <span class="text-muted">约朋友吃饭</span>#}
                    {# <a class="text-decoration-none float-end todo-delete" href="JavaScript:;">删除</a>#}
                    {#
                </li>
                #}
            </ul>
        </div>
    </div>

    <div class="row">
        <div class="col-6 m-auto d-flex justify-content-between">
            <button type="button" class="todo-count btn text-decoration-none" disabled><em>10</em> 条剩余</button>

            <div class="btn-group">
                <a href="JavaScript:;" class="btn btn-outline-primary active">全部</a>
                <a href="JavaScript:;" class="btn btn-outline-primary">未完成</a>
                <a href="JavaScript:;" class="btn btn-outline-primary">已完成</a>
            </div>

            <a href="JavaScript:;" class="btn btn-link text-decoration-none">清除已完成</a>
        </div>
    </div>
</div>
<script src="/static/jquery-3.6.0.min.js"></script>
<script>
    $(function () {
        // 1. 请求后端数据
        function update_data() {
            fetch('/todo', {method: 'GET'}).then(function (response) {
                return response.json();
            }).then(function (data) {
                {
                    #console.log(data);
                #
                }
                update_html(data);
            });
        }

        // 2. 前端数据渲染
        function update_html(data) {
            // 遍历之前清空 ol，ul 里面的元素内容
            $('.list-group').empty();
            $.each(data, function (index, value) {
                console.log(value);
                let temp = `
        <label class="list-group-item">
            <input class="form-check-input me-1 todo-input" type="checkbox"
                   ${!value.done ? '' : 'checked'} value="1">
            <span class="text-muted">${value.title}</span>
            <a class="text-decoration-none float-end" href="JavaScript:;" id=${value.id}>删除</a>
        </label>`;
                $('.list-group').append(temp);
            });
            $('.todo-count em').html(data.length);
        }

        update_data();
        // 3.  未完成和已完成选项操作
        $('ol,ul').on('click', 'input', function () {
            // 修改数据
            let index = $(this).siblings('a').prop('id');
            let title = $(this).siblings('.text-muted').text();

            fetch(`/todo/${index}`, {
                method: 'PUT',
                body: JSON.stringify({title: title, id: index})
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log(data);
                update_data();
            });
        });

        // 4. 按下回车键添加事项
        $('[name="todo"]').on('keyup', function (e) {
            if (e.keyCode === 13) {
                if ($(this).val() === '') return alert('请输入待办事项！');
                // 把 local 数组进行更新数据，把最新的数据追加给 local 数组
                fetch('/todo', {
                    method: 'POST',
                    body: JSON.stringify({title: $(this).val(), done: false}),
                    headers: {'Content-Type': 'application/json'},
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    $(this).val('');
                    update_data();
                });
            }
        });

        // 5. 删除操作
        $('ol,ul').on('click', 'a', function () {
            // 获取本地存储
            // 修改数据
            let index = $(this).prop('id');
            fetch(`/todo/${index}`, {method: 'DELETE', body: JSON.stringify({id: index})}).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log(data);
                update_data();
            });
        });

    });
</script>
</body>
</html>
```

#### 后端部分

```python
from flask import Flask, render_template, request, jsonify
from models import todo

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/todo', methods=['GET', 'POST'])
def todo_view():
    if request.method == 'GET':
        return jsonify(todo.todo_list)
    if request.method == 'POST':
        title = request.json.get('title', None)
        item = {
            'id': todo.count,
            'title': title,
            'done': False
        }
        todo.todo_list.append(item)
        return {'status': 'ok'}


@app.route('/todo/<int:_id>', methods=["PUT", "DELETE"])
def todo_item(_id):
    if request.method == 'PUT':
        for item in todo.todo_list:
            if item['id'] == _id:
                item['done'] = not item['done']
                return {'status': 'ok'}
        return {'status': 'error'}
    if request.method == 'DELETE':
        for item in todo.todo_list:
            if item['id'] == _id:
                todo.todo_list.remove(item)
                return {'status': 'ok'}
        return {'status': 'error'}

```

### flask + vue 动态加载（部分分离）

2020 年 09 月 19 日 Vue.js 3.0 “One Piece” 已正式发布，此框架新的主要版本提供了更好的性能、更小的捆绑包体积、更好的
TypeScript 集成、用于处理大规模用例的新 API，并为框架未来的长期迭代奠定了坚实的基础。当前用户量已有百万级，尤其是对新手而言，vue
有着类似 python 的基础数据类型，以数据驱动的前端界面，非常适合熟悉 python 的人进行开发。我也是主推 vue+python 的前后端分离式开发模式。

#### vue 和 falsk 结合难度如何？

如果单纯的从分离开来的角度来讲，如今的 vue 借助尤雨溪新开发的 vite 工具，可以完全抛开 webpack 和 vue-cli 进行初始化环境，要知道，在
vite 工具诞生之前，操作 vue 的门槛，就是先得学习 webpack 这个打包工具。简而言之，就是必须先得自己柔和一套打包工具才行，虽然这东西属于一次设置，终身受益，但是这个门槛是非常高的，而
vite 的诞生，可以说革了 webpack 的命。因此如今的 vue 使用起来，几乎就是两行代码的事情，其余都是 npm install 即可，无需再次折腾类似
webpack 的东西。

flask 是 python 的一种通用的 web 框架，诞生至今已有 10 年了，虽然官网界面比较复古极简，但使用者还是不在少数。纯后端的 api
开发，还可以看向 fastapi，都是当今最主流的两个选择。

vue 和 flask 的结合，其实没有任何难度，上手非常容易。

#### 前端代码

vue3:  https://v3.cn.vuejs.org/

vue cdn:

```html

<script src="https://unpkg.com/vue@next"></script>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>flask todo list</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
          crossorigin="anonymous">
    <!-- JavaScript Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
            crossorigin="anonymous"></script>
    <script src="https://unpkg.com/vue@next"></script>
    <!-- 引入vue -->
    <script src="https://unpkg.com/vue@next"></script>
</head>
<body>
<div id="app">
    <div class="container mt-3">
        <div class="row ">
            <div class="col-6 m-auto">
                <form action="/add_todo" method="post">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control"
                               placeholder="请输入任务" name="title"
                               v-model="form.title"
                        >
                        <button type="submit" class="btn btn-primary" @click.prevent="add_todo">添加事项</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="row">
            <div class="col-6 m-auto">
                <div class="list-group mb-3">
                    <label class="list-group-item" v-for="todo in todos">
                        <input class="form-check-input me-1 todo-input"
                               type="checkbox" v-if="todo.done" checked
                               value="[[ todo.id ]]"
                               @change="change_todo_status(todo)"
                        >
                        <input class="form-check-input me-1 todo-input start-0"
                               type="checkbox" v-if="!todo.done"
                               value="[[ todo.id ]]"
                               @change="change_todo_status(todo)"
                        >
                        <span class="text-muted">[[ todo.title ]]</span>
                        <a class="text-decoration-none float-end" @click="delete_todo(todo.id)">删除</a>
                    </label>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-6 m-auto d-flex justify-content-between">
                <button type="button" class="btn text-decoration-none" disabled>[[ undone_count ]]条剩余</button>

                <div class="btn-group">
                    <a href="/?key=all" class="btn btn-outline-primary {% if key=='all' %}active{% endif %}">全部</a>
                    <a href="/?key=undone"
                       class="btn btn-outline-primary {% if key=='undone' %}active{% endif %}">未完成</a>
                    <a href="/?key=done"
                       class="btn btn-outline-primary {% if key=='done' %}active{% endif %}">已完成</a>
                </div>

                <a href="/clear_done?key=done" class="btn btn-link text-decoration-none">清除已完成</a>
            </div>
        </div>
    </div>
</div>
<script>
    const EventHandling = {
        data() {
            return {
                todos: [],
                form: {
                    title: '',
                    done: false,
                },
                // undone_count: 0,
            };
        },
        computed: {
            undone_count() {
                return this.todos.length;
            },
        },
        delimiters: ['[[', ']]'],    // 用于避免与 flask 冲突
        methods: {
            // 1. 请求服务器加载数据
            fetchData() {
                fetch('/todo').then(res => {
                    return res.json();
                }).then((data) => {
                    this.todos = data;
                });
            },
            // 2. 切换任务的完成状态
            change_todo_status(item) {
                console.log(JSON.stringify(item));
                fetch(`/todo/${item.id}`,
                        {
                            method: 'put',
                            body: JSON.stringify(item),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                ).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    console.log(data);
                });

            },
            // 3. 添加任务
            add_todo() {
                fetch('/todo', {
                    method: 'POST',
                    body: JSON.stringify(this.form),
                    headers: {'Content-Type': 'application/json'},
                }).then((response) => {
                    return response.json();
                }).then((data) => {
                    this.form.title = '';
                    this.fetchData();
                });
            },
            // 4. 删除任务
            delete_todo(index) {
                fetch(`/todo/${index}`, {method: 'DELETE', body: JSON.stringify({id: index})}).then((response) => {
                    return response.json();
                }).then((data) => {
                    console.log(data);
                    this.fetchData();
                });
            },
        },
        mounted() {
            // html 页面渲染完毕之后，请求加载动态数据
            this.fetchData();
        },
    };
    Vue.createApp(EventHandling).mount('#app');
</script>
</body>
</html>
```

由于 flask 采用的是 jinja 模板，也就是采用 {{}} 模式与 web 页面交互，因此会与 vue 的默认分隔符号相冲突，因此在 script 里需要修改
delimiters: ["[[","]]"]。当然还有其他修改方式，这里推荐的也是相对简单的方法。

#### 后端代码

```python
from flask import Flask
from flask import jsonify, render_template
from flask import request

from models import todo

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/todo', methods=['GET', 'POST'])
def todo_view():
    if request.method == 'GET':
        return jsonify(todo.todo_list)
    if request.method == 'POST':
        title = request.json.get('title', None)
        item = {
            'id': todo.count,
            'title': title,
            'done': False
        }
        todo.todo_list.append(item)
        return {'status': 'ok'}


@app.route('/todo/<int:_id>', methods=["PUT", "DELETE"])
def todo_item(_id):
    if request.method == 'PUT':
        for item in todo.todo_list:
            if item['id'] == _id:
                item['done'] = not item['done']
                return {'status': 'ok'}
        return {'status': 'error'}

    if request.method == 'DELETE':
        for item in todo.todo_list:
            if item['id'] == _id:
                todo.todo_list.remove(item)
                return {'status': 'ok'}
        return {'status': 'error'}


if __name__ == "__main__":
    app.run(debug=True, port=5000)

```

### flask + vue 前后端全分离

#### 后端部分

前后端分离，必须要做跨域请求处理，这个可以在前端做，也可以在后端做。视频中选择了后端做，那就就需要安装 flask-cors 插件并绑定一下。

```python
from flask import Flask
from flask import jsonify, render_template
from flask import request
from flask_cors import CORS

from models import todo

app = Flask(__name__)
CORS(app, supports_credentials=True)  # 解决跨域问题


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/todo', methods=['GET', 'POST'])
def todo_view():
    if request.method == 'GET':
        return jsonify(todo.todo_list)
    if request.method == 'POST':
        title = request.json.get('title', None)
        item = {
            'id': todo.count,
            'title': title,
            'done': False
        }
        todo.todo_list.append(item)
        return {'status': 'ok'}


@app.route('/todo/<int:_id>', methods=["PUT", "DELETE"])
def todo_item(_id):
    if request.method == 'PUT':
        for item in todo.todo_list:
            if item['id'] == _id:
                item['done'] = not item['done']
                return {'status': 'ok'}
        return {'status': 'error'}

    if request.method == 'DELETE':
        for item in todo.todo_list:
            if item['id'] == _id:
                todo.todo_list.remove(item)
                return {'status': 'ok'}
        return {'status': 'error'}


if __name__ == "__main__":
    app.run(debug=True, port=5000)

```

#### 前端部分

vite: https://vitejs.cn/guide/

创建项目

```
C:\Users\xxp\Desktop>npm init vite@latest
√ Project name: ... flask-todos-vue-font
√ Select a framework: » vue
√ Select a variant: » vue

Scaffolding project in C:\Users\xxp\Desktop\flask-todos-vue-font...

Done. Now run:

  cd flask-todos-vue-font
  npm install
  npm run dev


C:\Users\xxp\Desktop>
```

安装依赖

```sh
npm install bootstrap
```

main.js

```JavaScript
import {createApp} from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'

createApp(App).mount('#app')
```

App.vue

```html

<script setup>
    import {onMounted, ref, reactive, computed} from 'vue';

    let todos = ref([]);
    let form = reactive({
        title: '',
        done: false,
    });

    const undone_count = computed(() => {
        return todos.length;
    });

    // 1. 请求服务器加载数据
    const fetchData = () => {
        fetch('http://127.0.0.1:5000/todo').then(res => {
            return res.json();
        }).then((data) => {
            console.log(data);
            todos.value = data;
            console.log(todos);
        });
    };

    // 2. 切换任务的完成状态
    const change_todo_status = (item) => {
        console.log(JSON.stringify(item));
        fetch(`http://127.0.0.1:5000/todo/${item.id}`,
                {
                    method: 'put',
                    body: JSON.stringify(item),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
        ).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
        });
    };

    // 3. 添加任务
    const add_todo = () => {
        fetch('http://127.0.0.1:5000/todo', {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {'Content-Type': 'application/json'},
        }).then((response) => {
            return response.json();
        }).then((data) => {
            form.title = '';
            fetchData();
        });
    };

    // 4. 删除任务
    const delete_todo = (index) => {
        fetch(`http://127.0.0.1:5000/todo/${index}`, {
            method: 'DELETE',
            body: JSON.stringify({id: index})
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);
            fetchData();
        });
    };

    onMounted(() => {
        fetchData();
    });
</script>

<template>
    <div class="container mt-3">
        <div class="row ">
            <div class="col-6 m-auto">
                <form action="/add_todo" method="post">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control"
                               placeholder="请输入任务" name="title"
                               v-model="form.title"
                        >
                        <button type="submit" class="btn btn-primary" @click.prevent="add_todo">添加事项</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="row">
            <div class="col-6 m-auto">
                <div class="list-group  mb-3">
                    <label class="list-group-item" v-for="todo in todos">
                        <input class="form-check-input me-1 todo-input"
                               type="checkbox" v-if="todo.done" checked
                               value="{{ todo.id }}"
                               @change="change_todo_status(todo)"
                        >
                        <input class="form-check-input me-1 todo-input"
                               type="checkbox" v-if="!todo.done"
                               value="{{ todo.id }}"
                               @change="change_todo_status(todo)"
                        >
                        <span class="text-muted">{{ todo.title }}</span>
                        <a class="text-decoration-none float-end" @click="delete_todo(todo.id)">删除</a>
                    </label>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-6 m-auto d-flex justify-content-between">
                <button type="button" class="btn text-decoration-none" disabled>{{ undone_count }}条剩余</button>

                <div class="btn-group">
                    <a href="/?key=all" class="btn btn-outline-primary {% if key=='all' %}active{% endif %}">全部</a>
                    <a href="/?key=undone"
                       class="btn btn-outline-primary {% if key=='undone' %}active{% endif %}">未完成</a>
                    <a href="/?key=done"
                       class="btn btn-outline-primary {% if key=='done' %}active{% endif %}">已完成</a>
                </div>

                <a href="/clear_done?key=done" class="btn btn-link text-decoration-none">清除已完成</a>
            </div>
        </div>
    </div>
</template>

<style>
</style>
```

#### 总结

**flask 和 vue 结合的优势**

1. vue 有着简洁、易懂的前端界面开发逻辑
2. flask 有着 python 独特的语义化代码，非常适合处理各种数据
3. 两种语言都对小白非常友好，python 更是当下最广泛的编程语言，用户量庞大
4. 当前 vue 在 vite 的帮助下，可以快速定制开发环境，不论是 html 模板的 pug 语法，还是 style 的 stylus
   语法，都是简化输入，突出逻辑框架，开发者的精力可以更集中在逻辑设计上。
5. 容易上手，带来的自然高效率、易维护、易复制