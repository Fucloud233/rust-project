import { Uri, window } from 'vscode';

import { projectConfig, CreateMethod } from './config';
import { getSettingsFile } from './info/settingsFile';
import { BaseError, ExistError } from './error';
import Crate from './info/Crate';

// 向settingsFile中添加Crate
// [注意] 添加Crate不会影响crates的顺序
async function appendCrateToSettingsFile(fileUri: Uri) {
    let settingsFile = getSettingsFile();

    try {
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
            let settingsFile = getSettingsFile();
            settingsFile.removeCrateFromProjectInfo(fileUri);
            await settingsFile.save();
            break;
        };
        // 启用手动存储模式
        case CreateMethod.manual: {

        }
    }
}