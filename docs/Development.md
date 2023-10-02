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
1. 【选做】选择创建项目的位置
2. [ ] 之后的所有文件都将是这个文件的crates

#### 命令
1. [ ] 创建一个项目，输入项目名称
2. [ ] 将文件作为单独可执行项目

### 其他

最后再考虑怎么识别依赖的问题