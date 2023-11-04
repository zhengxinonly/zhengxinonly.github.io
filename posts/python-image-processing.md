---
title: 使用 cos 搭建图床时的图片处理
description: 很早的时候就开始准备搭建属于自己的个人博客，兜兜转转到最近才搭建完成。最终的整个技术栈为 vitepress + 腾讯云 cos + cdn 完成。这种模式不仅是搭建个人博客，即使是搭建静态官网也是没有问题的，同时成本会非常低。
date: 2023-05-17
tags:
  - 未分类
---

# 使用 cos 搭建图床时的图片处理

很早的时候就开始准备搭建属于自己的个人博客，兜兜转转到最近才搭建完成。最终的整个技术栈为 vitepress + 腾讯云 cos + cdn
完成。这种模式不仅是搭建个人博客，即使是搭建静态官网也是没有问题的。同时成本会非常低，cos 的 1G
存储按量付费一个月不到一块钱，流量费也差不多是 1G 不到一块，CDN 的流量费用也差不多。如果购买套餐包的话，价格更低。并且打开速度也会很快。

但是在搭建的时候，发现图片占用空间很大，手动上传到腾讯云然后再修改文件中的连接也很麻烦。同时默认的图片是没有压缩的，并且版权无水印，如果采用腾讯云的服务器，又是一笔开支。因为自己的服务本身就不是很复杂，所幸就直接自己用
Python 写做了。

## 图片压缩

关于图片压缩的方案，python 其实也有不少，但是 pillow 压缩的失真率较高，OpenCV
压缩技术上实现又比较的麻烦。最终就找到了 `pngquant` 这个 c 语言编写的工具，使用 python 通过 cmd 控制起来进行压缩页比较的方便。

::: tip
pngquant 工具可以直接进入 [pngquant 官网](https://pngquant.org/) 进行下载。将二进制文件放在项目的根目录下就可以像下面的代码一样操作。
:::

```python
import os
import os.path
import sys

# 压缩工具
PngquantExe = "pngquant.exe"  # 参考 https://pngquant.org/ 工具来实现的


def compression(filename):
    # cmd = PngquantExe + " --force " + filename +  " --quality 50 -o " + filename # 压缩50%的质量，直接覆盖压缩至源文件
    cmd = PngquantExe + " " + filename + " --quality 50 -o demo/out.png"  # 压缩 50% 的质量，输出图片名称为 out.png
    os.system(cmd)


if __name__ == '__main__':
    compression('image-20230308034801986.png')
```

`pngquant` 压缩图片的压缩率还是很客观的，一百多 kb 的图片压缩之后就只剩下几十 kb 。不仅可以节约存储费用、节约流量费用，还可以提升网页的加载速度。

## 添加水印

使用 Python 给图片添加水印，有两种方案：图片水印，文字水印。为了图方便，我就直接采用文字水印了。

```python
from PIL import Image, ImageDraw, ImageFont

# 设置字体，如果没有，也可以不设置
font = ImageFont.truetype("C:\WINDOWS\FONTS\MSYHL.TTC", 22)


def add_watermark(filename):
    img = Image.open(filename)
    img_width, img_height = img.size

    # 在图片上添加文字
    draw = ImageDraw.Draw(img)
    # 将文字绘制在右下角
    draw.text((img_width - 22 * 7, img_height - 22 * 2), "正心全栈编程", (188, 192, 191), font=font)
    img.save(filename)


# 保存
imageFile = "Snipaste_2023-05-16_13-55-41.png"

```

::: tip
添加图片水印可以参考这篇文章：https://blog.csdn.net/weixin_40327641/article/details/124126674
:::

## 盲水印

最后是盲水印，怎么说呢，这玩意添加之后图片会膨胀的非常大，不清楚是我没有掌握正确的姿势的原因。既然添加成功了，那么顺便就记录下来吧。

```python
from blind_watermark import WaterMark

wm = 'zhengxinonly'


def add_blind_watermark(origin_path, output_path):
    bwm1 = WaterMark(password_img=1, password_wm=1)
    bwm1.read_img(origin_path)
    bwm1.read_wm(wm, mode='str')
    bwm1.embed(output_path)


def load_blind_watermark(origin_path, output_path):
    bwm1 = WaterMark(password_img=1, password_wm=1)
    bwm1.read_img(origin_path)
    bwm1.read_wm(wm, mode='str')
    len_wm = len(bwm1.wm_bit)
    wm_extract = bwm1.extract(output_path, wm_shape=len_wm, mode='str')
    return wm_extract


origin_path = 'pic/ori_img.png'
output_path = 'output/embedded.png'

add_blind_watermark(origin_path, output_path)
print(load_blind_watermark(origin_path, output_path))
```

## 图片上传

最后则是图片上传，这一块直接看了一下腾讯云 COS 的接口文档，然后编写了一个上传脚本，就与前面几个功能整合到一起了。

最终实现的逻辑是

+ 直接用 obsidian 编写文档，图片先存在本地。
+ 文章写完之后运行脚本
    1. 将文章中的图片压缩、复制到指定文件夹归档
    2. 读取图片添加水印，然后上传到腾讯云 COS
    3. 获取上传之后的连接，替换原本文章中的链接
    4. 将文章中的相对路径图片文件夹、文件夹中的图片全部删除