import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IQuote extends EE.IBlock {
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

    // readData(el: Element): IQuote {
    //     let block = this.$readDate(el as HTMLElement) as IQuote;
    //     block.text = '';
    //     return block;
    // }

    apply(merge: boolean) {
        let activeList = this.editor.cursor.activeTokens();
        let cursor = this.editor.cursor.current();
        if (merge) {
            let quote: IQuote = {
                rowid: Util.RandomID(),
                token: this.token,
                text: '',
                inlines: {},
                // data: []
            };
            let el = this.render(quote);
            let insertEl: Element;
            this.editor.cursor.eachRow((block) => {
                // quote.data.push(block.rowid);
                let child = this.editor.findBlockElement(block.rowid);
                if (!block.pid) {
                    insertEl = child.nextElementSibling;
                }
                el.appendChild(child);
            });
            this.editor.insertBlock(el, insertEl, true);
            this.editor.cursor.restore();
            this.editor.actions.doInput();
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
                    this.editor.actions.doInput();
                }
            }
        }
    }
}