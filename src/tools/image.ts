import * as Core from 'core/editor';
import * as Util from 'core/util';

@Core.EditorTool({
    token: 'image',
    level: EE.ToolLevel.Image,
    blockType: EE.BlockType.Close,
})
export default class Iamge extends Core.BlockTool {
    selectors = ['div.image'];
    constructor(editor: Core.Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'image',
            token: 'image',
            iconFA: 'fa-file-image-o',
            text: '图片',
            click: () => {
            },
            checkDisabled: () => {
                return true;
            }
        });
    }
} 