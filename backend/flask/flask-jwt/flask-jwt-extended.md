# flask-jwt-extended

如果想要在 flask 中使用 JWT ，推荐使用 `flask-jwt-extended` 插件。

使用 pip 安装这个扩展插件的最简单方法是:

```shell  
$ pip install flask-jwt-extended  
```

## 基本使用

在接下来的案例中，我们看一下基本使用。我们可以使用 `create_access_token()` 函数用来生成实际的 JWT token。`@jwt_required()`
装饰器可以用来保护路由，`get_jwt_identity()` 函数可以在保护视图里面获取用户的身份信息。

```python
from flask import Flask
from flask import jsonify
from flask import request

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# 设置 Flask-JWT-Extended 插件的秘钥
app.config["JWT_SECRET_KEY"] = "super-secret"  # 设置 jwt 的秘钥
jwt = JWTManager(app)


# 创建一个路由来验证登录的用户并返回 JWT。
# create_access_token() 函数用来生成实际的 JWT token.
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if username != "admin" or password != "123456":
        return jsonify({"msg": "Bad username or password"}), 401

    # 传入身份信息创建 access_token

    access_token = create_access_token(identity=username)
    return jsonify(access_token='Bearer ' + access_token)


# 使用 jwt_required 保护请求视图，如果在请求中不存在 jwt token 将无法访问。
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # 使用 get_jwt_identity 访问当前用户的身份
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


if __name__ == "__main__":
    app.run(debug=True)

```

在访问受保护视图时需要在请求中携带 jwt token, 一般是在请求头中添加 Authorization 字段，就像下面这样

```  
Authorization: Bearer <access_token>  
```

接下来进行测试

```python
import requests

url = 'http://127.0.0.1:5000'

response = requests.post(url + '/login', json={'username': 'admin', 'password': '123456'})
print(response.json())

# out: {'access_token': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY4NDM5NDYxNCwianRpIjoiNTU1NWFjOWEtNjU3Ny00OTNmLTkwMGQtOWZlZGZlNDc0M2FiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFkbWluIiwibmJmIjoxNjg0Mzk0NjE0LCJleHAiOjE2ODQzOTU1MTR9.W85vNVZY8nSzem3iBsucFpjsfBdn6RcRyLvg9nndW1s'}  
token = response.json()['access_token']

response = requests.get(url + '/protected')
print(response.json())
# out: {'msg': 'Missing Authorization Header'}  

response = requests.get(url + '/protected', headers={'Authorization': token})
print(response.json())
# out: {'logged_in_as': 'admin'}
```

可以看到受保护路由如果不携带 token 进行请求，则会直接被拦截。

## 自动加载用户

在大多数 Web 应用程序中，获取受保护路由的访问用户信息是非常重要的。flask-jwt-extended 提供了一些回调函数，使得在使用 JWT
时可以实现无缝对接。

第一个是 `user_identity_loader()` ，它将把用于创建 jwt 的 User 对象转换为 JSON 可序列化格式。

另一方面，当请求中出现 jwt 时，可以使用 `user_lookup_loader()` 自动加载 User 对象。加载的用户可以通过 current_user
在受保护的路由中使用。

让我们看一个使用 SQLAlchemy 操作用户对象的例子:

```python
from flask import Flask
from flask import jsonify
from flask import request
from flask_sqlalchemy import SQLAlchemy

from werkzeug.security import generate_password_hash, check_password_hash

from flask_jwt_extended import create_access_token
from flask_jwt_extended import current_user
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"  # 采用内存型数据库
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

jwt = JWTManager(app)
db = SQLAlchemy(app)


class UserORM(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)

    # 注意：在实际应用程序中，请确保正确散列和加盐密码
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, new_password):
        self.password_hash = generate_password_hash(new_password)


# 注册一个回调函数，该函数在使用 create_access_token 创建 JWT 时将传入的任何对象作为身份，并将其转换为 JSON 可序列化格式。
@jwt.user_identity_loader
def user_identity_lookup(user):
    print('user_identity_lookup', user)
    return user.id


# 注册一个回调函数，在访问受保护的路由时从数据库自动加载用户（current_user）。
# 这应该在成功查找时返回任何 python 对象，或者如果查找因任何原因失败（例如，如果用户已从数据库中删除）则返回 None。
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    print('user_lookup_callback', _jwt_header, jwt_data)
    identity = jwt_data["sub"]
    return UserORM.query.filter_by(id=identity).one_or_none()


@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    user = UserORM.query.filter_by(username=username).one_or_none()
    if not user or not user.check_password(password):
        return jsonify("Wrong username or password"), 401

    # 注意，我们在这里传递了实际的 sqlalchemy 用户对象
    access_token = create_access_token(identity=user)
    return jsonify(access_token=access_token)


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # 我们现在可以通过 `current_user` 访问我们的 sqlalchemy User 对象。
    return jsonify(
        id=current_user.id,
        password=current_user.password,
        username=current_user.username,
    )


@app.before_first_request
def create():
    db.create_all()
    user = UserORM(password_hash=generate_password_hash("123456"), username="admin")
    db.session.add(user)
    db.session.commit()


if __name__ == "__main__":
    app.run(debug=True)

```

