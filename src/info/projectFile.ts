import * as path from 'path';
import { Uri } from 'vscode';
import { Exclude, instanceToPlain, plainToInstance } from 'class-transformer';

import { getRootUri, checkFileExist, writeJsonFile, readJsonFile } from '../utils/fs';
import { ProjectInfo } from './projectInfo';
import Crate from './Crate';

// 项目配置文件名
export const PROJECT_FILE_NAME = "rust-project.json";

export class ProjectFile extends ProjectInfo {
    @Exclude()
    fileUri: Uri;

    constructor(fileUri: Uri, crates: Crate[] = []) {
        super(crates);
        this.fileUri = fileUri;
    }

    async load() {
        try {
            let loadProjectInfo;
            if(await checkFileExist(this.fileUri)) {
                loadProjectInfo = await readJsonFile(this.fileUri);
            }
            Object.assign(this, plainToInstance(ProjectInfo, loadProjectInfo));            
        } catch (error) {
            throw error;
        }
    }

    async save() {
        try {
            // 使用class-transformer保存
            writeJsonFile(this.fileUri, instanceToPlain(this));
        } catch(error) {
            throw error;
        }
    }

    /**
     * 初始化配置信息文件
     * @deprecated
     *  */ 
    init(crate: Crate | undefined) {
        if(crate === undefined) {
            // this.fileJson = new ProjectInfo([]);
        } else {
            // this.fileJson = new ProjectInfo([crate]);
        }
    }

    /**
     * @deprecated
     * @param crate 
     */
    appendCrate(crate: Crate) {
        this["crates"].push(crate);
    }
}

// 判断ProjectFile是否存在
export async function checkProjectFileExist(folderPath: Uri): Promise<boolean> {
    let projectFileUri = Uri.joinPath(folderPath, PROJECT_FILE_NAME);
    return await checkFileExist(projectFileUri) !== undefined;
}

// 返回值 [Uri, boolean], 前者是Project文件路径，后者是是否存在
// 如果文件不存在则会默认返回文件当前路径下的
// TODO: 从文件的当前目录往根目录查找
export async function getProjectFileUri(rootPath: Uri, filePath: Uri):
     Promise<[Uri, boolean]> {

    // 拆分路径 并预处理一下数组 -> 方便后续循环的判断
    let subPaths = path.relative(rootPath.fsPath, filePath.fsPath)
        .split(path.sep);
    subPaths.pop();
    subPaths.push(PROJECT_FILE_NAME);

    // 判断是否存在项目文件
    let curPath = rootPath;
    for (let subPath of subPaths) {
        // console.log("projectFileUri: ", projectFileUri);
        
        // 验证文件是否存在
        if (await checkProjectFileExist(curPath)) {
            // 获取项目文件的Uri
            let projectFileUri = Uri.joinPath(curPath, PROJECT_FILE_NAME);
            return [projectFileUri, true];
        } else {
            curPath = Uri.joinPath(curPath, subPath);
        }
    }

    return [curPath, false];
}

// 判断文件夹上级是否存在当前文件夹
// TODO: 此处的判断机制需要被重构
export async function checkProjectFileExistInParentDir(folderPath: Uri): 
        Promise<[boolean, Uri | undefined]>{
    // let parentDir = getRelativeUri(folderPath);
    let parentDir = Uri.joinPath(folderPath, PROJECT_FILE_NAME).fsPath;

    while(parentDir !== getRootUri().fsPath) {
        parentDir = path.dirname(parentDir);

        let parentDirUri = Uri.parse(parentDir);
        if(await checkProjectFileExist(parentDirUri)) {
            return [true, parentDirUri];
        }
    }

    return [false, undefined];
} 

// 生成项目文件路径
export function createProjectFile(folderPath: Uri): Uri {   
    let projectFileUri = Uri.joinPath(folderPath, PROJECT_FILE_NAME);
    let projectFile = new ProjectFile(projectFileUri);
    projectFile.save();

    return projectFileUri;
}