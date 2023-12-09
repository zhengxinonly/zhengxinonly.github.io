# JWT

jwt 介绍： https://jwt.io/introduction/

JSON Web Token (JWT) 是一个开放标准([RFC 7519](https://tools.ietf.org/html/rfc7519)) ，它定义了一种紧凑和独特的方式，可以在各个客户端之间安全的传递
JSON 对象。这些信息被进行数字签名了，所以可以被验证与信任，JWT 可以使用秘钥（使用 HMAC 算法）或者使用 RSA、ECDSA 的 公钥/私钥
形式进行加密。

虽然 JWT 可以进行加密，也可以在各个客户端之间保证 Token 的安全性，但是我们主要关注那些已经签发的 Token。已经签名的 Token
可以验证其中所包含的声音的完整性，而加密的 Token 可以将这些声音隐藏在附加参数里面。当使用公钥/私钥对签名时，签名也验证只有持有私钥的一方才是签名人。

## 什么时候应该使用 JWT ？

下面是一些 JWT 的使用场景：

1、 **授权**：这是 JWT 最常的使用场景。一旦用户登录，后续的每个请求都必须携带 JWT ，允许用户携带 Token
访问所有的路由、服务器和资源。单点登录时目前使用最广泛的一个场景，因为它开销小并且能够轻易的实现跨域访问。

2、**信息交换**：JWT Token 是一种非常好的可以在各个客户端实现安全的交互数据的方式。因为可以对 JWT
进行签名（例如使用公钥/私钥对进行加密），所以可以确保发生消息的人是我们期待的那个。此外，由于签名是根据 header 与 payload
计算出来的，因此还可以验证内容是否被篡改。

## JWT 构成

JWT 就是一段字符串，由三段信息构成的，将这三段信息文本用 `.` 链接一起就构成了 Jwt 字符串。它们分别是

- Header
- Payload
- Signature

就像这样：

```bash
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiXHU2YjYzXHU1ZmMzXHU1MTY4XHU2ODA4XHU3ZjE2XHU3YTBiIiwiYWRtaW4iOnRydWV9.Y1H8vDimuq_FHZ7UDOLozAJNLoPTack-ubsxCEDDgBc
```

第一部分是头部（header)：

```bash
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

第二部分是载荷（payload)：

```bash
eyJuYW1lIjoiXHU2YjYzXHU1ZmMzXHU1MTY4XHU2ODA4XHU3ZjE2XHU3YTBiIiwiYWRtaW4iOnRydWV9
```

第三部分是签证（signature)：

```bash
Y1H8vDimuq_FHZ7UDOLozAJNLoPTack-ubsxCEDDgBc
```

### header

报头通常由两部分组成: 令牌的类型(即 JWT)和所使用的签名算法（如 HMAC、SHA256或 RSA）。

例如：

```bash
{
  "alg": "HS256",
  "typ": "JWT"
}
```

jwt 的头部承载两部分信息：

- typ 字段是声明类型，这里是 jwt
- alg 字段是加密的算法，通常直接使用 HMAC 、HA256

将头部进行 base64 编码构成了第一部分

### payload

荷载是存放有效信息的地方，这些有效信息包含三个部分：注册的声明（Registered claims）、公共的声明（Public claims）、 私有的声明（Private
claims）

1、[**注册声明**](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1)
：这是一组预先定义的声明，不是强制性的，而是推荐的，它们提供了一套易于使用的、可共用的声明。其中就有 **iss**（issuer 发行人），
**exp**（expiration 过期时间），**sub**（subject 主题），**aud**（audience
受众），以及 [其他的](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) 。

2、[**公共声明**](https://tools.ietf.org/html/rfc7519#section-4.2)：使用 JWT
的人可以随意定义这些声明。但是为了避免冲突应该在 [互联网 JWT 注册表](https://www.iana.org/assignments/jwt/jwt.xhtml)
中定义它们，或者可以定义为包含抗冲突名称的 URI。

3、[**私有声明**](https://tools.ietf.org/html/rfc7519#section-4.3)：这些是为了在同意使用这些声明的当事人之间共享信息而提出的，既不是注册声明的也不是公共声明。

定义一个 payload ：

```python
payload = {
    "name": "正心全栈编程",
    "admin": True
}
```

将其进行 base64 编码，就能得到 JWT 的第二部分。

::: tip
请注意，对于已签名的令牌，这些信息虽然受到保护，不会被篡改，但任何人都可以读取。除非加密，否则不要将重要信息放在 JWT 的
payload 或 header 中。
:::

### signature

要创建 signature 部分，需要先获取 header、payload、secret（秘钥）、header 中指定的算法（alh），然后对其进行签名。

例如，如果想使用 HMAC SHA256 算法签名将按以下方式创建：

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

JWT 的第三部分是一个签证信息，这个签证信息由三部分组成：

- header (base64后的)
- payload (base64后的)
- secret

这个部分需要 base64 加密后的 header 和 base64 加密后的 payload 使用 `.` 连接组成的字符串，然后通过 header
中声明的加密方式进行加盐 `secret` 组合加密，然后就构成了 jwt 的第三部分。

将这三部分用 `.` 连接成一个完整的字符串构成了最终的 jwt。

:::tip
可以在 https://jwt.io/#debugger-io 验证生成的 JWT Token
:::

## 附录

拓展阅读：

[JWT 官网](https://jwt.io/introduction/)

[JSON Web Token 入门教程（阮一峰）]( http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html) 