接下来进行测试。先用代码进行登录

```python
import requests

url = 'http://127.0.0.1:5000'

response = requests.post(url + '/login', json={'username': 'admin', 'password': '123456'})
print(response.json())
```

然后服务器就会出现以下消息

```
user_identity_lookup <UserORM 1>
127.0.0.1 - - [18/May/2023 15:45:14] "POST /login HTTP/1.1" 200 -
```

然后再请求被保护视图

```python
token = response.json()['access_token']

response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + token})
print(response.json())
```

服务器出现以下消息

```
user_lookup_callback {'alg': 'HS256', 'typ': 'JWT'} {'fresh': False, 'iat': 1684395914, 'jti': '392272ca-ba0c-40ac-bd67-9d7dbd550ea3', 'type': 'access', 'sub': 1, 'nbf': 1684395914, 'exp': 1684396814}
127.0.0.1 - - [18/May/2023 15:45:19] "GET /protected HTTP/1.1" 200 -
```

然后就可以知道，当登录成功在返回响应之前会调用 `user_identity_lookup`
回调，这个回调响应的是 `create_access_token(identity=user)` 传递的 `user` 对象，最终返回 `user.id` 也就是 `1`
，这个结果最终会被作用与 `jwt_data` 的 `{'sub':1}` 声明，将其进行 JWT 编码之后返回给前端。

当请求被保护视图是，先会调用 `user_lookup_callback` 回调，然后获取 `jwt_data` 的 `sub`
字段，然后查询用户并且回调，回调的内存会被存储在 `current_user` 。

## 在 JWT 中存储附加数据

您可能希望在访问令牌中存储其他信息，之后可以在受保护的视图中访问这些信息。这可以使用 `additional_claims`
参数在 `create_access_token()` 或 `create_refresh_token()` 函数添加附加声明来完成。可以通过 `get_jwt()`
函数在受保护的路径中获取添加的附加参数。

重要的是要记住 JWT 没有加密，任何有权访问它的人都可以轻松解码 JWT 的内容。因此，您永远不应该将任何敏感信息放在 JWT 中。

```python
from flask import Flask
from flask import jsonify
from flask import request

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
jwt = JWTManager(app)


@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if username != "admin" or password != "123456":
        return jsonify({"msg": "Bad username or password"}), 401

    # 可以使用 additional_claims 参数添加自定义声明或覆盖 JWT 中的默认声明。
    additional_claims = {"aud": "some_audience", "foo": "bar"}
    access_token = create_access_token(username, additional_claims=additional_claims)
    return jsonify(access_token=access_token)


# 在受保护的视图中，使用 get_jwt() 方法获取您添加到 jwt 的声明
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    claims = get_jwt()
    print('jwt', claims)
    return jsonify(foo=claims["foo"])


if __name__ == "__main__":
    app.run(debug=True)
```

然后进行测试

```python
import time

import requests

url = 'http://127.0.0.1:5000'

response = requests.post(url + '/login', json={'username': 'admin', 'password': '123456'})

token = response.json()['access_token']

time.sleep(1)
response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + token})
```

服务器端会输出以下内容

```
127.0.0.1 - - [18/May/2023 16:07:08] "GET /protected HTTP/1.1" 200 -
jwt {'fresh': False, 'iat': 1684397227, 'jti': '55d16324-7235-4fc3-ab82-84ee7cfc744d', 'type': 'access', 'sub': 'admin', 'nbf': 1684397227, 'exp': 1684398127, 'aud': 'some_audience', 'foo': 'bar'}

```

可以看出来 payload 里面就多了新增的数据。

或者，你可以使用 `additional_claims_loader()` 装饰器注册一个回调函数，该函数将在创建新 JWT
时调用，并返回一个声明字典以添加到该令牌。在同时使用 `additional_claims_loader()` 和 `additional_claims`
参数的情况下，两个结果将合并在一起，并与附加声明参数提供的数据相关联。

追加以下装饰器到代码

```python
# 使用 additional_claims_loader，我们可以指定在创建 JWT 时将调用的方法。
# 装饰方法必须采用我们为其创建令牌的身份，并返回一个包含附加声明的字典以添加到 JWT。
@jwt.additional_claims_loader
def add_claims_to_access_token(identity):
    return {
        "aud": "some_audience2",
        "foo": "bar2",
        "upcase_name": identity.upper(),
    }

```

