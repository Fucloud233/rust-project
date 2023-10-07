# rust-project

本插件能够在不创建Cargo项目的条件下成功激活rust-analyzer插件。

运行原理：[rust-analyzer Manual](https://rust-analyzer.github.io/manual.html#non-cargo-based-projects)

## 使用方式

1. 安装好[rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)插件
2. 在设置中配置参数`sysroot`
   > 如果不清楚可以使用`rustc --print sysroot`命令查看
3. 在设置中设置创建项目模式（**Auto**/Manual）。
   > 目前手动模式正在开发中，还未时装
4. 打开一个文件夹，创建`.rs`文件
5. 可见`rust-analyzer`插件能够正常运行

## 插件介绍

### 1. 项目创建模式
#### Auto 模式

当选择Auto模式时，在当前工作区的所有rs文件都会自动地保存在`.vscode/settings.json`文件中。
其中每个rs文件都会作为单独的可执行文件，你可以使用rustc编译运行，也可以使用[Code Runner](https://marketplace.visualstudio.com/items?itemName=formulahendry.code-runner&ssr=false#overview)插件运行。

#### Manual 模式

> 目前此模式还仍在设计开发中，敬请期待！ 


### 2. 依赖

在rust中，除了能够单文件编程，还能使用`extern`关键词导入其他的rust文件。

为了让导入的文件也能够被`rust-analyzer`识别，本插件提供了下面的指令，来实现对依赖的管理。

#### Import/Unimport Crate

本插件可以支持手动地为当前文件导入（或取消导入）外部Crate，
这样`rust-analyzer`插件就能够识别到外部的Crate中的内容。
当然，你不能直接使用rustc编译该文件，具体编译可以参考以下链接。
> 使用rustc多文件编译：[Stackoverflow](https://stackoverflow.com/questions/59915954/how-to-add-external-packages-and-run-in-rust-compiler)
> 
> 当然，后续可能会开发一个可以自动编译的脚本。

#### Refresh Deps

由于依赖的定位是根据配置文件中`Crates`数组的下标决定的，
因此当删除文件时，可能会导致依赖指向错误的`Crate`。
当然本插件会在你删除文件时，自动处理这些依赖的问题，
重新调整依赖的下标，并删除于此相关的依赖项。

#### Check Deps

在添加依赖的时候，也有可能会出现循环依赖的问题，
这是在编译过程绝对不允许的，本插件提供指令`Check Deps` 来检测这种问题。

## 问题汇总

### 1. rust-analyzer提示`xxx/lib/rustlib/src`路径不存在
rust-analyzer 需要标准库的源码，如果你的系统中不存在，则需要执行以下命令手动按安装标准库源码：
```bash
$ rustup component add rust-src
```

> https://wiki.archlinuxcn.org/zh-tw/Rust

### 2. 修改settings.json文件后插件不会正常加载

本插件的配置信息在插件激活后只会加载一次，每次操作后只会对内存中的数据进行修改，并写回文件中。
如果你想手动修改`settings.json`文件并应用，则可以使用命令`Reload Settings File`。