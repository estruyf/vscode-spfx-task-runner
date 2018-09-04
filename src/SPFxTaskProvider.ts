import * as vscode from 'vscode';

export const TASKRUNNER_TYPE = "SPFx";
export const TASKRUNNER_DEBUG = "debug";
export const TASKRUNNER_RELEASE = "release";

export class SPFxTaskProvider {

  /**
   * Retrieves the gulp path
   */
  public static async gulpPath(): Promise<string | null> {
    // Retrieve the gulp command from the existing commands
    const tasks = await vscode.tasks.fetchTasks({ type: "gulp" });
    if (tasks && tasks.length > 0) {
      const firstTask = tasks[0];
      if (firstTask && firstTask.execution && (firstTask.execution as any)["commandLine"]) {
        // Get the gulp path from the task command line property
        const cmdLine = (firstTask.execution as any)["commandLine"];
        if (cmdLine) {
          return cmdLine.split(" ")[0];
        }
      }
    }
    return null;
  }

  /**
   * Returns the task provider registration
   */
  public static get(gulpCmd: string | null): vscode.Task[] {
    let gulpCommand = gulpCmd || "gulp";

    // Register the tasks
    return [
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `clean` 
      }, `clean`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} clean`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_DEBUG} bundle` 
      }, `${TASKRUNNER_DEBUG} bundle`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} bundle`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_DEBUG} packaging` 
      }, `${TASKRUNNER_DEBUG} packaging`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} package-solution`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_RELEASE} bundle` 
      }, `${TASKRUNNER_RELEASE} bundle`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} bundle --ship`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: `${TASKRUNNER_RELEASE} packaging` 
      }, `${TASKRUNNER_RELEASE} packaging`, TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} package-solution --ship`)),
      new vscode.Task({ 
        type: TASKRUNNER_TYPE, 
        task: "serve" 
      }, "serve", TASKRUNNER_TYPE, new vscode.ShellExecution(`${gulpCommand} serve --nobrowser`))
    ];
  }
}