重新运行客户端代码，可以看到服务器输出以下内容

```
jwt {'fresh': False, 'iat': 1684397638, 'jti': 'd62a1958-fc3c-42bd-9543-4201d983a95b', 'type': 'access', 'sub': 'admin', 'nbf': 1684397638, 'exp': 1684398538, 'aud': 'some_audience', 'foo': 'bar', 'upcase_name': 'ADMIN'}
127.0.0.1 - - [18/May/2023 16:13:59] "GET /protected HTTP/1.1" 200 -
```

可以发现装饰器已经生效了。

## 部分保护路由

在某些情况下，无论请求中是否存在 JWT，你都希望使用相同的路由。在这些情况下，你可以将 `jwt_required()` 与 `optional=True`
参数一起使用。这将允许访问路由，无论是否随请求一起发送 JWT。如果不存在 JWT，`get_jwt()` 和 `get_jwt_header()`
将返回一个空字典。 `get_jwt_identity()`、`current_user` 和 `get_current_user()` 将返回 `None`。如果请求中包含过期或无法验证的
JWT，仍会像往常一样返回错误。

```python
from flask import Flask
from flask import jsonify
from flask import request

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
jwt = JWTManager(app)


@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if username != "admin" or password != "123456":
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


@app.route("/optionally_protected", methods=["GET"])
@jwt_required(optional=True)
def optionally_protected():
    current_identity = get_jwt_identity()
    if current_identity:
        return jsonify(logged_in_as=current_identity)
    else:
        return jsonify(logged_in_as="anonymous user")


if __name__ == "__main__":
    app.run(debug=True)

```

然后输入代码进行测试

```python
import time

import requests

url = 'http://127.0.0.1:5000'

response = requests.post(url + '/login', json={'username': 'admin', 'password': '123456'})
print(response.json())

token = response.json()['access_token']

response = requests.get(url + '/optionally_protected', headers={'Authorization': 'Bearer ' + token})
print(response.json())
# out: {'logged_in_as': 'admin'}

response = requests.get(url + '/optionally_protected')
print(response.json())
# out: {'logged_in_as': 'anonymous user'}

```

## JWT 位置

JWT 可以通过多种不同方式随请求一起发送。您可以通过 `JWT_TOKEN_LOCATION` 配置选项来控制要在 Flask 应用程序中接受 JWT
的方式。您还可以通过 `jwt_required()` 中的位置参数覆盖每个路由的全局配置。

```python
from flask import Flask
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies

app = Flask(__name__)

# 在这里，您可以全局配置您希望允许 JWT 发送到您的 Web 应用程序的所有方式。 默认情况下，这将只是 headers。
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies", "json", "query_string"]

# 如果为真，这将只允许包含您的 JWT 的 cookie 通过 https 发送。 在生产中，这应该始终设置为 True
app.config["JWT_COOKIE_SECURE"] = False

app.config["JWT_SECRET_KEY"] = "super-secret"

jwt = JWTManager(app)


@app.route("/login_without_cookies", methods=["POST"])
def login_without_cookies():
    # 使用 token 进行登录
    access_token = create_access_token(identity="example_user")
    return jsonify(access_token=access_token)


@app.route("/login_with_cookies", methods=["POST"])
def login_with_cookies():
    # 使用 cookie 进行登录
    response = jsonify({"msg": "login successful"})
    access_token = create_access_token(identity="example_user")
    set_access_cookies(response, access_token)
    return response


@app.route("/logout_with_cookies", methods=["POST"])
def logout_with_cookies():
    # 使用 cookie 进行退出
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@app.route("/protected", methods=["GET", "POST"])
@jwt_required()
def protected():
    return jsonify(foo="bar")


@app.route("/only_headers")
@jwt_required(locations=["headers"])
def only_headers():
    # 值允许 headers 进行验证
    return jsonify(foo="baz")


if __name__ == "__main__":
    app.run(debug=True)

```

### Headers

通过 headers 处理 JWT 是一个非常简单的过程。只需要在登录之后将令牌存储起来，然后再每次请求受保护路由的时候将 JWT 添加到
headers。注销的时候只要将令牌产出就可以了。

```python
# 登录
response = requests.post(url + '/login_without_cookies')
print(response.json())

# 存储 token
token = response.json()['access_token']

# 携带 token 请求受保护路由
response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + token})
print(response.json())

```

### Cookies

如果你正在使用 Web 浏览器，Cookies 是处理 JWT 的一种极好的方式。与 headers 方法相比，它们提供了一些不错的好处:

