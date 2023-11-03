# rust-project

You can use `rust-analyzer` without creating a Cargo project using our extension.

## Usage

### Basic

1. Open a empty folder
2. Using `rust-project: Initialize` command to enable our extension
3. Create a `*.rs` file
4. You can write rust code using rust-analyzer now

> If there are rust code in your folder, this extension will be automatically enabled.

### Nest Folder

In the above circumstance, the all configuration info about code will be recorded in `.vscode/settings.json`.
When the quantity of files increasing, the size of this file will also increase.
Our extension provides a method to record the files for a folder.

1. Create a empty folder in your workspace
2. Right click the folder in the exporer
3. Select the `Create rust-project`
   > You can't create rust-project for  

## Q &A

### 1. rust-analyzer提示`xxx/lib/rustlib/src`路径不存在
rust-analyzer 需要标准库的源码，如果你的系统中不存在，则需要执行以下命令手动按安装标准库源码：

rust-analyzer need source code of the standard library.

```bash
$ rustup component add rust-src
```

> https://wiki.archlinuxcn.org/zh-tw/Rust

### 2. 修改settings.json文件后插件不会正常加载

本插件的配置信息在插件激活后只会加载一次，每次操作后只会对内存中的数据进行修改，并写回文件中。
如果你想手动修改`settings.json`文件并应用，则可以使用命令`Reload Settings File`。