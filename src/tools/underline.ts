import * as Tool from '../core/tool';

@Tool.EditorTool('underline')
export default class Underline extends Tool.InlineTool {
    tagNames = ['u'];
    action = 'underline';
    useDocCommand = true;
    
    constructor() {
        super(EE.ToolType.Underline);
    }
}