'use strict';
import * as vscode from 'vscode';
import { TaskRunner } from './TaskRunner';
import { SPFxTaskProvider, TASKRUNNER_TYPE } from '.';
import { GulpPaths } from './models/GulpPaths';

let taskProvider: vscode.Disposable | undefined;

export async function activate(context: vscode.ExtensionContext) {
  let spfxFncs: vscode.Task[] | undefined = undefined;

  // Retrieve the gulp path and register the task provider
  const gulpPaths: GulpPaths | null = await SPFxTaskProvider.gulpPath();

  // Register the SPFx task provider
  taskProvider = vscode.workspace.registerTaskProvider(TASKRUNNER_TYPE, {
    provideTasks: () => {
      if (!spfxFncs) {
        spfxFncs = SPFxTaskProvider.get(gulpPaths);
      }
      return spfxFncs;
    },
    resolveTask(task: vscode.Task): vscode.Task | undefined {
      return task;
    }
  });
  
  // List all available gulp tasks
  let taskList = vscode.commands.registerCommand('spfxTaskRunner.list', async () => {
    await TaskRunner.list();
  });
  
  // Create the debug package
  let pkgDebug = vscode.commands.registerCommand('spfxTaskRunner.pkgDebug', async () => {
    await TaskRunner.packaging();
  });
  
  // Create the release package
  let pkgRelease = vscode.commands.registerCommand('spfxTaskRunner.pkgRelease', async () => {
    await TaskRunner.packaging(true);
  });
  
  // Start serving the local server
  let serve = vscode.commands.registerCommand('spfxTaskRunner.serve', async () => {
    await TaskRunner.serve();
  });

  // Start serving the local server
  let pickTask = vscode.commands.registerCommand('spfxTaskRunner.pickTask', async () => {
    await TaskRunner.showOptions();
  });
  
  // Fix to only show the menu actions when the extension activation conditions were met
  vscode.commands.executeCommand('setContext', 'spfxProjectCheck', true);
  
  // Register all actions
  context.subscriptions.push(
    taskProvider,
    taskList,
    pkgDebug,
    pkgRelease,
    serve,
    pickTask
  );
  
  // Log that the extension is active
  console.log('SPFx Task Runner is now active!');
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (taskProvider) {
    taskProvider.dispose();
  }
}