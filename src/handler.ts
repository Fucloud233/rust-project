import { Uri, window } from 'vscode';

import { projectConfig, SaveMethod, CreateMethod } from './config';
import { ProjectInfo } from './info/projectInfo';
import { SettingsFile } from './info/settingsFile';
import { ProjectFile, getProjectFileUri } from './info/projectFile';
import { BaseError, ExistError } from './error';
import Crate from './info/Crate';

/**
 * @deprecated 修改了新的运行逻辑
 */
async function createSettingsFile(rootUri:  Uri, fileUri: Uri) {
    const crate = new Crate(fileUri);
    const projectInfo = new ProjectInfo([crate]);
    try {
        let settingsFile = new SettingsFile(rootUri);
        await settingsFile.load();
        settingsFile.appendProjectInfo(projectInfo);
        settingsFile.save();
    } catch (e) {
        console.log(e);
    }
}

/**
 * @deprecated 修改了新的运行逻辑
 */
// 使用rust-project配置
async function createProjectFile(projectFileUri: Uri, rootUri: Uri, fileUri: Uri) {
    // 1. 在rust-project中配置
    let projectFile = new ProjectFile(projectFileUri);
    projectFile.init(new Crate(fileUri));
    projectFile.save();

    // 2. 然后在.vscode/settings.json中配置
    const isRoot = rootUri === fileUri;
    if(!isRoot) {
        let settingsFile = new SettingsFile(rootUri);
        await settingsFile.load();
        settingsFile.appendProjectInfo(projectFileUri);
        settingsFile.save();
    }
} 

/**
 * @deprecated 修改了新的运行逻辑
 */
// 修改rust-project配置文件
async function modifyProjectFile(projectFileUri: Uri, fileUri: Uri) {
    let projectFile = new ProjectFile(projectFileUri);
    await projectFile.load();

    // console.log(projectFile);

    projectFile.appendCrate(new Crate(fileUri));
    projectFile.save();
}

/**
 * @deprecated 修改了新的运行逻辑
 * @param rootUri 
 * @param fileUri 
 */
export async function handleOld(rootUri: Uri, fileUri: Uri) {
    // 检测rust-project.json项目文件
    try {
        const saveMethod = projectConfig.saveMethod;
        switch(saveMethod) {
            // 如果使用存储在settings中
            case SaveMethod.settings: {
                createSettingsFile(rootUri, fileUri);
                break;
            };

            // 如果使用存储在rust-project中
            case SaveMethod.rustProject: {
                // 1. 查找projectfile文件
                let [projectFileUri, isExist] = await getProjectFileUri(rootUri, fileUri);

                if (isExist) {
                    // (1) 存在 -> 修改该项目文件
                    modifyProjectFile(projectFileUri, fileUri);
                } else {
                    // (2) 不存在 -> 在当前文件中创建rust-project
                    createProjectFile(projectFileUri, rootUri, fileUri);
                }

                break;
            }
        };
    } catch (error) {
        window.showErrorMessage("项目文件检测失败!");
    }
}

// 向settingsFile中添加Crate
// [注意] 添加Crate不会影响crates的顺序
async function appendCrateToSettingsFile(fileUri: Uri) {
    let settingsFile = new SettingsFile();
    try {
        await settingsFile.load();
        settingsFile.appendCrateToProjectInfo(new Crate(fileUri));
        // console.log("SettingsFile: ", settingsFile.fileInfo.firstProject);
        // [注意] 保存不能写在finally 当出现错误时 可能会空白覆盖
        await settingsFile.save();
    } catch(err) {
        if(err instanceof ExistError) {
            window.showWarningMessage(err.message + " And it will be covered.");
            await settingsFile.save();
        } else if(err instanceof BaseError) {
            window.showErrorMessage(err.message);
        } else {
            console.log("Not known error: ", err);
            window.showErrorMessage("Not known error!");
        }
    }
}

export async function handleCreate(fileUri: Uri) {
    switch(projectConfig.createMethod) {
        // 自动存储在settings中
        case CreateMethod.auto: {
            appendCrateToSettingsFile(fileUri);
            break;
        };
        // 启用手动存储模式
        case CreateMethod.manual: {

        }
    }
}

export async function handleDelete(fileUri: Uri) {
    switch(projectConfig.createMethod) {
        // 自动存储在settings中
        case CreateMethod.auto: {
            let settingsFile = new SettingsFile();
            await settingsFile.load();
            settingsFile.removeCrateFromProjectInfo(fileUri);
            await settingsFile.save();
            break;
        };
        // 启用手动存储模式
        case CreateMethod.manual: {

        }
    }
}