+ 它们可以配置为只通过 HTTPS 发送。这可以防止 JWT 在不安全的连接上意外地被发送，甚至可能被破坏。
+ 它们存储在一个 http-only 的 cookie 中，这样可以防止 XSS 攻击窃取底层的 JWT。
+ Flask 应用程序可以隐式刷新即将过期的 JWT，这简化了保持活动用户登录的逻辑。下一节将详细介绍这方面的内容！

当然，在使用 cookie 时，您还需要做一些额外的工作来防止跨站点请求伪造(CSRF)攻击。在这个扩展中，我们通过所谓的双重提交验证来处理这个问题。

双重提交验证背后的基本思想是，只有当请求中也存在一个特殊的双重提交令牌时，来自 cookie 的 JWT 才被认为是有效的，而且双重提交令牌不能是由
Web 浏览器自动发送的东西(即它不能是另一个 cookie)。

默认情况下，我们通过在有人登录时设置两个 cookie 来实现这一点。第一个 cookie 包含 JWT，在该 JWT 中编码的是双重提交令牌。这个
cookie 设置为 http-only，因此不能通过 javascript 访问(这就防止了 XSS 攻击能够窃取 JWT)。我们设置的第二个 cookie 只包含相同的
double 提交标记，但这次是在一个用 javascript 可读的 cookie 中。无论何时发出请求，它都需要包含一个 X-CSRF-TOKEN
标头，其中包含双重提交令牌的值。如果此头中的值与存储在 JWT 中的值不匹配，请求将被踢出为无效。

因为双重提交令牌需要作为一个头(不会自动发送请求) ，并且一些恶意的 javascript 运行在不同的域将无法读取包含双重提交令牌的
cookie 在您的网站上，我们已经成功地挫败了任何 CSRF 攻击。

这确实意味着无论何时发出请求，都需要手动包含 X-CSRF-TOKEN 头，否则您的请求也将被踢出。让我们看看如何做到这一点:

> 前端的实现方式

```js
async function login() {
    await fetch('/login_with_cookies', {method: 'post'});
}

async function logout() {
    await fetch('/logout_with_cookies', {method: 'post'});
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function makeRequestWithJWT() {
    const options = {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token'),
        },
    };
    const response = await fetch('/protected', options);
    const result = await response.json();
    return result;
}
```

> Python 的实现方式

```python
session = requests.Session()

response = session.post(url + '/login_with_cookies')

print('get 请求：', session.get(url + '/protected'))
print('post 请求：', session.post(url + '/protected'))

headers = response.headers
cookies = headers.get('Set-Cookie').split(', ')
csrf_access_token = cookies[-1].strip('; Path=/').split('=')[-1]
response = session.post(url + '/protected', headers={'X-CSRF-TOKEN': csrf_access_token})
print('post 携带 csrf_access_token 请求：', response)

```

得到的结果如下

```
get 请求： <Response [200]>
post 请求： <Response [401]>
post 携带 csrf_access_token 请求： <Response [200]>
```

最终可以看出来，post 请求已经实现了双重令牌提交。

请注意，还有其他 CSRF 选项，比如在表单中查找双重提交令牌、更改 Cookie 路径等，这些选项可用于根据应用程序的需要进行调整。有关详细信息，请参阅跨站点请求伪造选项。

### Query String

您还可以将 JWT 作为查询字符串的一部分发送。然而，值得注意的是，在大多数情况下，我们建议不要这样做。它可能导致一些不明显的安全问题，比如将
JWT 保存在浏览器历史记录中，或者将 JWT 记录在后端服务器中，这两种情况都可能导致令牌泄露。但是，这个特性可能会提供一些有限的用途，例如发送密码重置链接，因此我们在这个扩展中支持它。

```python
response = requests.post(url + '/login_without_cookies')
token = response.json()['access_token']

response = requests.post(url + '/protected?jwt=' + token)
print(response.json())
```

### JSON Body

这看起来非常类似于 Header 方法，只不过我们将 JWT 作为 JSON Body 的一部分而不是 Header 发送。请注意，HEAD 或 GET 请求不能将
JSON 主体作为请求的一部分，因此这只适用于 POST/PUT/PATCH/DELETE 等操作。

```python
response = requests.post(url + '/login_without_cookies')
token = response.json()['access_token']

response = requests.post(url + '/protected', json={'access_token': token})
print(response.json())
```

## 刷新 token

在大多数 Web 应用程序中，如果用户在执行某项操作的过程中因为其 JWT 过期而退出，那将是不理想的。不幸的是，我们不能只更改每个请求的
JWT 的过期时间，因为一旦创建了 JWT，它就无法修改。让我们看一下通过刷新 JWT 来解决此问题的一些选项。

