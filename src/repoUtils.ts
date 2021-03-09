import fs from 'fs';
import ini from "ini";
import path from 'path';
import { GitRepository } from './GitRepository';


export function repo_path(repo: GitRepository, git_path: string){
  return path.join(repo.gitdir, git_path);
}

export function repo_dir(repo: GitRepository, git_path: string, mkdir: boolean = false): string{
  const dir = repo_path(repo, git_path);

  try {
    const dirStat = fs.statSync(dir);
    if(dirStat.isFile()){
      throw new Error(`Not a directory ${dir}`);
    }
  } catch {
    if(!mkdir){
      throw new Error("Does not exist");
    }

    fs.mkdirSync(dir, {recursive: true});
  }

  return dir;
}

export function repo_file(repo: GitRepository, git_path: string, mkdir: boolean = false){
  const split_path = git_path.split(path.sep);
  split_path.pop();

  repo_dir(repo, split_path.join(path.sep), mkdir);

  return repo_path(repo, git_path);
};

export function repo_default_config(){
  return ini.encode({core: {repositoryformatversion: "0", filemode:false, bare: false}}).toString();
}

export function repo_find(git_path: string = ".", required: boolean = true): GitRepository | undefined {
  const real_path = path.resolve(git_path);

  const dirStat = fs.statSync(real_path);

  if(dirStat.isDirectory()){
    return new GitRepository(real_path);
  }

  const parent = path.resolve(real_path + path.sep + '..');

  if (real_path === parent) {
    if(required){
      throw new Error('No git directory');    
}

    return undefined;
  }

  return repo_find(parent, required);
}

export function repo_create(path: string){
  const repo = new GitRepository(path, true);

  const workdirStat = fs.statSync(repo.worktree);

  
  if(!workdirStat.isDirectory()){
    throw new Error(`${repo.worktree} is not a directory`);
  }
  
  if(fs.readdirSync(repo.worktree).length > 0){
    throw new Error(`${repo.worktree} is not empty`); 
  }

  repo_dir(repo, "branches", true);
  repo_dir(repo, "objects", true);
  repo_dir(repo, "refs/tags", true);
  repo_dir(repo, "refs/heads", true);

  fs.writeFileSync(repo_file(repo, "description"), "Unnamed repository; edit this file 'description' to name the repository.\n");
  fs.writeFileSync(repo_file(repo, "HEAD"), "ref: refs/heads/master\n");

  fs.writeFileSync(repo_file(repo, "config"), repo_default_config());

  return repo;
}
