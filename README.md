# rust-project

本插件能够在不创建Cargo项目的条件下成功激活rust-analyzer插件。

运行原理：https://rust-analyzer.github.io/manual.html#non-cargo-based-projects

## Features

* 在不创建Cargo项目时，也能正常使用rust-analyzer插件
* 可以自定义选择配置`rust-project.json`的方式

## Requirements

请先安装好`rust-analyzer`插件。

## Todo
* 在settings.joson的配置方式中，以crates的粒度进行添加

# QA

## Q: rust-analyzer提示`xxx/lib/rustlib/src`路径不存在
rust-analyzer 需要标准库的源码，如果你的系统中不存在，则需要执行以下命令手动按安装标准库源码：
```bash
$ rustup component add rust-src
```

> https://wiki.archlinuxcn.org/zh-tw/Rust