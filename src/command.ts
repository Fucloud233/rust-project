import { window, commands, QuickPickItem } from 'vscode';

import { SettingsFile } from './info/settingsFile';
import { Crate, Dep } from './info/projectInfo';
import { getRelativeUri } from './utils/fs';

class Command {
    name: string;
    handler: Function;

    constructor(name: string, handler: Function) {
        this.name = name;
        this.handler = handler;
    }
}

class CrateItem implements QuickPickItem {
    label: string;
    description:string;
    index: number;
    
    constructor(crate: Crate, index: number) {
        this.label = crate.displayName;
        this.description = crate.relativeRootModule;
        this.index = index;
    }

    isEqualWithUri(fileUri: string) {
        return this.description === fileUri;
    }
}

export const addCrateToCmd = commands.registerTextEditorCommand(
    "rust-project.auto.importCrate",
    async (editor) => {
        // 1. 读取项目信息
        let settingsFile = new SettingsFile();
        await settingsFile.load();
        
        let crates = settingsFile.cratesFromFirstProject;
        if(crates.length === 0) {
            window.showInformationMessage("There are not crates in your workspace.");
        }

        // 2. 获取当前Crate 与其Index
        let curFileUri = getRelativeUri(editor.document.fileName);
        let curFileIndex = crates.findIndex((crate) => crate.isEqualWithUri(curFileUri));

        // 3. 打开QuickPick
        const input = window.createQuickPick<CrateItem>();
        input.placeholder = "Select the crate you want to import.";
        // [注意] map和filter的顺序
        input.items = crates.map((crate, index, _array) => new CrateItem(crate, index))
            .filter((crate, _index, _array) => !crate.isEqualWithUri(curFileUri));
        input.show(); 
        input.onDidAccept(async () => {
            // 获取选择Item的信息
            let selectItem = input.selectedItems[0];
            let index = selectItem.index,
                displayName = selectItem.label;
            // 添加并保存依赖
            // console.log(curFileIndex, displayName);
            crates[curFileIndex].appendDep(new Dep(index, displayName));
            await settingsFile.save();

            input.dispose();
        });
    }
);

