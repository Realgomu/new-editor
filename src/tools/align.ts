import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'align',
    type: EE.ToolType.Align,
})
export default class Align implements EE.IEditorTool {
    readonly token: string;
    readonly type: EE.ToolType;
    constructor(private editor: Editor) {
    }

    apply() {

    }
}