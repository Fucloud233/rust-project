import { Uri } from 'vscode';
import * as path from 'path';
import { instanceToPlain, plainToClass } from 'class-transformer';

import { SettingsInfo } from './settingsInfo';
import { checkFile, writeJsonFile, readJsonFile } from '../utils/fs';
import { Crate, ProjectInfo } from './projectInfo';
import { ExistError } from '../error';

const SETTINGS_FILE_NAME = path.join(".vscode", "settings.json");

export class SettingsFile {
    fileUri: Uri;
    fileInfo: SettingsInfo;

    constructor(rootUri: Uri) {
        this.fileUri = Uri.joinPath(rootUri, SETTINGS_FILE_NAME);
        this.fileInfo = new SettingsInfo();
    }

    // 读取文件
    async load() {
        // 读取settings文件
        let readSettingsFile;
        if(await checkFile(this.fileUri)) {
            // 读取正常
            readSettingsFile = await readJsonFile(this.fileUri);
        }

        // 使用class-transformer将Object转换为SettingsInfo
        this.fileInfo = plainToClass(SettingsInfo, readSettingsFile);   
    }

    // 保存文件
    async save() {
        try{
            writeJsonFile(this.fileUri, instanceToPlain(this.fileInfo));
        } catch(error) {
            throw error;
        }
    }

    /* 如果在接口内部封装load+save 如果需要调用多次操作 则会重复IO读写 */

    // 添加项目信息
    appendProjectInfo(projectInfo: ProjectInfo | Uri) {
        // TODO: 判断是否会重复
        this.fileInfo.appendProjectInfo(projectInfo);
    }

    /**
     * 向ProjectInfo中添加Crate 
     * @param crate 
     */
    // [注意] 这里不是异步函数 (async)
    appendCrateToProjectInfo(crate: Crate) {
        const project = this.fileInfo.firstProject;
        // 如果不存在ProjectInfo则直接添加
        if(project === undefined) {
            this.fileInfo
                .appendProjectInfo(new ProjectInfo([crate]));
            return;
        }

        let index = project.findCrate(crate);
        if(index === -1) {
            project.pushCrate(crate);
        } else {
            project.setCrate(crate, index);
            throw new ExistError('The Crate');
        }
    }

    removeCrateFromProjectInfo(fileUri: Uri) {
        const project = this.fileInfo.firstProject;
        if(project === undefined)  {
            return;
        }        

        const crateIndex = project.findCrateWithUri(fileUri);
        if(crateIndex === -1) {
            return;
        }

        project.removeCrate(crateIndex);
    }

    getCratesRelativeUri(rootUri: Uri): string[] {
        const project = this.fileInfo.firstProject;
        if(project === undefined || rootUri === undefined) {
            throw new Error();
        }

        let cratesList = project.crates;
        let relativeUriList = [];
        for(let crate of cratesList) {
            relativeUriList.push(
                path.relative(rootUri.fsPath, crate.rootModule)
            );
        }

        return relativeUriList;
    }
}