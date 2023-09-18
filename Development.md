# 指令的触发方式
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