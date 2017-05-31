import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IQuote extends EE.IBlock {
    data: string[];
}

@Tool.EditorTool({
    token: 'quote',
    level: EE.ToolLevel.Quote,
})
export default class Quote extends Tool.BlockTool {
    selectors = ['blockquote'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'blockquote',
            token: 'quote',
            iconFA: 'fa-quote-left',
            text: '引用'
        });
    }

    readData(el: Element, list?: EE.IBlock[]): EE.IBlock {
        let block = this.$getDate(el as HTMLElement);
        block.text = '';
        block.data = [];
        if (list) list.push(block);
        Util.NodeListForEach(el.children, (node: Element) => {
            let tool = this.editor.tools.matchBlockTool(node);
            if (tool) {
                let child = tool.readData(node, list);
                child.pid = block.rowid;
                block.data.push(child.rowid);
            }
        });
        return block;
    }

    render(block: IQuote) {
        let el = this.$render(block);
        if (block.data && block.data.length > 0) {
            block.data.forEach(id => {
                let child = this.editor.findRowData(id);
                let tool = this.editor.tools.matchToken(child.token) as Tool.BlockTool;
                if (tool && child.pid === block.rowid) {
                    el.appendChild(tool.render(child));
                }
            });
        }
        return el;
    }

    apply(merge: boolean) {
        let cursor = this.editor.cursor.current();
        if (merge) {

        }
    }
}