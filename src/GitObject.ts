import { GitRepository } from "./GitRepository";
import { repo_file } from "./repoUtils";
import {RawInflate} from 'zlibt2';

import fs from 'fs';

abstract class GitObject<T> {
  protected repo: GitRepository | undefined = undefined;

  abstract serialize(): T;
}

enum ObjectType {
  COMMIT = 'commit',
  TREE = 'tree',
  TAG = 'tag',
  BLOB = 'blob'
}

export function object_read(repo: GitRepository, sha: string){
  const path = repo_file(repo, `objects/${sha.slice(0,2)}/${sha.slice(2, sha.length)}`);
  
  const fileContent = fs.readFileSync(path);
  const decompressed = new RawInflate(fileContent).decompress().toString();

  let split = decompressed.split(' ')
  const objectType = split.shift()

  split = split.join().split("\x00");
  
  const size = parseInt(split.shift()!);

  const content = split.join();

  if(content.length !== size){
    throw new Error(`Malformed object ${sha}: bad length`);
  }
}

export function object_find(repo: GitRepository, name: string, fmt:undefined=undefined, follow:boolean=true){
  return name;
}
