import * as Tool from './tools';
import * as Util from './util';
import * as Selection from 'core/cursor';
import { Editor } from './editor';

export abstract class BlockTool implements EE.IEditorTool {
    readonly token: string;
    readonly level: EE.ToolLevel;
    readonly blockType: EE.BlockType;
    abstract selectors: string[];

    constructor(protected editor: Editor) {
    }

    protected $readInlines(el: Element): EE.InlineMap {
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

    protected $readDate(el: HTMLElement): EE.IBlock {
        let id = el.getAttribute('data-row-id');
        let block: EE.IBlock = {
            rowid: id || Util.RandomID(),
            token: this.token,
            text: el.textContent,
            style: {},
            inlines: this.$readInlines(el)
        }
        if (!block.text) {
            block.inlines = {};
        }
        let align = el.style.textAlign || 'left';
        if (align !== 'left') {
            block.style['align'] = align;
        }
        //pid
        if (el.parentElement && el.parentElement !== this.editor.rootEl && el.parentElement.hasAttribute('data-row-id')) {
            block.pid = el.parentElement.getAttribute('data-row-id');
        }
        return block;
    }

    readData(el: Element): EE.IBlock {
        let block = this.$readDate(el as HTMLElement);
        block.inlines = this.$readInlines(el);
        return block;
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

    protected $render(block: EE.IBlock, tag: string = this.selectors[0]) {
        let end = block.text.length;
        let renderNode = {
            tag: tag,
            start: 0,
            end: block.text.length,
            content: block.text,
            attr: {
                'data-row-id': block.rowid
            }
        };
        if (block.style) {
            let style = '';
            for (let key in block.style) {
                style += `text-align:${block.style[key]};`;
            }
            if (style) {
                renderNode.attr['style'] = style;
            }
        }
        return Util.CreateRenderElement(this.editor.ownerDoc, renderNode) as HTMLElement;
    }

    render(block: EE.IBlock) {
        let el = this.$render(block);
        if (block.text) {
            this.$renderInlines(el, block.inlines);
        }
        else if (this.blockType === EE.BlockType.Leaf) {
            el.appendChild(this.editor.ownerDoc.createElement('br'));
        }
        return el;
    }

    protected $apply(tag: string) {
        this.editor.cursor.eachRow((block, start, end) => {
            let old = this.editor.findBlockElement(block.rowid);
            if (old.tagName.toLowerCase() !== tag) {
                block.token = this.token;
                let newNode = this.$render(block, tag);
                newNode.innerHTML = old.innerHTML;
                old.parentElement.replaceChild(newNode, old);
            }
        });
        this.editor.cursor.restore();
        this.editor.actions.doInput();
    }

    apply(merge: boolean, ...args: any[]) {
        if (merge) {
            this.$apply(this.selectors[0]);
        }
    }
}