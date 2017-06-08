import * as Core from 'core/editor';
import * as Util from 'core/util';

import * as Wiris from 'extends/wiris-editor.ts';

interface IMath extends EE.IInline {
    image?: string;
    mathml?: string;
}

declare var wrs_openEditorWindow: any;

@Core.EditorTool({
    token: 'math',
    level: EE.ToolLevel.Math
})
export default class Math extends Core.InlineTool {
    selectors = ['img.math'];

    private _currentMath: HTMLElement;
    private _popTool: HTMLElement;
    constructor(editor: Core.Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'math',
            token: 'math',
            iconFA: 'fa-percent',
            text: '公式',
            click: () => {
                this._openWirisEditor();
            }
        });
        this.editor.buttons.register({
            name: 'editMath',
            token: 'math',
            iconFA: 'fa-edit',
            text: '编辑公式',
            click: () => {
                if (this._currentMath) {
                    let mathml = this._currentMath.getAttribute('data-mathml');
                    this._openWirisEditor(mathml);
                }
            }
        });
        this.editor.buttons.register({
            name: 'removeMath',
            token: 'math',
            iconFA: 'fa-trash-o',
            text: '删除公式',
            click: () => {
                if (this._currentMath) {
                    this._removeMath();
                }
            }
        })
    }

    init() {
        Wiris.Init();
        this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLImageElement) => {
            this._currentMath = target;
            this._openTool();
            ev.stopPropagation();
        }, 'img.math');
        this.editor.events.on('$dblclick', (ev: KeyboardEvent, target: HTMLImageElement) => {
            let mathml = target.getAttribute('data-mathml');
            this._openWirisEditor(mathml);
            ev.preventDefault();
            ev.stopPropagation();
        }, 'img.math');
    }

    readData(el: Element, start: number): IMath {
        let inline: IMath = {
            start: start,
            end: start,
            image: el.getAttribute('src'),
            mathml: el.getAttribute('data-mathml'),
        };
        return inline;
    }

    render(inline: IMath, replaceText: Text) {
        let el = this.editor.renderElement({
            tag: 'img',
            attr: {
                'class': 'math',
                'src': inline.image,
                'data-mathml': inline.mathml
            }
        });
        return el;
    }

    private _openWirisEditor(mathml?: string) {
        Wiris.OpenModal({
            submit: (result) => {
                if (this._currentMath) {
                    this._currentMath.setAttribute('data-mathml', result.mathml);
                    this._currentMath.setAttribute('src', result.svg);
                }
                else {
                    this._addMath(result);
                }
            },
            mathml: mathml
        });
    }

    private _addMath(result: Wiris.IMathResult) {
        let cursor = this.editor.cursor.current();
        if (cursor.collapsed) {
            let inline: IMath = {
                start: cursor.start,
                end: cursor.start,
                image: result.svg,
                mathml: result.mathml,
            };
            let node = this.editor.findBlockNode(cursor.rows[0]);
            if (node && node.block) {
                if (!node.block.inlines[this.token]) {
                    node.block.inlines[this.token] = [];
                }
                node.block.inlines[this.token].push(inline);
                this.editor.refreshElement(node.block);
                this.editor.actions.doAction();
            }
        }
    }

    private _openTool(target: HTMLElement = this._currentMath) {
        if (!this._popTool) {
            this._popTool = this.editor.renderElement({
                tag: 'div',
                attr: {
                    class: 'ee-pop-toolbar'
                }
            }) as HTMLElement;
            ['editMath', 'removeMath'].forEach(item => {
                let button = this.editor.buttons.createButton(item);
                if (button) {
                    this._popTool.appendChild(button.element);
                }
            });
        }
        this.editor.defaultUI.popover.show(target, this._popTool);
    }

    private _removeMath() {
        this._currentMath.remove();
        this.editor.actions.doAction();
        this.editor.defaultUI.popover.hide(this._popTool);
    }
}