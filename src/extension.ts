import * as vscode from 'vscode';

function cleanHtmlInPhp(editor: vscode.TextEditor | undefined): void {
  if (!editor || (editor.document.languageId !== 'php' && editor.document.languageId !== 'html')) {
    vscode.window.showErrorMessage('Please open a PHP or HTML file.');
    return;
  }

  const document = editor.document;
  const fullRange = new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
  const cleanedText = minifyHtml(document.getText(fullRange));
  editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, cleanedText);
  });
  //editor.document.save();
  
}

function minifyHtml(html: string): string {
  let insideHtmlTag = false;
  let insideComment = false;
  let insidePhpTag = false;
  let minifiedHtml = '';

  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    const nextChar = html[i + 1];

    if (char === '<' && nextChar === '?') {
      insidePhpTag = true;
      minifiedHtml += char + nextChar;
      i++; // Skip the next character
      continue;
    } else if (char === '?' && nextChar === '>') {
      insidePhpTag = false;
      minifiedHtml += char + nextChar;
      i++; // Skip the next character
      continue;
    }

    if (! insidePhpTag){
      if(char === '\n' || char === '\r' || char === '\t' ||  (char === ' ' && nextChar === ' ')){
        continue;// Skip
      }
    }
    
    minifiedHtml += char;

  }

  return minifiedHtml.replace(/\s*<!\-\-.*?\-\->/g, '');
}

export function activate(context: vscode.ExtensionContext): void {
  let disposable = vscode.commands.registerCommand('minify-html-in-php.MinifyHtmlInPhp', () => {
    const editor = vscode.window.activeTextEditor;
    cleanHtmlInPhp(editor);
  });

  context.subscriptions.push(disposable);
}