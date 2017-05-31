import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'paragraph',
    level: EE.ToolLevel.Paragraph,
    buttonOptions: {
        name: 'paragraph',
        iconFA: 'fa-paragraph',
        text: '正文'
    }
})
export default class Paragraph extends Tool.BlockTool {
    selectors = ['p'];
    constructor(editor: Editor) {
        super(editor);
    }
}