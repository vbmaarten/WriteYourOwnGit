import yargs from "yargs";
import path from "path";
import fs from "fs";
import ini from "ini";

yargs.scriptName("wyag")
  .command("init", false, () => { }, init)
  .help()
  .argv;

function repo_path(repo: GitRepository, git_path: string){
  return path.join(repo.gitdir, git_path);
}

function repo_dir(repo: GitRepository, git_path: string, mkdir: boolean = false): string{
  const dir = repo_path(repo, git_path);

  const dirStat = fs.statSync(dir);

  if(dirStat.isFile()){
    throw new Error(`Not a directory ${dir}`);
  }
  
  if(!dirStat.isDirectory()){
    if(!mkdir){
      throw new Error(`Not a directory ${dir}`);
    }
    
    fs.mkdirSync(dir);
  }

  return dir;
}

function repo_file(repo: GitRepository, git_path: string, mkdir: boolean = false){
  const split_path = git_path.split(path.sep);
  split_path.pop();

  return repo_dir(repo, split_path.join(path.sep), mkdir);
};

function repo_create(path: string){
  const repo = new GitRepository(path);
}

class GitRepository {
  public worktree: string;
  public gitdir: string;
  conf: {[key: string]: any}
  
  constructor(worktree_path: string, force: boolean = false){
    this.worktree = worktree_path;
    this.gitdir = path.join(this.worktree, '.git');

    if(force || !fs.statSync(this.gitdir).isDirectory()){
      throw new Error(`Directory ${this.gitdir} does not exist`);
    }

    const configFile = repo_file(this, "config");
    this.conf = ini.parse(fs.readFileSync(configFile).toString('utf-8'));
  }
}

function init() {
  console.log('test');
}
