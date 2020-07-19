import * as vscode from "vscode";

const extensionName = "tomblind.scm-buttons-vscode";
const commandPrefix = "scm-buttons.";

interface CommandEntry {
    command: string;
}

interface PackageJson {
    contributes: {
        commands: CommandEntry[];
    };
}

function isCommandEntry(obj: unknown): obj is CommandEntry {
    return typeof(obj) === "object" && obj !== null && typeof((obj as CommandEntry).command) === "string";
}

function isPackageJson(obj: unknown): obj is PackageJson {
    if (typeof(obj) !== "object" || obj === null) {
        return false;
    }
    const packageJson = obj as PackageJson;
    if (typeof(packageJson.contributes) !== "object" || packageJson.contributes === null) {
        return false;
    }
    return Array.isArray(packageJson.contributes.commands) && packageJson.contributes.commands.every(isCommandEntry);
}

export function activate(context: vscode.ExtensionContext) {
    const extension = vscode.extensions.getExtension(extensionName);
    if (extension === undefined) {
        vscode.window.showErrorMessage(`Failed to find extension ${extensionName}!?`);
        return;
    }

    if (!isPackageJson(extension.packageJSON)) {
        vscode.window.showErrorMessage(`Failed to read extension ${extensionName}'s package.json!?`);
        return;
    }

    for (const commandEntry of extension.packageJSON.contributes.commands) {
        if (commandEntry.command.startsWith(commandPrefix)) {
            const vscodeCommand = commandEntry.command.substr(commandPrefix.length);
            const commandFunction = () => {
                vscode.commands.executeCommand(vscodeCommand);
            };
            context.subscriptions.push(vscode.commands.registerCommand(commandEntry.command, commandFunction));
        }
    }
}

export function deactivate() {
}
