import * as Tool from './tool';
import * as Util from './util';
import * as Selection from './selection';

export abstract class BlockTool implements EE.IBlockTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract selectors: string[];

    constructor(protected editor: EE.IEditor) {
    }

    getInlines(el: Element): EE.InlineMap {
        let map: EE.InlineMap = {};
        Util.NodeTreeWalker(
            el,
            (pos, child: Element) => {
                let tool = this.editor.tools.matchInlineTool(child);
                if (tool) {
                    if (!map[tool.token]) map[tool.token] = [];
                    map[tool.token].push(tool.getData(child, pos));
                }
            });
        //检查inline数据，进行合并计算
        for (let token in map) {
            map[token] = MergeInlines(map[token]);
        }
        return map;
    }

    getData(el: Element): EE.IBlock {
        return this.$getDate(el);
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

    protected $changeBlock(tag: string = this.selectors[0]) {
        let pos = this.editor.selection.lastPos;
        if (pos.rowid) {
            let old = this.editor.ownerDoc.querySelector(`[data-row-id="${pos.rowid}"]`);
            if (old.tagName.toLowerCase() !== tag) {
                let rowid = old.getAttribute('data-row-id');
                let newNode = this.editor.ownerDoc.createElement(tag);
                newNode.setAttribute('data-row-id', rowid);
                newNode.innerHTML = old.innerHTML;
                old.parentElement.replaceChild(newNode, old);
                this.editor.selection.restoreCursor(newNode);
            }
        }
    }

    protected $renderBlock(root: EE.IRenderNode, data: EE.IBlock) {
        //inline 数据按照优先级从高到底进行插入
        this.editor.tools.getInlineTools().forEach(tool => {
            let map = data.inlines[tool.token];
            if (map) {
                map.forEach(item => {
                    Util.InsertRenderTree(root, tool.render(item));
                });
            }
        });
        return root;
    }

    render(data: EE.IBlock) {
        let end = data.text.length;
        let root: EE.IRenderNode = {
            tag: this.selectors[0],
            start: 0,
            end: end,
            children: [{ tag: '', start: 0, end: end, children: [] }],
            attr: {
                'data-row-id': data.rowid
            }
        }
        return this.$renderBlock(root, data);
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