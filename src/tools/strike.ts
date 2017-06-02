import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'strike',
    level: EE.ToolLevel.StrikeThrough,
})
export default class Strike extends Tool.InlineTool {
    selectors = ['s'];
    action = 'strikethrough';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'strike',
            token: 'strike',
            iconFA: 'fa-strikethrough',
            text: '划线'
        })
    }
}