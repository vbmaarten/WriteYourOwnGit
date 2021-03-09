import yargs from "yargs";
import { repo_create } from "./repoUtils";

yargs.scriptName("wyag")
	.command("init [path]", "Init git repository", (yargs) => {
		yargs.positional('path', {
			describe: 'directory to initialize repository in'
			, default: '.'
		})
	}, init)
	.help()
	.argv;


function init(args: { path: string }) {
	repo_create(args.path);
}
