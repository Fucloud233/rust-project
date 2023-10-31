import { Uri, window } from 'vscode';

import { getSettingsFile } from './info/settingsFile';
import { ProjectFile } from './info/projectFile';
import Crate from './info/Crate';

import { BaseError, ExistError } from './error';

export async function handleCreate(fileUri: Uri) {
    let settingsFile = getSettingsFile();
    // longest path matching
    let longestPath = settingsFile.getLongestMatchingPath(fileUri);
    
    try {
        // the rust-project exists
        if(longestPath === undefined) {
            let crate = new Crate(fileUri);
            settingsFile.appendCrateToProjectInfo(crate);
            settingsFile.save();
            return;
        } 

        let crate = new Crate(fileUri, longestPath);

        let projectFile = new ProjectFile(longestPath);
        await projectFile.load();
        projectFile.pushCrate(crate);
        projectFile.save();
        return;
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

export async function handleDelete(fileUri: Uri) {
    let settingsFile = getSettingsFile();
    // longest path matching
    let longestPath = settingsFile.getLongestMatchingPath(fileUri);
    
    if(longestPath === undefined) {
        settingsFile.removeCrateFromProjectInfo(fileUri);
        await settingsFile.save();
        return;
    }

    let projectFile = new ProjectFile(longestPath);
    await projectFile.load();
    projectFile.removeCrateWithUri(fileUri);
    projectFile.save();
}