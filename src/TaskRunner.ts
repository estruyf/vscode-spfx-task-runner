import * as vscode from 'vscode';
import { TASKRUNNER_TYPE, TASKRUNNER_RELEASE, TASKRUNNER_DEBUG } from '.';

export class TaskRunner {

  /**
   * Lists all the available gulp tasks
   */
  public static async list() {
    const tasks = await vscode.tasks.fetchTasks({ type: "gulp" });
    if (tasks && tasks.length > 0) {
      const names = tasks.map(t => `<li>gulp ${t.name}</li>`);
      const panel = vscode.window.createWebviewPanel('gulpTasks', "Available gulp tasks", vscode.ViewColumn.One, { });
      panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Available gulp tasks</title>
          <style>li { padding: 2px 0; }</style>
        </head>
        <body>
          <h2>The following gulp task are available:</h2>
          <ul>
            ${names.join('')}
          <ul>
        </body>
        </html>
      `;
    } else {
      vscode.window.showWarningMessage(`No gulp tasks found.`);
    }
  }

  /**
   * Create the SPFx solution
   * 
   * @param release 
   */
  public static async packaging(release: boolean = false) {
    // Get all the SPFx tasks
    const tasks = await vscode.tasks.fetchTasks({ type: TASKRUNNER_TYPE });
    // Get the type of task to execute
    const taskType = release ? TASKRUNNER_RELEASE : TASKRUNNER_DEBUG;
    // Retrieve the right build an packaging tasks
    const buildTask = tasks.find(t => t.name === `${taskType} bundle`);
    const pkgTask = tasks.find(t => t.name === `${taskType} packaging`);
    // Check if the tasks were retrieved
    if (buildTask && pkgTask) {
      vscode.window.showInformationMessage(`Creating ${taskType} solution package`);
      
      // Check when bundling completed and run the package-solution task
      vscode.tasks.onDidEndTask(async (e) => {
        if (e.execution.task.name === `${taskType} bundle`) {
          if (pkgTask) {
            // Execute the packaging task
            await vscode.tasks.executeTask(pkgTask);
          }
        }
      });

      try {
        // Execute the bundle task
        await vscode.tasks.executeTask(buildTask); 
      } catch (error) {
        if (error.stack) {
          vscode.window.showErrorMessage(error.stack);
        }
      }           
    } else {
      vscode.window.showErrorMessage(`No SPFx tasks found.`);
    }
  }

  /**
   * Start local dev server for SPFx
   */
  public static async serve() {
    const tasks = await vscode.tasks.fetchTasks({ type: TASKRUNNER_TYPE });
    let serveTask = tasks.find(t => t.name === `serve`);
    if (serveTask) {
      vscode.window.showInformationMessage(`Starting serving the local server`);
      
      try {
        await vscode.tasks.executeTask(serveTask); 
      } catch (error) {
        if (error.stack) {
          vscode.window.showErrorMessage(error.stack);
        }
      }           
    }
  }

  /**
   * Show task options
   */
  public static async showOptions() {
    // Get all gulp tasks
    const tasks = await vscode.tasks.fetchTasks({ type: "gulp" });
    // Let the dev choose the task to run
    const pickedTask = await vscode.window.showQuickPick(tasks.map(t => t.name), { canPickMany: false, placeHolder: "Pick the task to run"});
    // Check if a task was picked
    if (pickedTask) {
      vscode.window.showInformationMessage(`Starting the ${pickedTask} task`);
      try {
        const task = tasks.find(t => t.name === pickedTask);
        if (task) {
          await vscode.tasks.executeTask(task);
        } else {
          vscode.window.showErrorMessage(`Didn't find the selected task...`);
        }
      } catch (error) {
        if (error.stack) {
          vscode.window.showErrorMessage(error.stack);
        }
      }  
    }
  }
}