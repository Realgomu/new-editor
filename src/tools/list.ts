import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IList extends EE.IBlock {
    type: string;
    data: string[];
}

@Tool.EditorTool({
    token: 'list',
    level: EE.ToolLevel.List,
    blockType: EE.BlockType.Normal,
})
export default class List extends Tool.BlockTool implements Tool.IEnterBlockTool {
    selectors = ['ol', 'ul'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'ol',
            token: 'list',
            iconFA: 'fa-list-ol',
            text: '编号列表',
            active: () => {
                return this.active('ol');
            }
        });
        this.editor.buttons.register({
            name: 'ul',
            token: 'list',
            iconFA: 'fa-list-ul',
            text: '项目编号',
            active: () => {
                return this.active('ul');
            }
        });
    }

    readData(el: Element): IList {
        let block = this.$readDate(el as HTMLElement) as IList;
        block.text = '';
        block.type = el.tagName.toLowerCase();
        block.data = [];
        Util.NodeListForEach(this.childrenElements(el), (node: Element) => {
            let childId = node.getAttribute('data-row-id');
            if (!childId) {
                childId = Util.RandomID();
                node.setAttribute('data-row-id', childId);
            }
            block.data.push(childId);
        });
        return block;
    }

    render(block: IList) {
        let el = this.$render(block, block.type);
        block.data.forEach(id => {
            let li = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'li'
            })
            el.appendChild(li);
        });
        return el;
    }

    /** 获取子节点 */
    childrenElements(el: Element) {
        return el.querySelectorAll('[data-row-id]') as any;
    }

    /** 添加子节点 */
    appendChild(el: Element, child: Element) {
        for (let i = 0, l = el.children.length; i < l; i++) {
            if (!el.children[i].hasChildNodes()) {
                el.children[i].appendChild(child);
                break;
            }
        }
    }

    apply(merge: boolean, type: string) {
        let activeList = this.editor.cursor.activeTokens();
        let cursor = this.editor.cursor.current();
        if (merge) {
            let list: IList = {
                rowid: Util.RandomID(),
                token: this.token,
                text: '',
                inlines: {},
                type: type,
                data: []
            };
            let el = this.$render(list, type);
            let insertEl: Element;
            this.editor.cursor.eachRow((block) => {
                list.data.push(block.rowid);
                let child = this.editor.findBlockElement(block.rowid);
                if (!block.pid) {
                    insertEl = child.nextElementSibling;
                }
                let li = Util.CreateRenderElement(this.editor.ownerDoc, {
                    tag: 'li'
                })
                li.appendChild(child);
                el.appendChild(li);
            });
            this.editor.insertBlock(el, insertEl, true);
            this.editor.cursor.restore();
            this.editor.actions.doInput();
        }
        else {
            let obj = activeList.find(a => a.token === this.token);
            if (obj) {
                let listEl = obj.el;
                let rowid = listEl.getAttribute('data-row-id');
                let block = this.editor.findBlockData(rowid);
                if (block) {
                    while (listEl.firstElementChild) {
                        let el = listEl.firstElementChild.firstElementChild;
                        this.editor.rootEl.insertBefore(el, listEl);
                        listEl.firstElementChild.remove();
                    }
                    listEl.remove();
                    this.editor.cursor.restore();
                    this.editor.actions.doInput();
                }
            }
        }
    }

    enterAtEnd(newRow: Element, current: EE.IBlock, parent?: EE.IBlock) {
        //检查parent
        if (parent && parent.pid) {
            parent = this.editor.findBlockData(current.pid);
            let tool = this.editor.tools.matchToken(parent.token) as Tool.IEnterBlockTool;
            if (tool && tool.enterAtEnd) {
                return tool.enterAtEnd(newRow, current, parent);
            }
        }
        //在下面插入一行
        let target = this.editor.findBlockElement(current.rowid);
        let li = target.parentElement;
        if (li.tagName.toLowerCase() === 'li') {
            let newLI = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'li'
            }) as HTMLElement;
            newLI.appendChild(newRow);
            this.editor.insertBlock(newLI, li, false);
        }
        else {
            this.editor.insertBlock(newRow, current.rowid, false);
        }
    }

    enterAtStart(newRow: Element, current: EE.IBlock, parent?: EE.IBlock) {
        //检查parent
        if (parent && parent.pid) {
            let parent = this.editor.findBlockData(current.pid);
            let tool = this.editor.tools.matchToken(parent.token) as Tool.IEnterBlockTool;
            if (tool && tool.enterAtEnd) {
                return tool.enterAtStart(newRow, current, parent);
            }
        }
        //插入当前行的上面
        let target = this.editor.findBlockElement(current.rowid);
        let li = target.parentElement;
        if (li.tagName.toLowerCase() === 'li') {
            let newLI = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'li'
            }) as HTMLElement;
            newLI.appendChild(newRow);
            this.editor.insertBlock(newLI, li, true);
        }
        else {
            this.editor.insertBlock(newRow, current.rowid, true);
        }
    }

    active(type: string) {
        let activeTokens = this.editor.cursor.activeTokens();
        return activeTokens.findIndex(a => a.token === this.token && a.el && a.el.tagName.toLowerCase() === type) >= 0;
    }
}