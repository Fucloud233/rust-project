import { Uri, window } from 'vscode';

import * as config from './config';
import { ProjectInfo, Crate} from './info/projectInfo';
import { SettingsFile } from './info/settingsFile';
import { ProjectFile, getProjectFileUri } from './info/projectFile';
import { ExistError } from './error';

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
        const saveMethod = config.getSaveMethod();
        switch(saveMethod) {
            // 如果使用存储在settings中
            case config.SaveMethod.settings: {
                createSettingsFile(rootUri, fileUri);
                break;
            };

            // 如果使用存储在rust-project中
            case config.SaveMethod.rustProject: {
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
async function appendCrateToSettingsFile(rootUri:  Uri, fileUri: Uri) {
    let settingsFile = new SettingsFile(rootUri);
    try {
        await settingsFile.load();
        settingsFile.appendCrateToProjectInfo(new Crate(fileUri));
    } catch(err) {
        if(err instanceof ExistError) {
            window.showWarningMessage(err.message + " And it will be covered.");
        } else {
            window.showErrorMessage("Not known error!");
        }
    } finally {
        // 最后要保存
        settingsFile.save();
    }
}

export async function handleCreate(rootUri: Uri, fileUri: Uri) {
    const createMethod = config.getCreateMethod();
    
    switch(createMethod) {
        // 自动存储在settings中
        case config.CreateMethod.auto: {
            appendCrateToSettingsFile(rootUri, fileUri);
            break;
        };
        // 启用手动存储模式
        case config.CreateMethod.manual: {

        }
    }
}

export async function handleDelete(rootUri: Uri, fileUri: Uri) {
    const createMethod = config.getCreateMethod();

    switch(createMethod) {
        // 自动存储在settings中
        case config.CreateMethod.auto: {
            let settingsFile = new SettingsFile(rootUri);
            await settingsFile.load();
            settingsFile.removeCrateFromProjectInfo(fileUri);
            settingsFile.save();
            break;
        };
        // 启用手动存储模式
        case config.CreateMethod.manual: {

        }
    }
}