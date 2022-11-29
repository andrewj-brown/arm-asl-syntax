'use strict';

import path = require('path');
import vscode = require('vscode');
import {
    CancellationToken,
    DefinitionRequest,
    Disposable,
    DocumentSelector,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let selector: DocumentSelector = [{
    language: 'arm-asl'
}]

let provider: vscode.DefinitionProvider = {
    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: CancellationToken): vscode.ProviderResult<vscode.Definition> {
        let file: vscode.Uri = vscode.Uri.file("foo");
        let pos: vscode.Position = new vscode.Position(0, 0);

        return (new vscode.Location(file, pos) as vscode.Definition)
    }
}

let client: LanguageClient;
let defDisposer: Disposable;

export function activate(context: vscode.ExtensionContext) {
    console.log("Activating arm-asl client");
    
	const serverModule = context.asAbsolutePath(
		path.join('server', '_build', 'default', 'bin', 'main.exe')
	);

	// exec the server using dune
	const serverOptions: ServerOptions = {
        command: "dune",
        args: ["exec", "--action-stdout-on-success=swallow", "--action-stderr-on-success=must-be-empty", serverModule],
        transport: TransportKind.stdio
    }

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'arm-asl' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'arm-asl-client',
		'ARMv8 ASL Language Client',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

    defDisposer = vscode.languages.registerDefinitionProvider(selector, provider);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
    if (defDisposer) {
        defDisposer.dispose();
    }
       
    return client.stop();
}