### 使用 Cookie 隐式刷新

将 JWT 存储在 cookie 中（当您的前端是网站时）的一个巨大好处是，在刷新令牌时，前端不必处理任何逻辑。这一切都可以通过 Flask
应用程序设置的 cookie 隐式发生。

这里的基本思想是，在每个请求结束时，我们将检查是否有即将到期的 JWT。如果我们发现一个即将过期的 JWT，我们将用一个新的 JWT
替换包含该 JWT 的当前 cookie，该 JWT 的过期时间更长。

当您的前端是浏览器时，这是我们推荐的方法。

```python
from datetime import datetime
from datetime import timedelta
from datetime import timezone

from flask import Flask
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import set_access_cookies
from flask_jwt_extended import unset_jwt_cookies

app = Flask(__name__)

# 如果为 true，则仅允许通过 https 发送包含您的 JWT 的 cookie。在生产中，这应该始终设置为 True
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=3)  # 设置默认的过期时间

jwt = JWTManager(app)


# 使用 `after_request` 回调，我们刷新任何在 30 分钟内过期的令牌。更改 timedeltas 以匹配您的应用程序的需要。
@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(seconds=3))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response


@app.route("/login", methods=["POST"])
def login():
    response = jsonify({"msg": "login successful"})
    access_token = create_access_token(identity="example_user")
    set_access_cookies(response, access_token)
    return response


@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@app.route("/protected")
@jwt_required()
def protected():
    return jsonify(foo="bar")


if __name__ == "__main__":
    app.run(debug=True)

```

然后用客户端进行测试

```python
session = requests.Session()

response = session.post(url + '/login')
print('post 请求：', session.get(url + '/protected'))
time.sleep(2)
print('post 请求：', session.get(url + '/protected'))
time.sleep(2)
print('post 请求：', session.get(url + '/protected'))
time.sleep(3)
print('post 请求：', session.get(url + '/protected'))

```

得到以下结果

```
post 请求： <Response [200]>
post 请求： <Response [200]>
post 请求： <Response [200]>
post 请求： <Response [401]>
```

可以看到最后一次请求失败了，原因是时间已经超过了约定期限。

### 使用 refresh_token 显式刷新

或者，这个扩展开箱即用，支持刷新令牌。刷新令牌是一种长期存在的 JWT，只能用于创建新的访问令牌。

关于如何使用刷新令牌，您有几个选择。您可以将访问令牌的过期时间存储在前端，并且每次发出 API
请求时首先检查当前访问令牌是否接近或已经过期，并根据需要刷新它。这种方法非常简单，在大多数情况下都可以正常工作，但请注意，如果您的前端时钟明显关闭，您可能会遇到问题。

另一种方法是使用您的访问令牌发出 API
请求，然后检查结果是否有效。如果请求的结果是一条错误消息，指出您的令牌已过期，请使用刷新令牌生成新的访问令牌并使用新令牌重做请求。无论前端的时钟如何，这种方法都可以工作，但它确实需要一些可能更复杂的逻辑。

当您的前端不是网站（移动设备、仅限 api 等）时，我们推荐使用刷新令牌。

```python
from datetime import timedelta

from flask import Flask
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_refresh_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=3)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(seconds=10)
jwt = JWTManager(app)


@app.route("/login", methods=["POST"])
def login():
    access_token = create_access_token(identity="example_user")
    refresh_token = create_refresh_token(identity="example_user")
    return jsonify(access_token=access_token, refresh_token=refresh_token)


# 我们在 jwt_required 中使用 `refresh=True` 选项来仅允许 refresh_token 访问此路由。
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify(foo="bar")


if __name__ == "__main__":
    app.run(debug=True)

```

然后进行测试

```python
response = requests.post(url + '/login')
access_token = response.json()['access_token']
refresh_token = response.json()['refresh_token']

response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('直接请求结果：', response)
time.sleep(2)
response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('延时 2 秒结果：', response)
time.sleep(2)
response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('继续延时 2 秒结果', response, response.json())

# token 失效之后请求新的
if response.status_code == 401:
    response = requests.post(url + '/refresh', headers={'Authorization': 'Bearer ' + refresh_token})
    access_token = response.json()['access_token']

response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('刷新之后的结果：', response)

time.sleep(6)
response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('延时第 10 秒结果', response, response.json())

# token 失效之后请求新的
if response.status_code == 401:
    response = requests.post(url + '/refresh', headers={'Authorization': 'Bearer ' + refresh_token})
    print('refresh_token 失效之后的结果：', response, response.json())

```

得到结果如下

