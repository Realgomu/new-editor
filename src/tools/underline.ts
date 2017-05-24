import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'underline',
    type: EE.ToolType.Underline
})
export default class Underline extends Tool.InlineTool {
    selectors = ['u'];
    action = 'underline';
    useDocCommand = true;
    
    constructor(editor: Editor) {
        super(editor);
    }
}