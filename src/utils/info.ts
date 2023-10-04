import * as path from 'path';

export function relativeUriToCrateName(relativeUri: string): string {
    return  relativeUri.split(path.sep)
        .map((elem)=>elem.toLowerCase()).join("_").split(".")[0];
}