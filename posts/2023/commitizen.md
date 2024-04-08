---
title: 使用 commitizen 格式化 commit message
description: 使用 commitizen 格式化 git 项目的 commit message
date: 2023-07-27
tags:
  - Python 代码质量
---

视频地址： [BV1kV411V7Pn](https://www.bilibili.com/video/BV1kV411V7Pn?p=3)

# 使用 commitizen 格式化 commit message

在做项目时，每次进行 `git commit -m 'xxx'` 都会想给提交起一个合适的名字，当次数多了之后，内容也会变的混乱。当某一天系统出错了，看着那么多的提交记录，可能也不清楚应该要回溯到那个版本。

撰写好的 commit message ，除了让未来的自己知道自己是在干嘛，也能让团队之间的沟通更加顺利。在提交 Pull Request / Merge
Request 时，审核者能更快第知道增加了那些功能。新成员看着以往的 commit message 也能找到项目的脉络，更容易上手。

## Commitizen

> https://commitizen-tools.github.io/commitizen/

除了提供 commit message 撰写的建议与规范，[commitizen](https://commitizen-tools.github.io/commitizen/)
更进一步提供了交互式的界面，让使用者可以轻松生成符合规范的 commit message 。

除了采取来自 Angular 社区的[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)(约定式提交)
外，commitizen 还提供了可定制化的功能，能让每个团队或者项目都可以依照自己的需求，便携相对应的规范。规范了 commit message
后，除了增加可读性外，也让信息可以被解析做其他运用。例如提升版本号、产生更新日志。

## 安装与设定 Commitizen

安装

```
poetry add commitizen --group dev
```

第一次在项目中使用 commitizen 可以使用初始化指令来完成基本的配置

```
cz init
```

1、选择配置文件存放的位置。这里直接选 `pyproject.toml` 了，也可以使用单独的配置。

```
$ cz init
Welcome to commitizen!

Answer the questions to configure your project.
For further configuration visit:

https://commitizen-tools.github.io/commitizen/config/

? Please choose a supported config file:  (Use arrow keys)
 » pyproject.toml
   .cz.toml
   .cz.json
   cz.json
   .cz.yaml
   cz.yaml

```

2、选择提交风格。默认的提交风格有三种，如果不满意也可以自己选择 [第三方模板](https://commitizen-tools.github.io/commitizen/third-party-commitizen/)
。这里我选择 `cz_conventional_commits`

```
? Please choose a cz (commit rule): (default: cz_conventional_commits) (Use arrow keys)
 » cz_conventional_commits
   cz_customize
   cz_jira

```

3、选择版本的来源。直接使用默认的 poetry 了。

```
? Choose the source of the version: (Use arrow keys)
   commitizen: Fetch and set version in commitizen config (default)
   cargo: Get and set version from Cargo.toml:project.version field
   composer: Get and set version from composer.json:project.version field
   npm: Get and set version from package.json:project.version field
   pep621: Get and set version from pyproject.toml:project.version field
 » poetry: Get and set version from pyproject.toml:tool.poetry.version field
   scm: Fetch the version from git and does not need to set it back

```

4、选择版本方案。选择默认

```
? Choose version scheme:  (Use arrow keys)
   semver
 » pep440
```

5、输入版本的格式如何，常用的格式有`$version`(`1.0.0`) 或`v$version`(`v1.0.0`)。回车默认就好了。

```
? Please enter the correct version format: (default: "$version")
```

6、使用 bump 指令是自动更新日志，回车默认

```
? Create changelog automatically on bump Yes
```

7、在重大变更时保持当前大版本，回车默认

```
? Keep major version zero (0.x) during breaking changes Yes
```

8、选择那一种钩子进行提交，回车默认

```
? What types of pre-commit hook you want to install? (Leave blank if you don't want to install) (Use arrow keys to move, <space> to select, <a> to toggle, <i> to i 
nvert)
 » ○ commit-msg
   ○ pre-push
```

全部设置完了之后，就会在 `pyproject.toml` 文件中生成一下内容

```
[tool.commitizen]  
name = "cz_conventional_commits"  
tag_format = "$version"  
version_scheme = "pep440"  
version_provider = "poetry"  
update_changelog_on_bump = true  
major_version_zero = true
```

## 使用 Commitizen

注意：使用之前需要 pre-commit 的内容全部通过校验，不然还是不能提交

```
# 使用 commitizen 做 commit
# (也可以用简短版的 cz)
cz commit
```

之前选择的是 `cz_conventional_commits` 这套规则，所以会出现以下内容

```
$ cz commit
? Select the type of change you are committing (Use arrow keys)
 » fix: A bug fix. Correlates with PATCH in SemVer
   feat: A new feature. Correlates with MINOR in SemVer
   docs: Documentation only changes
   style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
   refactor: A code change that neither fixes a bug nor adds a feature
   perf: A code change that improves performance
   test: Adding missing or correcting existing tests
   build: Changes that affect the build system or external dependencies (example scopes: pip, docker, npm)
   ci: Changes to our CI configuration files and scripts (example scopes: GitLabCI)
```

首先是询问做了那一种改动，接着要求输入改动的各项细节，细节内容查看后面的 `Commit Message 标准格式`

+ Scope： 改动范围
+ Subject：简短描述改动内容
+ Body：详细描述这次的改动
+ Is this a BREAKING CHANGE？：是否是一次大改动？
+ Footer：其他参考咨询，通常是将 Issue 的编号放在这个位置

全部回答完之后，通过之后会产生 commit message

## 强制检查 commit message

刚开始引入 commitizen 时可能会经常忘记使用它来做 commit，这时候就可以结合 pre-commit 一起来使用（2.0.0 版本之后，`cz init`
会初始化设置好）。

安装提交校验

```
pre-commit install -t commit-msg
```

在项目的 `.pre-commit-config.yaml` 中添加以下内容

```
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-toml
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: "v3.0.0" # Use the sha / tag you want to point at
    hooks:
      - id: prettier
        exclude: >
          (?x)^(
              .*.yaml|
              package-lock.json|
              yarn.lock|
              ^.+\.min\.(js|css)$
          )$
        stages: [commit]
  - repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
      - id: black
  - repo: https://github.com/commitizen-tools/commitizen
    rev: 3.5.3
    hooks:
      - id: commitizen
        stages: [commit-msg]
```

然后再进行提交，就会出现校验

## Commit Message 标准格式

Commit Message 标准格式包括三个部分：Header，Body，Footer

```
<type>(<scope>): <subject>
// 空一行
<body>
// 空一行
<footer>
```

其中，Header 是必需的，Body 和 Footer 可以省略

### Header

Header 部分只有一行，包括三个字段：type（必需）、scope（可选）、subject（必需）

**type**

用于说明类型。可分以下几种类型

| 操作          | 说明                                                                                         |
|-------------|--------------------------------------------------------------------------------------------|
| feat        | 新功能（A new feature)                                                                         |
| fix         | 修复bug (A bug fix)                                                                          |
| improvement | 对当前功能的改进（An improvement to a current feature)                                              |
| docs        | 仅包含文档的修改（Documentation only changes)                                                       |
| style       | 格式化变动，不影响代码逻辑。比如清除多余空白，删除分号 等                                                              |
| refactor    | 重构，即不是新增功能，也不是修改bug的代码变动                                                                   |
| perf        | 提高性能的修改（A code change that improves performance)                                           |
| test        | 添加或修改测试代码(Adding missing tests or correcting existing tests)                               |
| bui1d       | 构建工具或外部依赖包的修改。比如更新依赖包的版本等 ( Changes that affect the bui1d system or externa1 dependencies) |
| ci          | 持续集成的配置文件或脚本的修改（ changes to our cI configuration files and scripts)                        |
| chore       | 杂项。其它不修改源代码与测试代码的修改( other changes that don't modify src or test files)                    |
| revert      | 撤销某次提交( Reverts aprevious commit)                                                          |

**scope**

用于说明影响的范围，比如数据层、控制层、视图层等等。

**subject**

主题，简短描述。一行

### Body

对 subject 的补充。可以多行。

### Footer

主要是一些关联 issue 的操作。

## 自定义校验规则

`.cz.toml`

```toml
[tool.commitizen]
name = "cz_customize"
tag_format = "$version"
version_scheme = "pep440"
version_provider = "poetry"
update_changelog_on_bump = true
major_version_zero = true


[tool.commitizen.customize]
message_template = "{{change_type}}{% if scope %}({{scope}}){% endif %}:{% if subject %} {{subject}}{% endif %} {% if footer %} {{footer}}{% endif %}"
example = "feature: this feature enable customize through config file"
schema = "<type>: <body>"
schema_pattern = "(feature|fix|docs|style|refactor|perf|test|revert|build).*?:(\\s.*)"
bump_pattern = "^(break|new|fix|hotfix)"
bump_map = { "break" = "MAJOR", "new" = "MINOR", "fix" = "PATCH", "hotfix" = "PATCH" }
change_type_order = ["BREAKING CHANGE", "feat", "fix", "refactor", "perf"]
info_path = "cz_customize_info.txt"
info = """
This is customized info
"""
commit_parser = "^(?P<change_type>feature|fix|docs|style|refactor|perf|test|revert|build).*?:\\s(?P<message>.*)?"
changelog_pattern = "^(feature|fix|docs|style|refactor|perf|test|revert|build)?(!)?"
change_type_map = { "feature" = "Feat", "bug fix" = "Fix" }


# 自定义提交指令
[[tool.commitizen.customize.questions]]
type = "list"
name = "change_type"
choices = [
    { value = "feature", name = "feature: 新功能" },
    { value = "fix", name = "fix: 修复 bug" },
    { value = "docs", name = "docs: 文档的修改" },
    { value = "style", name = "style: 格式化变动，不影响代码逻辑" },
    { value = "refactor", name = "refactor: 重构，即不是新增功能，也不是修改 bug 的代码变动" },
    { value = "perf", name = "perf: 性能优化" },
    { value = "test", name = "test: 增加测试" },
    { value = "revert", name = "revert: 回退" },
    { value = "build", name = "build: 打包" },
]
# choices = ["feature", "fix"]  # short version
message = "请选择提交类型："


# 修改内容的范围
[[tool.commitizen.customize.questions]]
type = "input"
name = "scope"
message = "请输入修改内容的范围（可选）："


# 自己的提交内容
[[tool.commitizen.customize.questions]]
type = "input"
name = "subject"
message = "请输入简要描述（必填）："


# 自己的提交内容
[[tool.commitizen.customize.questions]]
type = "input"
name = "body"
message = "请输入详细描述（可选）："


[[tool.commitizen.customize.questions]]
type = "input"
name = "footer"
message = "请输入需要关闭的 issue（可选）："
```

参考：

+ https://blog.wei-lee.me/posts/tech/2020/03/python-table-manners-commitizen/
+ https://github.com/pre-commit/mirrors-prettier/issues/5