```
直接请求结果： <Response [200]>
延时 2 秒结果： <Response [200]>
继续延时 2 秒结果 <Response [401]> {'msg': 'Token has expired'}
刷新之后的结果： <Response [200]>
延时第 10 秒结果 <Response [401]> {'msg': 'Token has expired'}
refresh_token 实效之后的结果： <Response [401]> {'msg': 'Token has expired'}
```

请注意，当访问令牌失效(例如，将用户注销)时，必须撤销任何相应的刷新令牌。有关如何处理此问题的详细信息，请参阅撤消刷新令牌。

### 令牌新鲜度模式

令牌新鲜度模式是一个非常简单的想法。每次用户通过提供用户名和密码进行身份验证时，他们都会收到一个可以访问任何路由的新访问令牌。但是一段时间后，该令牌不应再被视为新鲜的，并且一些关键或危险的路线将被阻止，直到用户再次验证他们的密码。即使他们的令牌不再是新鲜的，所有其他路由仍将为用户正常工作。例如，我们可能不允许用户更改他们的电子邮件地址，除非他们有一个新的令牌，但我们确实允许他们正常使用我们的
Flask 应用程序的其余部分。

令牌新鲜度模式内置在此扩展中，并且可以与上面讨论的两种令牌刷新策略无缝协作。让我们通过显式刷新示例来看看这个（在隐式刷新示例中看起来基本相同）。

```python  
from datetime import timedelta

from flask import Flask
from flask import jsonify
from flask import request

from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_refresh_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!    
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
jwt = JWTManager(app)


# 在这里验证用户密码，所以我们返回一个新的访问令牌  @app.route("/login", methods=["POST"])    
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if username != "admin" or password != "123456":
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity="example_user", fresh=True)
    refresh_token = create_refresh_token(identity="example_user")
    return jsonify(access_token=access_token, refresh_token=refresh_token)


# 如果我们在这里刷新一个令牌，我们有一段时间没有验证用户密码，所以将新创建的访问令牌标记为不新鲜  @app.route("/refresh", methods=["POST"])    
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity, fresh=False)
    return jsonify(access_token=access_token)


# 只允许新的 JWT 使用 `fresh=True` 参数访问此路由。  @app.route("/protected", methods=["GET"])    
@jwt_required(fresh=True)
def protected():
    return jsonify(foo="bar")


if __name__ == "__main__":
    app.run(debug=True)  
```  

我们还支持在创建令牌后的给定时间内将其标记为新鲜的。您可以通过在创建 JWT 时将 datetime.timedelta 传递给新选项来做到这一点：

```python  
create_access_token(identity, fresh=datetime.timedelta(minutes=15))  
```

## JWT 撤销与黑名单

JWT 撤销是一种机制，用于防止其他有效的 JWT 访问您的路由，同时仍然允许其他有效的 JWT 进入。要在此扩展中使用 JWT 撤销，您必须通过
token_in_blocklist_loader () 装饰器定义回调函数。每当使用有效的 JWT 访问受保护的路由时，都会调用此函数。回调将接收 JWT 标头和
JWT 有效负载作为参数，如果 JWT 已被撤销，则必须返回 True。

在生产环境中，您将希望使用某种形式的持久存储（数据库、redis 等）来存储您的 JWT。如果您的应用程序忘记了 JWT
在重新启动后被撤销，那将是很糟糕的。我们可以就使用哪种类型的存储引擎提供一些一般性建议，但最终选择将取决于您的特定应用程序和技术堆栈。

### Redis

如果您的唯一要求是检查 JWT 是否已被撤销，我们的建议是使用 redis。它速度极快，可以配置为将数据持久保存到磁盘，并且可以在存储
JWT 时利用生存时间 (TTL) 功能在过期后自动清除 JWT。下面是一个使用 redis 的例子：

```python
from datetime import timedelta

import redis
from flask import Flask
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

ACCESS_EXPIRES = timedelta(hours=1)

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = ACCESS_EXPIRES
jwt = JWTManager(app)

# 设置 redis 以存储块黑名单的令牌。
# 你可能希望将您的 redis 实例配置为将数据持久保存到磁盘，以便重新启动不会导致您的应用程序忘记 JWT 已被撤销。
jwt_redis_blocklist = redis.StrictRedis(
    host="localhost", port=6379, db=0, decode_responses=True
)


# 回调函数用来检查 jwt 是否已经存在 redis 的黑名单列表之中
@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    print(jwt_payload)
    jti = jwt_payload["jti"]
    token_in_redis = jwt_redis_blocklist.get(jti)
    return token_in_redis is not None


@app.route("/login", methods=["POST"])
def login():
    access_token = create_access_token(identity="example_user")
    return jsonify(access_token=access_token)


# 用于撤销当前用户访问令牌的端点。
# 将 JWT 的唯一标识符 (jti) 保存在 redis 中。
# 在存储 JWT 时还要设置生存时间 (TTL)，以便令牌过期后自动从 redis 中清除。
@app.route("/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    jwt_redis_blocklist.set(jti, "", ex=ACCESS_EXPIRES)
    return jsonify(msg="Access token revoked")


# 列入黑名单的访问令牌将无法再访问此令牌
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify(hello="world")


if __name__ == "__main__":
    app.run(debug=True)

```

