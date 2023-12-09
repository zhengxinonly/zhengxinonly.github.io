
# Python JWT


在 Python 使用 JWT 主要的方案是 [PyJWT](https://pyjwt.readthedocs.io/en/stable/) 工具。

`PyJWT` 是一个 Python 库，它允许你对  JSON Web Token（JWT）进行编码和解码。

## 安装与基本使用

可以使用 `pip` 安装 `PyJWT`：

```
$ pip install pyjwt
```

### 编码与解码

**编码函数**

```python
def encode(  
    self,    
    payload: Dict[str, Any],                                        # payload 参数  
    key: str,                                                       # 秘钥  
    algorithm: Optional[str] = "HS256",                             # 加密算法  
    headers: Optional[Dict[str, Any]] = None,                       # headers 值  
    json_encoder: Optional[Type[json.JSONEncoder]] = None,          # json 的编码器  
) -> str:
```

**解码函数**

```python
def decode(
    self,
    jwt: str,                                               # jwt token 字符串
    key: str = "",                                          # 秘钥
    algorithms: Optional[List[str]] = None,                 # 加密算法
    options: Optional[Dict[str, Any]] = None,               # 扩展的解码和验证选项，默认是 None
    audience: Optional[Union[str, Iterable[str]]] = None,   # 受众声明
    issuer: Optional[str] = None,                           # 签发人声明 
    leeway: Union[int, float, timedelta] = 0,               # 延迟验证的时间值  
    **kwargs,
) -> Dict[str, Any]:
```

### 用 HS256 算法对 Token 进行编码和解码

```
>>> import jwt
>>> key = "zhengxinonly.com"
>>> encoded = jwt.encode({"name": "正心全栈编程"}, key, algorithm="HS256")
>>> print(encoded)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiXHU2YjYzXHU1ZmMzXHU1MTY4XHU2ODA4XHU3ZjE2XHU3YTBiIn0.6uIZcYlPvK5KBYk_Sl76c0xjceV13nf7QXdJFgY-L-A
>>> jwt.decode(encoded, key, algorithms="HS256")
{'name': '正心全栈编程'}
```

### 用 RS256（RSA）对令牌进行编码和解码

RSA 进行加密用的比较少，想要了解可以直接查看 [官网介绍](https://pyjwt.readthedocs.io/en/stable/usage.html) 


### 指定 headers 字段


```
>>> secret = 'zhengxinonly.com'
>>> jwt.encode(
...     {'name': '正心全栈编程'},
...     secret,
...     algorithm="HS256",
...     headers={"kid": "230498151c214b788dd97f22b85410a5"},
... )
'eyJhbGciOiJIUzI1NiIsImtpZCI6IjIzMDQ5ODE1MWMyMTRiNzg4ZGQ5N2YyMmI4NTQxMGE1IiwidHlwIjoiSldUIn0.eyJuYW1lIjoiXHU2YjYzXHU1ZmMzXHU1MTY4XHU2ODA4XHU3ZjE2XHU3YTBiIn0.IlR9SNJ-EhaRU6JDIXPhch_6IoKx8nVdzWVpCIvYPWQ'
```

### 在没有验证的情况下读取声明集

如果想读取 JWT 时不执行签名验证或者是不验证任何字段，则可以将 `verify_signature` 设置为 `False` 。

```
>>> jwt.decode(encoded, options={"verify_signature": False})
{'name': '正心全栈编程'}
```

:::tip
除非你清楚自己在做什么，否则使用这个功能通常是不明智的。如果没有数字签名的信息，则不能验证任何声明集的完整性与真实性。
:::

### 读取未经验证的标题

有些 API 要求在不进行验证的情况下读取 JWT 标头。例如，在令牌发行者使用多个密钥，而无法预先知道发行者的哪一个公钥或共享的秘密用于验证的情况下，发行者可能会在标题中包含该密钥的标识符。

```
>>> jwt.get_unverified_header(encoded)
{'alg': 'HS256', 'typ': 'JWT'}
```

## 注册声明

JWT 规范定义了一些注册声明名称，并定义了如何使用它们。PyJWT 支持以下这些注册声明名称：

+ `exp（Expiration Time）`：到期时间
+ `nbf（Not Before Time）`：不早于时间
+ `iss（Issuer）`：发行人
+ `aud（Audience）`：受众
+ `iat（Issued At）`：签发时间

### 到期时间声明（exp）

`exp (过期时间)` 声明标识 JWT 不能被接受处理的过期时间。处理 `exp` 声明要求当前的时间必须在 `exp` 声明中列出的到期时间之前。实施者可能会提供一些小的回旋余地，通常不超过几分钟，以处理时钟偏差。它的值必须是一个时间戳或者日期对象。使用此声明是可选的。

你可以将过期时间作为 `UTC UNIX` 时间戳 (int) 或日期时间传递，它们将被转换为 int。例如:

```
>>> import jwt                                                        
>>> from datetime import datetime, timezone                                                              
>>> print(datetime.now().timestamp())                                                                    
1684388770.876419                                                                                        
>>> secret = 'zhengxinonly.com'                                                                          
>>> print(jwt.encode({"exp": 1684388581}, secret))                                                       
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQzODg1ODF9.Yojai_hWkZ5WRqDNeg83cXnUg3d03z9mmc2UnKp5jpY
>>> token = jwt.encode({"exp": datetime.now(tz=timezone.utc)}, secret)                                   
>>> print(token)                                                                                         
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODQzODg3NzB9.n5Ljs_glHgK1Ubqgfxlr8u5sZqvck-8hfnPJee0ujHY
>>> print(jwt.decode(token, options={"verify_signature": False}))                                        
{'exp': 1684388770}
>>> 
```

在 `jwt.decode()` 中自动验证过期时间，如果过期时间过去，则引发 jwt.ExpiredSignatureError：

```
>>> try:
...     jwt.decode(token, secret, algorithms=["HS256"])
... except jwt.ExpiredSignatureError:
...     print('token has expired')
... 
token has expired
```

因为过期时间是与当前的 UTC 时间进行比较，因此一定要在编码中使用 UTC 时间戳或者日期时间。

PyJWT 还支持灵活的自定义过期时间，这就以为这你还可以验证过期之后的 token，但是这个过去时间不能太久。例如有一个 JWT 有效负载，其过期时间设置为创建后的 30 秒，但是你知道有时候会在 30 秒之后处理它，那么就可以设置 10 秒的回旋时间，以获得一些余地：

```
>>> jwt_payload = jwt.encode(
...     {"exp": datetime.now(tz=timezone.utc) + timedelta(seconds=30)},
...     secret,
... )
>>>
>>> time.sleep(32)
>>>
>>> print(jwt.decode(jwt_payload, secret, leeway=10, algorithms=["HS256"]))
{'exp': 1684389469}
```

也可以使用 datetime.timedelta 实例，而不是将剩余时间指定为秒数。上面示例中的最后一行相当于:

```python
print(jwt.decode(jwt_payload, secret, leeway=timedelta(seconds=10), algorithms=["HS256"]))
```

### 不早于时间声明（nbf）

`nbf` (NOT before)声明标识 JWT 不被接受处理的时间。处理 `nbf` 声明要求当前的时间必须在 `nbf` 声明中列出的时间之后或等于该时间。实施者可能会提供一些小的回旋余地，通常不超过几分钟，以处理时钟偏差。它的值必须是一个时间戳或者日期对象。使用此声明是可选的。

Nbf 声明的工作方式与上面的 exp 声明类似。

```python
jwt.encode({"nbf": 1371720939}, secret)  
jwt.encode({"nbf": datetime.now(tz=timezone.utc)}, secret)
```

### 发行人声明（iss）

`iss（Issuer）` 发行人声明标识发行 JWT 的主体。这个声明一般是针对具体应用的。`iss` 值是一个区分大小写的字符串，使用字符串或者是 URI 值。使用此声明是可选的。

```python
payload = {"some": "payload", "iss": "urn:foo"}  
  
token = jwt.encode(payload, "secret")  
decoded = jwt.decode(token, "secret", issuer="urn:foo", algorithms=["HS256"])
```

如果发行者声明不正确，将引发 jwt.InvalidIssuerError。

###  受众声明（aud）

`aud（Audience）` 受众声明标识了 JWT 的收件人。每个打算处理 JWT 的主体必须使用受众声明中的一个值来标识自己。如果在加密是添加了该字段，而在解密时没有出现，那么 JWT 就会报错误。

```python
payload = {"some": "payload", "aud": ["urn:foo", "urn:bar"]}  
token = jwt.encode(payload, "secret")  
decoded = jwt.decode(token, "secret", algorithms=["HS256"])  
print(decoded)
```

在 JWT 只有一个 `aud` 的特殊情况下，`aud` 值可能是一个包含字符串或者 URI 值的区分大小写的字符串。

如果接受多个 `aud`，则 jwt.decode 的 `aud` 参数也可以是可迭代对象。

```python
payload = {"some": "payload", "aud": "urn:foo"}  
  
token = jwt.encode(payload, "secret")  
decoded = jwt.decode(  
    token, "secret", audience=["urn:foo", "urn:bar"], algorithms=["HS256"]  
)
```

`aud` 值一般是在特定情况下使用。使用这个声明是可选的。

如果访问者声明不正确，将引发 `jwt.InvalidAudienceError`。

### 签发时间（iat）

`iat（Issued At）` 签发时间声明确定了 JWT 发布的时间。这个声明可以用来确定 JWT 的年龄。它的值必须是一个包含时间戳或者日期的值。使用此声明是可选的。

```python
jwt.encode({"iat": 1684391669}, "secret")  
jwt.encode({"iat": datetime.now(tz=timezone.utc)}, "secret")
```

## 解码时要求出现的声明

如果希望要求一个或多个声明出现在声明集中，可以设置 request 参数以包括这些声明。

```
>>> jwt.decode(encoded, options={"require": ["exp", "iss", "sub"]})
{'exp': 1371720939, 'iss': 'urn:foo', 'sub': '25c37522-f148-4cbf-8ee6-c4a9718dd0af'}
```

## 附录

pyjwt 官方文档： https://pyjwt.readthedocs.io/en/stable/

