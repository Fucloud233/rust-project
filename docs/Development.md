# 开发辅助文档

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

## v0.2.0 优化方向

### 1. Auto模式
自动配置模式，每个file都是一个单独的project
1. 【选做】当用户切换成auto模式时，判断当前工作路径是否存在`rust-project.json`文件，如果根目录存在，则询问用户是否要删除
2. [*] 直接在settings文件中添加
3. [*] 实现添加之前的判断重复
4. [*] 考虑删除的问题

#### 命令
1. [ ] As CrateWith 添加到某个文件的crate目录下（这个需要有考虑check）

### 2. Manual模式

手动配置项目文件，可以将配置信息单独放在一个文件里面

注意：
1. 在创建项目文件时，在上级目录中允许存在`rust-project`文件

1. 通过指令 `create project`在指定目录下创建`rust-project`文件
2. 同时会在`setting.json`中加载当前目录中
3. 在创建rs文件时，需要该文件是否在rust-project目录下，
   1. 如果在，则直接找对应的`rust-project`即可
   2. 如果不在，则直接添加

    > 此处是用于应对自动创建和手动创建的模式
4. 删除同理

#### 命令
1. [ ] 创建一个项目，输入项目名称
2. [ ] 将文件作为单独可执行项目

### 其他

最后再考虑怎么识别依赖的问题