'use strict';
import * as vscode from 'vscode';
import { TaskRunner } from './TaskRunner';
import { SPFxTaskProvider } from '.';

let taskProvider: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Retrieve the gulp path and register the task provider
  SPFxTaskProvider.gulpPath().then(gulpCmd => {
    // Register the SPFx task provider
    taskProvider = vscode.workspace.registerTaskProvider('spfx', {
      provideTasks: () => {
        return SPFxTaskProvider.get(gulpCmd);
      },
      resolveTask(_task: vscode.Task): vscode.Task | undefined {
        return undefined;
      }
    });
    // Log that the extension is active
    console.log('SPFx Task Runner is now active!');
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
    taskList,
    pkgDebug,
    pkgRelease,
    serve,
    pickTask
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (taskProvider) {
    taskProvider.dispose();
  }
}