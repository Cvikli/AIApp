export const defineMonacoTheme = (monaco) => {
  monaco.editor.defineTheme('one-monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'A9B7C6', background: '2B2B2B' },
      { token: 'comment', foreground: '676f7d', fontStyle: 'italic' },
      { token: 'string', foreground: 'e5c07b' },
      { token: 'number', foreground: 'c678dd' },
      { token: 'constant.numeric', foreground: 'c678dd' },
      { token: 'constant.language', foreground: '56b6c2' },
      { token: 'constant.character', foreground: '56b6c2' },
      { token: 'constant.other', foreground: '56b6c2' },
      { token: 'variable', foreground: 'cc7832' },
      { token: 'variable.language', foreground: 'cc7832' },
      { token: 'variable.other', foreground: 'abb2bf' },
      { token: 'keyword', foreground: 'cc7832', fontStyle: 'bold' },
      { token: 'storage', foreground: 'cc7832', fontStyle: 'bold' },
      { token: 'storage.type', foreground: '56b6c2', fontStyle: 'bold italic' },
      { token: 'entity.name.class', foreground: '61afef', fontStyle: 'bold' },
      { token: 'entity.name.function', foreground: '98c379', fontStyle: 'bold' },
      { token: 'support.function', foreground: '98c379', fontStyle: 'bold' },
      { token: 'support.constant', foreground: '56b6c2' },
      { token: 'support.type', foreground: '56b6c2' },
      { token: 'support.class', foreground: '61afef', fontStyle: 'bold' },
      { token: 'support.other.variable', foreground: 'abb2bf' },
      { token: 'invalid', foreground: 'f8f8f0', background: 'c678dd' },
      { token: 'invalid.deprecated', foreground: 'f8f8f0', background: '56b6c2' },
      { token: 'meta.function-call', foreground: 'abb2bf' },
      { token: 'delimiter.bracket', foreground: 'd19a66', fontStyle: 'bold' },
      { token: 'delimiter.parenthesis', foreground: 'd19a66', fontStyle: 'bold' },
      { token: 'delimiter.square', foreground: 'd19a66', fontStyle: 'bold' },
      { token: 'delimiter.curly', foreground: 'd19a66', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': '#2B2B2B',
      'editor.foreground': '#A9B7C6',
      'editor.lineHighlightBackground': '#383E4A',
      'editor.selectionBackground': '#3E4451',
      'editor.findMatchBackground': '#42557B',
      'editor.findMatchHighlightBackground': '#314365',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#484a50',
      'editorIndentGuide.background': '#3B4048',
      'editorLineNumber.foreground': '#495162',
      'editorHoverWidget.background': '#21252B',
      'editorHoverWidget.border': '#181A1F',
      'editorSuggestWidget.background': '#21252B',
      'editorSuggestWidget.border': '#181A1F',
      'editorSuggestWidget.selectedBackground': '#2c313a',
      'input.background': '#1d1f23',
      'scrollbarSlider.background': '#4E566680',
      'scrollbarSlider.hoverBackground': '#5A637580',
      'scrollbarSlider.activeBackground': '#747D9180',
      'statusBar.background': '#21252B',
      'statusBar.foreground': '#9da5b4',
      'statusBarItem.hoverBackground': '#2c313a',
      'sideBar.background': '#21252b',
      'sideBarSectionHeader.background': '#282c34',
      'list.activeSelectionBackground': '#2c313a',
      'list.activeSelectionForeground': '#d7dae0',
      'list.focusBackground': '#383E4A',
      'list.hoverBackground': '#292d35',
      'notificationCenter.border': '#181A1F',
      'notificationCenterHeader.foreground': '#abb2bf',
      'notificationCenterHeader.background': '#21252b',
      'notifications.foreground': '#abb2bf',
      'notifications.background': '#21252b',
      'notifications.border': '#181A1F',
    }
  });
};
