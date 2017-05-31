import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'br',
    level: EE.ToolLevel.Br
})
export default class Break extends Tool.InlineTool {
    selectors = ['br'];
    action = 'br';

    constructor(editor: Editor) {
        super(editor);
    }
}