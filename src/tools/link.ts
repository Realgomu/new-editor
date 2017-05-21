import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'link',
    type: EE.ToolType.Link
})
export default class Link extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['a'];
    action = 'link';

    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
    }

    undo() {

    }
}