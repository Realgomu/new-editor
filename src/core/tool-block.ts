import * as Tool from './tools';
import * as Util from './util';
import * as Selection from 'core/cursor';
import { Editor } from './editor';
import { IToolbarButton } from 'core/buttons';

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
                        let inline = tool.readData(<Element>current, pos);
                        if (inline) {
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
            inlines: {},
        }
        if (this.blockType === EE.BlockType.Leaf && block.text) {
            block.inlines = this.$readInlines(el);
        }
        else {
            block.text = '';
        }
        let align = el.style.textAlign || 'left';
        if (align !== 'left') {
            block.style = {
                align: align
            };
        }
        return block;
    }

    readData(el: Element): EE.IBlock {
        let block = this.$readDate(el as HTMLElement);
        return block;
    }

    protected $renderInlines(el: HTMLElement, map: EE.InlineMap) {
        //inline 数据按照优先级从高到底进行插入
        this.editor.tools.getInlineTools().forEach(tool => {
            let list = map[tool.token];
            if (list) {
                list.forEach(item => {
                    Util.InsertRenderTree(this.editor.ownerDoc, el, tool.renderNode(item));
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
        this.editor.cursor.eachRow((node, start, end) => {
            let oldEl = this.editor.findBlockElement(node.rowid);
            if (oldEl.tagName.toLowerCase() !== tag) {
                node.block.token = this.token;
                let newNode = this.$render(node.block, tag);
                newNode.innerHTML = oldEl.innerHTML;
                oldEl.parentElement.replaceChild(newNode, oldEl);
            }
        });
        this.editor.cursor.restore();
        this.editor.actions.doAction();
    }

    apply(button: IToolbarButton) {
        if (!button.active) {
            this.$apply(this.selectors[0]);
        }
    }
}