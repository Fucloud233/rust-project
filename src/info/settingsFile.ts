import { Uri } from 'vscode';
import * as path from 'path';
import { Exclude, instanceToPlain, plainToClass } from 'class-transformer';

import { checkFile, writeJsonFile, readJsonFile, getRootUri } from '../utils/fs';
import { BaseError, ExistError, FileParseError, NotFoundError } from '../error';
import { SettingsInfo } from './settingsInfo';
import { ProjectInfo }  from './projectInfo';
import Crate from './Crate';

const SETTINGS_FILE_NAME = path.join(".vscode", "settings.json");

export class SettingsFile extends SettingsInfo {
    @Exclude()
    rootUri: Uri;
    @Exclude()
    fileUri: Uri;

    constructor(rootUri: Uri | undefined = getRootUri()) {
        super();
        if(rootUri===undefined) {
            throw new NotFoundError("The RootUri");
        } 

        this.fileUri = Uri.joinPath(rootUri, SETTINGS_FILE_NAME);
        this.rootUri = rootUri;
    }

    // 读取文件
    async load() {
        try {
            // 读取settings文件
            let readSettingsFile;
            if(await checkFile(this.fileUri)) {
                // 读取正常
                readSettingsFile = await readJsonFile(this.fileUri);
            }
            // 使用class-transformer将Object转换为SettingsInfo
            Object.assign(this,  plainToClass(SettingsInfo, readSettingsFile));   
        } catch {
            throw new FileParseError(`\"${SETTINGS_FILE_NAME}\"`);
        }
    }

    // 保存文件
    async save() {
        try{
            writeJsonFile(this.fileUri, instanceToPlain(this));
        } catch(error) {
            throw error;
        }
    }

    /* 如果在接口内部封装load+save 如果需要调用多次操作 则会重复IO读写 */

    // 添加项目信息
    appendProjectInfo(projectInfo: ProjectInfo | Uri) {
        // TODO: 判断是否会重复
        super.appendProjectInfo(projectInfo);
    }

    /**
     * 向ProjectInfo中添加Crate 
     * @param crate 
     */
    // [注意] 这里不是异步函数 (async)
    appendCrateToProjectInfo(crate: Crate) {
        const project = this.firstProject;
        // 如果不存在ProjectInfo则直接添加
        if(project === undefined) {
            this.appendProjectInfo(new ProjectInfo([crate]));
            return;
        }

        let index = project.findCrateIndex(crate);
        if(index === -1) {
            project.pushCrate(crate);
        } else {
            project.setCrate(crate, index);
            throw new ExistError('The Crate');
        }
    }

    removeCrateFromProjectInfo(fileUri: Uri) {
        const project = this.firstProject;
        if(project === undefined)  {
            return;
        }        

        const crateIndex = project.findCrateIndexWithUri(fileUri);
        if(crateIndex === -1) {
            return;
        }

        project.removeCrate(crateIndex);
        // 在删除crate时 crate的相对顺序改变 需要刷新依赖
        project.refreshDeps();
    }

    getCratesRelativeUri(): string[] {
        const project = this.firstProject;
        if(project === undefined) {
            throw new Error();
        }

        let cratesList = project.crates;
        let relativeUriList = [];
        for(let crate of cratesList) {
            relativeUriList.push(
                crate.relativeRootModule
            );
        }

        return relativeUriList;
    }
}

let settingsFile = new SettingsFile();
let isOk = false;

export async function loadSettingsFile() {
    if(!isOk) {
        await settingsFile.load();
        isOk = true;
    }
}

export async function reloadSettingsFile() {
    isOk = false;
    await settingsFile.load();
    isOk = true;
}

export function getSettingsFile(): SettingsFile {
    if(!isOk) {
        throw new BaseError("Settings File hasn't been loaded yet. Please wait a moment!");
    }
    return settingsFile;
}