然后进行测试

```python
response = requests.post(url + '/login')
access_token = response.json()['access_token']

response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('直接请求结果：', response)
time.sleep(1)
response = requests.delete(url + '/logout', headers={'Authorization': 'Bearer ' + access_token})
print('退出登录：', response)
time.sleep(1)
response = requests.get(url + '/protected', headers={'Authorization': 'Bearer ' + access_token})
print('退出登录之后请求受保护视图：', response)

```

得到结果如下

```
直接请求结果： <Response [200]>
退出登录： <Response [200]>
退出登录之后请求受保护视图： <Response [401]>
```

可以看到退出登录之后就无法再次请求了。

### 数据库

如果您需要跟踪有关已撤销 JWT 的信息，我们的建议是使用数据库。这使您可以轻松地存储和利用已撤销令牌的元数据，例如何时撤销、谁撤销、是否可以取消撤销等。这是使用
SQLAlchemy 的示例：

```python
from datetime import datetime
from datetime import timedelta
from datetime import timezone

from flask import Flask
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

ACCESS_EXPIRES = timedelta(hours=1)
app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = ACCESS_EXPIRES
jwt = JWTManager(app)

# 我们在这里使用内存数据库作为示例。确保在生产中使用具有持久存储的数据库！
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# 这可以扩展以满足您的应用程序的需求。例如，它可以跟踪谁撤销了 JWT、令牌何时过期、JWT 被撤销原因的注释、未撤销 JWT 的端点等。
# 当有数万条记录时，将 jti 设为索引可以显着加快搜索速度。请记住，每个（受保护的）请求都会发生此查询，
# 如果您的数据库支持 UUID 类型，这也可以用于 jti 列
class TokenBlockList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)


# 回调函数用于检查 jwt 是否存在黑名单数据库中
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlockList.id).filter_by(jti=jti).scalar()

    return token is not None


@app.route("/login", methods=["POST"])
def login():
    access_token = create_access_token(identity="example_user")
    return jsonify(access_token=access_token)


# 用于撤销当前用户访问令牌的端点。将 JWT 的唯一标识符 (jti) 保存到我们的数据库中。
@app.route("/logout", methods=["DELETE"])
@jwt_required()
def modify_token():
    jti = get_jwt()["jti"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlockList(jti=jti, created_at=now))
    db.session.commit()
    return jsonify(msg="JWT revoked")


# 列入黑名单的访问令牌将无法再访问此令牌
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify(hello="world")


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)

```

然后使用前面的测试代码，结果会是一样的。

### 撤销刷新令牌

需要注意的是，在注销时还必须撤销用户的刷新令牌; 否则，这个刷新令牌可以仅用于生成新的访问令牌。通常这属于前端应用程序的责任，它必须向后端发送两个单独的请求以撤消这些令牌。

这可以通过标记为 `@jwt_need()` 和 `@jwt_need(refresh=True)` 的两个独立路由来实现，以分别撤销访问和刷新令牌。但是，提供单个端点更为方便，前端可以为每个令牌发送一个
DELETE。下面是一个例子:

```python
@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def logout():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    jwt_redis_blocklist.set(jti, "", ex=ACCESS_EXPIRES)

    # Returns "Access token revoked" or "Refresh token revoked"
    return jsonify(msg=f"{ttype.capitalize()} token successfully revoked")
```

或数据库格式:

```python
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)
    user_id = db.Column(
        db.ForeignKey('person.id'),
        default=lambda: get_current_user().id,
        nullable=False,
    )
    created_at = db.Column(
        db.DateTime,
        server_default=func.now(),
        nullable=False,
    )


@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def modify_token():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlocklist(jti=jti, type=ttype, created_at=now))
    db.session.commit()
    return jsonify(msg=f"{ttype.capitalize()} token successfully revoked")
```

令牌类型和用户列不是必需的，可以省略。话虽如此，包括这些可以帮助审核前端是否正确执行其撤销工作并撤销两个令牌。

或者，有几种方法可以同时撤销两个令牌：

