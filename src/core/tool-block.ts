import * as Tool from './tools';
import * as Util from './util';
import * as Selection from './selection';
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
        Util.TreeWalker(
            this.editor.ownerDoc,
            el,
            (current) => {
                let lenght = current.textContent.length;
                if (current.nodeType === 1) {
                    let tool = this.editor.tools.matchInlineTool(<Element>current);
                    if (tool) {
                        if (!map[tool.token]) map[tool.token] = [];
                        map[tool.token].push(tool.getData(<Element>current, pos));
                    }
                }
                else if (current.nodeType === 3) {
                    pos += lenght;
                }
            });
        //检查inline数据，进行合并计算
        for (let token in map) {
            map[token] = MergeInlines(map[token]);
        }
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

    protected $changeBlock(tag: string = this.selectors[0]) {
        let cursor = this.editor.selection.current();
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

//合并inline对象
function MergeInlines(list: EE.IInline[], add?: EE.IInline) {
    let newList: EE.IInline[] = [];
    add && newList.push(add);
    list.forEach(item => {
        let merge = newList.find(m => (m.start === item.end) || (m.end === item.start));
        if (merge) {
            if (merge.start === item.end - 1) {
                merge.start = item.start;
            }
            else if (merge.end === item.start + 1) {
                merge.end = item.end;
            }
        }
        else {
            newList.push(item);
        }
    });
    return newList;
}