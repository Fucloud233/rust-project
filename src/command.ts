import { Uri, window, commands, QuickPickItem } from 'vscode';
import assert = require('assert');

import { BaseError, CrateNotFoundError, NOT_KNOW_ERROR } from './error';
import { getRelativeUri } from './utils/fs';

import { createProjectFile, checkProjectFileExistInParentDir } from './info/projectFile';
import { getSettingsFile, reloadSettingsFile } from './info/settingsFile';

import Crate from './info/Crate';
import Dep from './info/Dep';

class Command {
    name: string;
    handler: Function;

    constructor(name: string, handler: Function) {
        this.name = name;
        this.handler = handler;
    }
}

class CrateItem implements QuickPickItem {
    /**
     * display name: Crate名
     */
    label: string;
    /**
     * relative uri: Crate路径
     */
    description:string;
    index: number;
    
    constructor(info: Crate, index: number) {
        this.label = info.displayName;
        this.description = info.relativeRootModule;
        this.index = index;
    }

    isEqualWithUri(fileUri: string) {
        return this.description === fileUri;
    }
}

export const addCrateToCmd = commands.registerTextEditorCommand(
    "rust-project.auto.importCrate",
    async (editor) => {
        try {
            // 1. 读取项目信息
            let projectInfo = getSettingsFile().firstInfoItem;
            if(projectInfo === undefined || projectInfo.crates.length === 0) {
                throw new BaseError("There are not crates in your workspace.");
            }
    
            // 2. 获取当前Crate 与其Index
            let curCrateUri = getRelativeUri(editor.document.fileName);
            let curCrate = projectInfo.findCrateWithUri(curCrateUri);
    
            // 3. 加载选项 
            assert(curCrate !== undefined);
            let options = projectInfo.crates
                // [注意] map和filter的顺序
                .map((crate, index, _array) => new CrateItem(crate, index))
                .filter((crate, index, _array) => {
                    // (1) 判断是否是当前文件
                    let flag = !curCrate?.isEqualWithName(crate.label);
                    // (2) 判断是否在依赖中出现过
                    curCrate?.deps.forEach(dep => 
                        flag &&= index !== dep.index);
                    return flag;
                });
            if(options.length === 0){
                window.showWarningMessage("You have imported all the crates");
                return;
            }
    
            // 4. 打开QuickPick
            const input = window.createQuickPick<CrateItem>();
            input.placeholder = "Select the crate you want to import.";
            input.items = options;
            input.show(); 
            input.onDidAccept(async () => {
                // 获取选择Item的信息
                let selectItem = input.selectedItems[0];
                let index = selectItem.index,
                    displayName = selectItem.label;
                // 添加并保存依赖
                // console.log(curFileIndex, displayName);
                curCrate?.appendDep(new Dep(index, displayName));
                await getSettingsFile().save();
    
                input.dispose();
            });
        } catch(error) {
            if(error instanceof BaseError) {
                window.showErrorMessage(error.message);
            } else {
                window.showErrorMessage(NOT_KNOW_ERROR);
                console.log(error);
            }
        }
    }
);

export const unimportCrate = commands.registerTextEditorCommand(
    "rust-project.auto.unimportCrate",
    async(editor)=> {
        try {
            // 1. 读取项目信息
            let projectInfo = getSettingsFile().firstInfoItem;
            if(projectInfo === undefined || projectInfo.crates.length === 0) {
                throw new BaseError("There are not crates in your workspace.");
            }
    
            // 2. 获取当前Crate 与其Index
            let curCrateUri = getRelativeUri(editor.document.fileName);
            let curCrate = projectInfo.findCrateWithUri(curCrateUri);
    
            // 3. 加载选项 
            assert(curCrate !== undefined);
            if(!curCrate.hasDeps()){
                window.showWarningMessage("You haven't imported any crates.");
                return;
            }
            let options = curCrate.deps
                .map((dep, index, _array) => {
                    let crate = projectInfo?.crates[dep.index];
                    assert(crate !== undefined);
                    return new CrateItem(crate, index);
                });
    
            // 4. 打开QuickPick
            const input = window.createQuickPick<CrateItem>();
            input.placeholder = "Select the crate you want to unimport.";
            input.items = options;
            input.show(); 
            input.onDidAccept(async () => {
                // 获取选择Item的信息
                let selectItem = input.selectedItems[0];
                let index = selectItem.index,
                    displayName = selectItem.label;
                // 添加并保存依赖
                curCrate?.removeDep(new Dep(index, displayName));
                await getSettingsFile().save();
    
                input.dispose();
            });
        } catch(error) {
            if(error instanceof BaseError) {
                window.showErrorMessage(error.message);
            } else {
                window.showErrorMessage(NOT_KNOW_ERROR);
                console.log(error);
            }
        }
    }
);

export const reloadSettingsFileCmd = commands.registerCommand(
    "rust-project.auto.reloadSettingsFile",
    async() => {
        reloadSettingsFile();
    }
);

// 验证指令是否正常的指令
export const checkDepsCmd = commands.registerTextEditorCommand(
    "rust-project.auto.checkDeps",
    async (editor) => {
        let settingsFile = getSettingsFile();
        await settingsFile.load();

        let projectInfo = settingsFile.firstInfoItem;
        if(projectInfo === undefined) {
            window.showErrorMessage("There are not projects in your workspace");
            return;
        }

        let curFileUri = getRelativeUri(editor.document.fileName);
        let curCrate = projectInfo.findCrateWithUri(curFileUri);
        try {
            if(curCrate===undefined) {
                throw new CrateNotFoundError(curFileUri);
            }
            // 验证Crates的依赖
            projectInfo.checkCrateDeps(curCrate);

            window.showInformationMessage("The tree of Deps is ok.");
        } catch (error) {
            if(error instanceof BaseError) {
                window.showErrorMessage(error.message);
            } else {
                window.showErrorMessage(NOT_KNOW_ERROR);
                console.log(error);
            }
        }
    }
);

export const createRustProject = commands.registerCommand(
    "rust-project.createRustProject",
    async (folderPath: Uri) => {

        // 检查上级目录是否存在rust-project文件
        let [isExist, _] = await checkProjectFileExistInParentDir(folderPath);

        if(isExist) {
            window.showErrorMessage("The rust-project file has already exists in the parent dirctory. " +
                "You can't create a new one.");
            return;
        }
       
        // 向setting.json中添加
        let settingsFile = getSettingsFile();
        settingsFile.appendProjectInfo(createProjectFile(folderPath));
        settingsFile.save();
    }
);