1. 在标头中发送访问令牌（通常），并在 DELETE 请求正文中发送刷新令牌。这节省了一个请求，但仍需要前端更改，因此可能不值得实施
2. 将刷新令牌的 jti 嵌入访问令牌中。撤销路由应使用访问令牌进行身份验证。撤销访问令牌后，从中提取刷新 jti
   并使两者无效。这样做的好处是不需要前端的额外工作。
3. 创建时将每个生成的令牌 jti 存储在数据库中。有一个布尔列来表示它是否有效，token_in_blocklist_loader
   应该根据它来响应。撤销令牌后，将该令牌行以及同一用户同时生成的所有其他令牌标记为无效。这也将允许 “处处注销”
   选项，其中用户的所有令牌立即失效，否则不容易实现

最佳选择当然取决于并且需要根据情况进行选择。如果有任何时候需要立即使未知的、未跟踪的令牌失效，这可以通过更改密钥来完成。

## 配置选项

您可以通过 [Flask 的配置](https://flask.palletsprojects.com/en/2.0.x/config/) 处理更改这个扩展的许多选项。例如:

```
app.config["OPTION_NAME"] = option_value
```

关于配置参数见原文： https://flask-jwt-extended.readthedocs.io/en/stable/options/

## 改变默认行为

这个扩展提供了合理的默认行为。例如，如果过期令牌尝试访问受保护的端点，您将收到类似 `{"msg": "Token has expired"}` 的 JSON
响应和 401 状态代码。但是，您可能希望根据应用程序的需要自定义此扩展的各种行为。我们可以使用各种加载器函数来做到这一点。这是一个如何做到这一点的例子。

```python  

from flask import Flask    
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!    
jwt = JWTManager(app)


# 设置回调函数以在过期令牌尝试访问受保护路由时返回自定义响应。
# 这个特定的回调函数将 jwt_header 和 jwt_payload 作为参数，并且必须返回一个 Flask 响应。
# 查看 API 文档以查看其他回调函数所需的参数和返回值。
@jwt.expired_token_loader
def my_expired_token_callback(jwt_header, jwt_payload):
    return jsonify(code="dave", err="I can't let you do that"), 401


@app.route("/login", methods=["POST"])
def login():
    access_token = create_access_token("example_user")
    return jsonify(access_token=access_token)


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify(hello="world")


if __name__ == "__main__":
    app.run()  
```

可以定义各种回调来自定义此扩展的行为。有关此扩展中可用的回调函数的完整列表，请参阅 [Configuring Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/en/stable/api/#module-flask_jwt_extended)
文档。

### 自定义错误消息

```python

@jwt.additional_claims_loader
def add_claims_to_jwt(identity):
    if identity == 1:  # instead of hard-coding, we should read from a config file to get a list of admins instead  
        return {'is_admin': True}
    return {'is_admin': False}


# This method will check if a token is blacklisted, and will be called automatically when blacklist is enabled  
@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(decrypted_token):
    return decrypted_token['jti'] in BLACKLIST


# The following callbacks are used for customizing jwt response/error messages.  
# The original ones may not be in a very pretty format (opinionated)  
@jwt.expired_token_loader
def expired_token_callback():
    return jsonify({
        'message': 'The token has expired.',
        'error': 'token_expired'
    }), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):  # we have to keep the argument here, since it's passed in by the caller internally  
    return jsonify({
        'message': 'Signature verification failed.',
        'error': 'invalid_token'
    }), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        "description": "Request does not contain an access token.",
        'error': 'authorization_required'
    }), 401


@jwt.needs_fresh_token_loader
def token_not_fresh_callback():
    return jsonify({
        "description": "The token is not fresh.",
        'error': 'fresh_token_required'
    }), 401


@jwt.revoked_token_loader
def revoked_token_callback():
    return jsonify({
        "description": "The token has been revoked.",
        'error': 'token_revoked'
    }), 401
```

## 自定义装饰器

您可以创建自己的装饰器来扩展此扩展提供的装饰器的功能。例如，您可能希望创建自己的装饰器来验证 JWT 是否存在，以及验证当前用户是否是管理员。

可以使用 `flask_jwt_extended.verify_jwt_in_request()` 来构建自己的装饰器，这与 `flask_jwt_tended.jwt_need()` 使用的函数相同。

这里有一个例子。

```python
from functools import wraps

from flask import Flask
from flask import jsonify

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
jwt = JWTManager(app)


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["is_administrator"]:
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Admins only!"), 403

        return decorator

    return wrapper


@app.route("/login", methods=["POST"])
def login():
    access_token = create_access_token(
        "admin_user", additional_claims={"is_administrator": True}
    )
    return jsonify(access_token=access_token)


@app.route("/protected", methods=["GET"])
@admin_required()
def protected():
    return jsonify(foo="bar")


if __name__ == "__main__":
    app.run()
```