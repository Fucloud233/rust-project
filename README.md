# rust-project

本插件适用于不使用Rust构建项目的场景，自动配置`rust-project.json`文件，以能够正常使用rust-analyzer插件。

运行原理：https://rust-analyzer.github.io/manual.html#non-cargo-based-projects

## Features

* 在不创建Cargo项目时，也能正常使用rust-analyzer插件
* 在创建`.rs`文件时，自动配置`rust-project.json`文件
* 能够选择配置`rust-project.json`的方式

## Requirements

请先安装好`rust-analyzer`创建
