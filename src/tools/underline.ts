import * as Tool from 'core/tools';

@Tool.EditorTool({
    token: 'underline',
    type: EE.ToolType.Underline
})
export default class Underline extends Tool.InlineTool {
    selectors = ['u'];
    action = 'underline';
    useDocCommand = true;
    
    constructor(editor: EE.IEditor) {
        super(editor);
    }
}