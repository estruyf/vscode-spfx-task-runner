import * as vscode from 'vscode';
import { GulpPaths } from './models/GulpPaths';

export const TASKRUNNER_TYPE = "SPFx";
export const TASKRUNNER_DEBUG = "debug";
export const TASKRUNNER_RELEASE = "release";

export class SPFxTaskProvider {

  /**
   * Retrieves the gulp path
   */
  public static async gulpPath(): Promise<GulpPaths | null> {
    // Retrieve the gulp command from the existing commands
    const tasks = await vscode.tasks.fetchTasks({ type: "gulp" });
    if (tasks && tasks.length > 0) {
      const firstTask = tasks[0];
      if (firstTask && firstTask.execution && (firstTask.execution as any)["commandLine"]) {
        // Get the gulp path from the task command line property
        let cmdLine: string = (firstTask.execution as any)["commandLine"];
        let folderPath: string = "";
        // Check if extension is loaded in a workspace
        if (firstTask.execution.options && (firstTask.execution.options as any)["cwd"]) {
          folderPath = (firstTask.execution.options as any)["cwd"];
        }
        // Return the gulp execution path
        if (cmdLine) {
          return {
            executePath: cmdLine.split(" ")[0],
            folderPath
          };
        }
      }
    }
    return null;
  }

  /**
   * Returns the task provider registration
   */
  public static get(gulpCmd: GulpPaths | null): vscode.Task[] {
    let gulpCommand = gulpCmd && gulpCmd.executePath ? gulpCmd.executePath : "gulp";
    let rootFolder = gulpCmd && gulpCmd.folderPath ? gulpCmd.folderPath : vscode.workspace.rootPath;
    
    // Escape the command path on Windows
    if (process && process.platform && process.platform.toLowerCase() === "windows") {
      gulpCommand = gulpCommand && gulpCommand.includes("(") ? gulpCommand.replace(/\(/g, "`(") : gulpCommand;
      gulpCommand = gulpCommand && gulpCommand.includes(")") ? gulpCommand.replace(/\)/g, "`)") : gulpCommand;
      rootFolder = rootFolder && rootFolder.includes("(") ? rootFolder.replace(/\(/g, "`(") : rootFolder;
      rootFolder = rootFolder && rootFolder.includes(")") ? rootFolder.replace(/\)/g, "`)") : rootFolder;
    }

    // Retrieve all the workspace folders, and match based on the retrieved command path folder
    const folders: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
    let taskScope: vscode.TaskScope.Workspace | vscode.WorkspaceFolder = vscode.TaskScope.Workspace;
    if (folders && folders.length > 0) {
      const crntFolder = folders.find(f => f.uri.path === rootFolder);
      if (crntFolder) {
        taskScope = crntFolder;
      }
    }

    // Register the tasks
    return [
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `clean` 
      }, taskScope, `clean`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} clean`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_DEBUG} bundle` 
      }, taskScope, `${TASKRUNNER_DEBUG} bundle`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} bundle`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_DEBUG} packaging` 
      }, taskScope, `${TASKRUNNER_DEBUG} packaging`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} package-solution`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_RELEASE} bundle` 
      }, taskScope, `${TASKRUNNER_RELEASE} bundle`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} bundle --ship`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_RELEASE} packaging`
      }, taskScope, `${TASKRUNNER_RELEASE} packaging`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} package-solution --ship`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: "serve" 
      }, taskScope, "serve", TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} serve --nobrowser`))
    ];
  }
}