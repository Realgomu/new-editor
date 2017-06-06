import * as Tool from 'core/tools';
import * as Core from 'core/editor';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IList extends EE.IBlock {
    type: string;
    // data: string[];
}

@Tool.EditorTool({
    token: 'list',
    level: EE.ToolLevel.List,
    blockType: EE.BlockType.Wrapper,
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
            checkActive: () => {
                return this.active('ol');
            }
        });
        this.editor.buttons.register({
            name: 'ul',
            token: 'list',
            iconFA: 'fa-list-ul',
            text: '项目编号',
            checkActive: () => {
                return this.active('ul');
            }
        });
    }

    readData(el: Element): IList {
        let block = this.$readDate(el as HTMLElement) as IList;
        block.text = '';
        block.type = el.tagName.toLowerCase();
        return block;
    }

    render(block: IList) {
        let el = this.$render(block, block.type);
        return el;
    }

    apply(button: Core.IToolbarButton) {
        let type = button.name;
        let cursor = this.editor.cursor.current();
        let activeList = this.editor.cursor.activeTokens();
        let activeObj = this.getActiveList();
        if (!button.active) {
            if (activeObj && activeObj.el && activeObj.el.tagName.toLowerCase() !== type) {
                //切换列表类型
                let list = this.editor.findBlockNode(activeObj.el.getAttribute('data-row-id')).block as IList;
                list.type = type;
                let oldEl = this.editor.findBlockElement(list.rowid);
                let newEl = this.$render(list, list.type);
                while (oldEl.firstElementChild) {
                    let el = oldEl.firstElementChild;
                    newEl.appendChild(el);
                }
                oldEl.parentNode.replaceChild(newEl, oldEl);
                this.editor.cursor.restore();
                this.editor.actions.doAction();
            }
            else {
                let list: IList = {
                    rowid: Util.RandomID(),
                    token: this.token,
                    text: '',
                    inlines: {},
                    type: type,
                };
                let el = this.$render(list, type);
                let parent: Element;
                let index: number;
                this.editor.cursor.eachRow(node => {
                    let row = this.editor.findBlockElement(node.rowid);
                    let li = Util.CreateRenderElement(this.editor.ownerDoc, { tag: 'li' });
                    li.appendChild(row);
                    el.appendChild(li);
                    if (parent === undefined) {
                        parent = this.editor.findBlockElement(node.pid);
                    }
                    if (index === undefined) {
                        index = node.index;
                    }
                });
                this.editor.insertElement(parent, el, index);
                this.editor.cursor.restore();
                this.editor.actions.doAction();
            }
        }
        else {
            if (activeObj) {
                let oldEl = activeObj.el;
                let rowid = oldEl.getAttribute('data-row-id');
                let block = this.editor.findBlockNode(rowid);
                if (block) {
                    while (oldEl.firstElementChild) {
                        let el = oldEl.firstElementChild.firstElementChild;
                        this.editor.rootEl.insertBefore(el, oldEl);
                        oldEl.firstElementChild.remove();
                    }
                    oldEl.remove();
                    this.editor.cursor.restore();
                    this.editor.actions.doAction();
                }
            }
        }
    }

    enterAtEnd(newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) {
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

    enterAtStart(newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) {
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

    getActiveList() {
        let activeTokens = this.editor.cursor.activeTokens();
        let obj = activeTokens.find(a => a.token === this.token);
        return obj;
    }

    active(type: string) {
        let obj = this.getActiveList();
        return !!obj && !!obj.el && obj.el.tagName.toLowerCase() === type;
    }
}