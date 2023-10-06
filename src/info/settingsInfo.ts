import { Uri } from 'vscode';
import { ProjectInfo } from "./projectInfo";
import { Type } from 'class-transformer';
import Crate from './Crate';

const FIELD_NAME = "rust-analyzer.linkedProjects";

export class SettingsInfo {
    @Type(() => ProjectInfo)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private "rust-analyzer.linkedProjects": (ProjectInfo| String) [] ;

    constructor() {
        this[FIELD_NAME] = [];
    }

    // 添加项目信息
    appendProjectInfo(projectInfo: ProjectInfo | Uri) {
        if(projectInfo instanceof Uri) {
            this[FIELD_NAME].push(projectInfo.fsPath);
        } else {
            this[FIELD_NAME].push(projectInfo);
        }
    }

    get firstProject(): ProjectInfo | undefined {
        // 如果读取为空 
        if(this.projects === undefined) {
            return undefined;
        }

        // [注意] 只能使用这种写法 否则编译器会认为存在String
        for(let project of this.projects) {
            if(project instanceof ProjectInfo) {
                return project;
            }
        }  
    }

    get firstProjectIndex(): number {
        return this.projects.findIndex((elem) => {
            return elem instanceof ProjectInfo;
        });
    }

    get cratesFromFirstProject(): Crate[] {
        let project = this.firstProject;
        if(project === undefined) {
            return [];
        }
        return project.crates;
    }

    private get projects(): (ProjectInfo | String)[] {
        return this[FIELD_NAME];
    }
}