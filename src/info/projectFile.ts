import * as path from 'path';
import { Uri } from 'vscode';
import { checkFile, writeJsonFile, readJsonFile } from '../utils/fs';
import { ProjectInfo } from './projectInfo';
import Crate from './Crate';

// 项目配置文件名
export const PROJECT_FILE_NAME = "rust-project.json";

export class ProjectFile {
    fileUri: Uri;
    fileJson: any;    

    constructor(fileUri: Uri) {
        this.fileUri = fileUri;
    }

    // 初始化配置信息文件
    init(crate: Crate) {
        this.fileJson = new ProjectInfo([crate]);
    }

    async load() {
        try {
            if(await checkFile(this.fileUri)) {
                this.fileJson = await readJsonFile(this.fileUri);
            }
        } catch (error) {
            throw error;
        }
    }

    async save() {
        try {
            writeJsonFile(this.fileUri, this.fileJson);
        } catch(error) {
            throw error;
        }
    }

    appendCrate(crate: Crate) {
        this.fileJson["crates"].push(crate);
    }
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
        // 获取项目文件的Uri
        let projectFileUri = Uri.joinPath(curPath, PROJECT_FILE_NAME);

        // console.log("projectFileUri: ", projectFileUri);
        
        // 验证文件是否存在
        if(await checkFile(projectFileUri)) {
            return [projectFileUri, true];
        } else {
            curPath = Uri.joinPath(curPath, subPath);
        }
    }

    return [curPath, false];
}
