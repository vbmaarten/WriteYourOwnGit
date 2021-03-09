import fs from "fs";
import ini from "ini";
import path from "path";
import { repo_file } from "./repoUtils";

export class GitRepository {
  public worktree: string;
  public gitdir: string;
  conf: {[key: string]: any} = {};
  
  constructor(worktree_path: string, force: boolean = false){
    this.worktree = worktree_path;
    this.gitdir = path.join(this.worktree, '.git');

    if (!force && fs.statSync(this.gitdir).isDirectory()){
      throw new Error(`Directory ${this.gitdir} does not exist`);
    }

    try {
      const configFile = repo_file(this, "config");
      this.conf = ini.parse(fs.readFileSync(configFile).toString());
    } catch {
      if(!force){
	throw new Error("Config file not found");
      }      
    }
  }
}
