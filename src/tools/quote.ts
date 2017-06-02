import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IQuote extends EE.IBlock {
    data: string[];
}

@Tool.EditorTool({
    token: 'quote',
    level: EE.ToolLevel.Quote,
    blockType: EE.BlockType.Root,
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

    readData(el: Element): EE.IBlock {
        let block = this.$readDate(el as HTMLElement);
        block.text = '';
        block.data = [];
        Util.NodeListForEach(el.children, (node: Element) => {
            let childId = node.getAttribute('data-row-id');
            if (!childId) {
                childId = Util.RandomID();
                node.setAttribute('data-row-id', childId);
            }
            block.data.push(childId);
        });
        return block;
    }

    render(block: IQuote) {
        let el = this.$render(block);
        if (block.data && block.data.length > 0) {
            block.data.forEach(id => {
                let child = this.editor.findBlockData(id);
                let tool = this.editor.tools.matchToken(child.token) as Tool.BlockTool;
                if (tool && child.pid === block.rowid) {
                    el.appendChild(tool.render(child));
                }
            });
        }
        return el;
    }

    apply(merge: boolean) {
        let activeList = this.editor.cursor.activeTokens();
        let cursor = this.editor.cursor.current();
        if (merge) {
            // let quote: IQuote = {
            //     rowid: Util.RandomID(),
            //     token: this.token,
            //     text: '',
            //     inlines: {},
            //     data: []
            // };
            // let el = this.render(quote);
            // this.editor.cursor.eachRow((block) => {
            //     quote.data.push(block.rowid);
            //     let child = this.editor.findBlockElement(block.rowid);
            //     el.appendChild(child);
            // });
            // this.editor.insertBlock(el, , true);
            // this.editor.cursor.restore();
            // this.editor.actions.doInput(null);
        }
        else {
            let obj = activeList.find(a => a.token === this.token);
            if (obj) {
                let quote = obj.el;
                let rowid = quote.getAttribute('data-row-id');
                let block = this.editor.findBlockData(rowid);
                if (block) {
                    while (quote.firstElementChild) {
                        let el = quote.firstElementChild;
                        this.editor.rootEl.insertBefore(el, quote);
                    }
                    quote.remove();
                    this.editor.cursor.restore();
                    this.editor.actions.doInput(null);
                }
            }
        }
    }
}