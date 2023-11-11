# 开发辅助文档


## 2023.11.11 TODO:

implement some commands about sysroot

## 2023.11.07 Exist Bug

1. `settings.json` file isn't created when using `initialize` command
2. `sysroot` may be not loaded when using `initialize`
3. `reload` command error 

## 指令的触发方式
1. 可以直接设置`commands`
2. 也可以通过如下方式在菜单栏中配置指令

    ```json
        "menus": {
            "editor/context": [
                {  
                    // 指令名称
                    "command": "test-fs.addFile",
                    // 设置命令所在分组
                    "group": "1_modification",
                    // 当源文件语言为rust的同时
                    "when": "resourceLangId == rust"
                }
            ]
        }
    ```

## v0.4.1 优化方向

启动插件的方式和配置方式的差别

### 启动插件的方式
自动模式和手动模式不能同时使用，而且需要为两种模式进行转换

1. 自动转换？查看是否真的需要自动转换
2. 手动模式多项目的解决方案

#### 自动模式

需要通过指令手动启用插件，这个启用方式不是全局的，是局部的。

启用插件后，所有添加的文件都会被添加到`vscode.settings.json`文件中。

#### 手动模式

用户需要选择一个文件夹，然后在里面创建项目。

在这个模式下，项目的作用域仅局限于项目文件所在路径的子目录下，
创建的文件会保存在`vscode/settings.json`中。

> 在一开始的开发过程中应该首先考虑根目录的情况，在考虑多项目的优化问题
> 可以使用轮流顶替的保存方法


## v0.3.0 优化方向

### 1. Auto模式
自动配置模式，每个file都是一个单独的project
1. 【选做】当用户切换成auto模式时，判断当前工作路径是否存在`rust-project.json`文件，如果根目录存在，则询问用户是否要删除
2. [*] 直接在settings文件中添加
3. [*] 实现添加之前的判断重复
4. [*] 考虑删除的问题

#### 命令
1. [ ] As CrateWith 添加到某个文件的crate目录下（这个需要有考虑check）
2. [ ] 删除依赖
3. [ ] 运行

### 2. Manual模式

手动配置项目文件，可以将配置信息单独放在一个文件里面

注意：
1. 在创建项目文件时，在上级目录中不允许存在`rust-project`文件
    > 让上级目录不允许重复 主要是为了实现简单、
    > 还是要保证下级目录允许出现，以此保证信息不会交叉。
    > 初次之外，我们按照**最长前缀匹配原则**。
2. 通过指令 `create project`在指定目录下创建`rust-project`文件
3. 同时会在`setting.json`中加载当前目录中
4. 在创建rs文件时，需要该文件是否在rust-project目录下，
   1. 如果在，则直接找对应的`rust-project`即可
   2. 如果不在，则直接添加

    > 此处是用于应对自动创建和手动创建的模式
5. 删除同理

#### 待修复的bug
1. 当添加ProjectInfoPath可能出现覆盖情况

#### 命令
1. [ ] 创建一个项目，输入项目名称
2. [ ] 将文件作为单独可执行项目

### 其他

最后再考虑怎么识别依赖的问题