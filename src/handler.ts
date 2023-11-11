import { Uri, window } from 'vscode';

import { getSettingsFile } from './info/settingsFile';
import { ProjectFile } from './info/projectFile';
import Crate from './info/Crate';

import { handleError, ExistError } from './error';

export async function handleCreate(fileUri: Uri) {
    try {
        let settingsFile = getSettingsFile();
        // longest path matching
        let longestPath = settingsFile.getLongestMatchingPath(fileUri);

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
    } catch(error) {
        if(error instanceof ExistError) {
            window.showWarningMessage(error.message + " And it will be covered.");
            getSettingsFile().save();
        }

        // TODO: when settingsFile is not loaded, you can cancel it
        
        handleError(error);
    }
}

export async function handleDelete(fileUri: Uri) {
    try {
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
    } catch(error) {
        handleError(error);
    }
}