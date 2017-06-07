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
        this.editor.treeWalker(el, (current) => {
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
                pos += current.textContent.length;
            }
        });
        // Util.TreeWalker(
        //     this.editor.ownerDoc,
        //     el,
        //     (current) => {
        //         let lenght = current.textContent.length;
        //         if (current.nodeType === 1) {
        //             let tool = this.editor.tools.matchInlineTool(<Element>current);
        //             if (tool) {
        //                 if (!map[tool.token]) map[tool.token] = [];
        //                 let inline = tool.readData(<Element>current, pos);
        //                 if (inline) {
        //                     if (last[tool.token] && inline.start === last[tool.token].end) {
        //                         //检查是否可以合并
        //                         last[tool.token].end = inline.end;
        //                     }
        //                     else {
        //                         map[tool.token].push(inline);
        //                         last[tool.token] = inline;
        //                     }
        //                 }
        //             }
        //         }
        //         else if (current.nodeType === 3) {
        //             pos += lenght;
        //         }
        //     });
        return map;
    }

    protected $readDate(el: HTMLElement): EE.IBlock {
        let id = el.getAttribute('data-row-id');
        let block: EE.IBlock = {
            rowid: id || Util.RandomID(),
            token: this.token,
            text: '',
            inlines: {},
        }
        if (this.blockType === EE.BlockType.Leaf) {
            let map: EE.InlineMap = {};
            let pos = 0;
            let last: { [token: string]: EE.IInline } = {};
            let text = '';
            this.editor.treeWalker(el, (current) => {
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
                    pos += current.textContent.length;
                    text += current.textContent;
                }
            });
            block.inlines = map;
            block.text = text;
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
                    this._insertInlineElement(el, tool, item);
                    // Util.InsertRenderTree(this.editor.ownerDoc, el, tool.renderNode(item));
                })
            }
        });
    }

    private _insertInlineElement(root: HTMLElement, tool: Tool.InlineTool, insert: EE.IInline) {
        if (root && tool && insert) {
            let walker = this.editor.ownerDoc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            while (walker.nextNode() && insert) {
                let leftText = walker.currentNode as Text;
                let current = leftText.$inline;
                let left: EE.IInline;
                let center: EE.IInline;
                let right: EE.IInline;
                if (insert.end <= current.end) {
                    center = insert;
                    insert = undefined;
                }
                else if (insert.start <= current.end && insert.end > current.end) {
                    center = {
                        start: insert.start,
                        end: current.end
                    };
                    insert.start = current.end;
                }
                else {
                    continue;
                }
                let collapsed = center.start === center.end;
                if (collapsed) {
                    //如果该节点是闭合节点
                    let el = tool.render(center, null);
                    if (center.start === current.start) {
                        leftText.parentNode.insertBefore(el, leftText);
                    }
                    else if (center.start === current.end) {
                        leftText.parentNode.appendChild(el);
                    }
                    else {
                        //切分当前text节点
                        let split = leftText.splitText(center.start - current.start);
                        leftText.parentNode.insertBefore(el, split);
                    }
                }
                else {
                    //如果不是闭合节点
                    let centerText = leftText;
                    if (center.start > current.start) {
                        //切分左边
                        left = {
                            start: current.start,
                            end: center.start,
                        };
                        centerText = leftText.splitText(center.start - current.start);
                        leftText.$inline = left;
                    }
                    if (center.end < current.end) {
                        //切分右边
                        right = {
                            start: center.end,
                            end: current.end,
                        };
                        let rightText = centerText.splitText(center.end - center.start);
                        rightText.$inline = right;
                    }
                    centerText.$inline = center;
                    tool.render(center, centerText);
                }
            }
        }
    }

    protected $render(block: EE.IBlock, tag: string = this.selectors[0]) {
        let node: EE.IRenderNode = {
            tag: tag,
            attr: {
                'data-row-id': block.rowid
            }
        };
        //style
        if (block.style) {
            let style = '';
            for (let key in block.style) {
                style += `text-align:${block.style[key]};`;
            }
            if (style) {
                node.attr['style'] = style;
            }
        }
        //创建element
        let el = this.editor.renderElement(node);
        if (this.blockType === EE.BlockType.Leaf) {
            if (block.text) {
                //如果是叶子元素，渲染inline样式，首先插入一个完整的text节点
                let text = this.editor.ownerDoc.createTextNode(block.text);
                //设置起始位置
                text.$inline = {
                    start: 0,
                    end: block.text.length
                };
                el.appendChild(text);
                this.$renderInlines(el, block.inlines);
            }
            else {
                //空行，增加br
                el.appendChild(this.editor.ownerDoc.createElement('br'));
            }
        }
        return el;
    }

    render(block: EE.IBlock) {
        return this.$render(block, this.selectors[0]);
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