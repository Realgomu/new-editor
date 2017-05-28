import * as Tool from './tools';
import * as Util from './util';
import * as Selection from 'core/cursor';
import { Editor } from './editor';

export abstract class BlockTool implements EE.IBlockTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract selectors: string[];

    constructor(protected editor: Editor) {
    }

    getInlines(el: Element): EE.InlineMap {
        let map: EE.InlineMap = {};
        let pos = 0;
        let last: { [token: string]: EE.IInline } = {};
        Util.TreeWalker(
            this.editor.ownerDoc,
            el,
            (current) => {
                let lenght = current.textContent.length;
                if (current.nodeType === 1) {
                    let tool = this.editor.tools.matchInlineTool(<Element>current);
                    if (tool) {
                        if (!map[tool.token]) map[tool.token] = [];
                        let inline = tool.getDataFromEl(<Element>current, pos);
                        if (last[tool.token] && inline.start === last[tool.token].end) {
                            //检查是否可以合并
                            last[tool.token].end = inline.end;
                        }
                        else {
                            map[tool.token].push(inline);
                            last[tool.token] = inline;
                        }
                    }
                }
                else if (current.nodeType === 3) {
                    pos += lenght;
                }
            });
        return map;
    }

    protected $getDate(el: Element): EE.IBlock {
        let id = el.getAttribute('data-row-id');
        let block: EE.IBlock = {
            rowid: id || Util.RandomID(),
            token: this.token,
            type: this.type,
            text: el.textContent,
            inlines: this.getInlines(el)
        }
        return block;
    }

    getData(el: Element): EE.IBlock {
        return this.$getDate(el);
    }

    protected $apply(tag: string) {
        this.editor.cursor.eachRow((block, start, end) => {
            let old = this.editor.getRowElement(block.rowid);
            if (old.tagName.toLowerCase() !== tag) {
                let newNode = this.editor.ownerDoc.createElement(tag);
                newNode.setAttribute('data-row-id', block.rowid);
                newNode.innerHTML = old.innerHTML;
                old.parentElement.replaceChild(newNode, old);
                this.editor.cursor.restore();
            }
        });
    }

    apply() {
        this.$apply(this.selectors[0]);
    }

    protected $changeBlock(tag: string = this.selectors[0]) {
        let cursor = this.editor.cursor.current();
        if (cursor) {
            // let old = this.editor.ownerDoc.querySelector(`[data-row-id="${cursor.rowid}"]`);
            // if (old.tagName.toLowerCase() !== tag) {
            //     let rowid = old.getAttribute('data-row-id');
            //     let newNode = this.editor.ownerDoc.createElement(tag);
            //     newNode.setAttribute('data-row-id', rowid);
            //     newNode.innerHTML = old.innerHTML;
            //     old.parentElement.replaceChild(newNode, old);
            //     this.editor.selection.restore(newNode);
            // }
        }
    }

    protected $renderInlines(el: HTMLElement, map: EE.InlineMap) {
        //inline 数据按照优先级从高到底进行插入
        this.editor.tools.getInlineTools().forEach(tool => {
            let list = map[tool.token];
            if (list) {
                list.forEach(item => {
                    Util.InsertRenderTree(this.editor.ownerDoc, el, tool.render(item));
                })
            }
        });
    }

    render(block: EE.IBlock) {
        let end = block.text.length;
        let root = Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: this.selectors[0],
            start: 0,
            end: block.text.length,
            content: block.text,
            attr: {
                'data-row-id': block.rowid
            }
        }) as HTMLElement;
        this.$renderInlines(root, block.inlines);
        return root;
    }
}