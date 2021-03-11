import { GitRepository } from "./GitRepository";
import { repo_file } from "./repoUtils";
import {RawInflate, RawDeflate} from 'zlibt2';
import sha1 from 'sha1';

import fs from 'fs';

abstract class GitObject {
  public repo: GitRepository;
  public fmt: string ='';

  constructor(repo: GitRepository, data: string | undefined){
    this.repo = repo;

    if(data){
      this.deserialize(data);
    }
  }
  
  abstract serialize(): string;
  abstract deserialize(data: string): void;
}

enum ObjectType {
  COMMIT = 'commit',
  TREE = 'tree',
  TAG = 'tag',
  BLOB = 'blob'
}

export function object_read(repo: GitRepository, sha: string): GitObject {
  const path = repo_file(repo, `objects/${sha.slice(0,2)}/${sha.slice(2, sha.length)}`);
  
  const fileContent = fs.readFileSync(path);
  const decompressed = new RawInflate(fileContent).decompress().toString();

  let split = decompressed.split(' ')
  const fmt = split.shift()

  split = split.join().split("\x00");
  
  const size = parseInt(split.shift()!);

  const content = split.join();

  if(content.length !== size){
    throw new Error(`Malformed object ${sha}: bad length`);
  }

  if (fmt == 'blob') {
    return new GitBlob(repo, content);
  }

  throw new Error('Unrecognized fmt');
}

class GitBlob extends GitObject {
  fmt = "blob";
  public blobdata: string = '';

  serialize(){
    return this.blobdata;
  }

  deserialize(data: string){
    this.blobdata = data;
  }
}

const object_write = (obj: GitObject, actuallyWrite: boolean = true) => {
  const data = obj.serialize();

  //Add header
  const result = obj.fmt + ' ' + data.length.toString() + '\x00' + data;
  const sha = sha1(result);
  if (actuallyWrite) {
    const path = repo_file(obj.repo, `objects/${sha.substr(0,2)}/${sha.substr(2, sha.length)}`, actuallyWrite);

    fs.writeFileSync(path, new RawDeflate(Buffer.from(result)).compress().toString());
  }  
}

export function object_find(repo: GitRepository, name: string, fmt:undefined=undefined, follow:boolean=true){
  return name;
}
