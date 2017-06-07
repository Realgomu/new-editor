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

    private _mathNode: EE.IInlineNode;
    private _popEdit: HTMLElement;
    constructor(editor: Core.Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'math',
            token: 'math',
            iconFA: 'fa-percent',
            text: '公式',
            click: () => {
                Wiris.OpenModal({
                    submit: (mathml: string) => {
                        console.log(mathml);
                        Wiris.RenderMathML(mathml, (result) => {
                            this._addMathImage(mathml, result.result.content);
                            console.log(result);
                        });
                    },
                    mathml: '<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>2</mn><msub><mi mathvariant="normal">H</mi><mn>2</mn></msub><mi mathvariant="normal">O</mi><mo>+</mo><mn>2</mn><mi>Na</mi><mo>&#x2192;</mo><mn>2</mn><mi>NaOH</mi><mo>+</mo><msub><mi mathvariant="normal">H</mi><mn>2</mn></msub><mo>&#x2191;</mo></math>'
                });
            }
        })
    }

    init() {
        Wiris.Init();
        this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLImageElement) => {
            ev.preventDefault();
            ev.stopPropagation();
        }, 'img.math');
        this.editor.events.on('$dblclick', (ev: KeyboardEvent, target: HTMLImageElement) => {
            let mathml = target.getAttribute('data-mathml');
            Wiris.OpenModal({
                submit: (mathml: string) => {
                    console.log(mathml);
                    Wiris.RenderMathML(mathml, (result) => {
                        this._addMathImage(mathml, result.result.content);
                        console.log(result);
                    });
                },
                mathml: mathml
            });
            ev.preventDefault();
            ev.stopPropagation();
        }, 'img.math');
        // this.editor.events.on('$cursorChanged', () => {
        //     this._mathNode = this._findTarget();
        //     if (this._mathNode) {
        //         this._openEdit();
        //     }
        //     else {
        //         this.editor.defaultUI.popover.hide();
        //     }
        // });
    }

    private _createCodeEl(tex: string) {
        let code = this.editor.renderElement({
            tag: 'span',
            attr: {
                class: 'tex-code',
                style: 'display:none;'
            }
        }) as HTMLElement;
        code.innerHTML = tex;
        return code;
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

    private _addMathImage(mathml: string, svg: string) {
        let cursor = this.editor.cursor.current();
        if (cursor.collapsed) {
            let src = `data:image/svg+xml;charset=utf8,${svg}`;
            let inline: IMath = {
                start: cursor.start,
                end: cursor.start,
                image: src,
                mathml: mathml,
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

    private _findTarget() {
        let cursor = this.editor.cursor.current();
        let activeTokens = this.editor.cursor.activeTokens();
        if (!cursor.mutilple && activeTokens.findIndex(a => a.token === this.token) >= 0) {
            return this.editor.findInlineNode(cursor.rows[0], 'span.math', cursor.start, cursor.end);
        }
    }

    private _createEditPanel() {
        this._popEdit = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-katex-edit'
            }
        }) as HTMLElement;
        let tex = this._mathNode.el.querySelector('span.tex-code').textContent;
        this._popEdit.innerHTML = `
<input name="code" type="text" placeholder="Latex" value="${tex}">
<div class="ee-pop-footer"><a class="cancel">取消</a><a class="submit">确定</a></div>
`;
        let $code = this._popEdit.querySelector('input[name="code"]') as HTMLInputElement;
        let $submit = this._popEdit.querySelector('a.submit') as HTMLElement;
        let $cancel = this._popEdit.querySelector('a.cancel') as HTMLElement;
        //事件
        this.editor.events.attach('click', $submit, (ev: Event) => {
            if (tex !== $code.value) {
                this._editSubmit($code.value);
            }
            else {
                this.editor.cursor.restore();
                this.editor.defaultUI.popover.hide();
            }
        });
        this.editor.events.attach('click', $cancel, (ev: Event) => {
            this._editCancel();
        });
    }

    private _editSubmit(tex: string) {
        if (this._mathNode) {
            let $math = this._mathNode.el;
            katex.render(tex, $math);
            $math.appendChild(this._createCodeEl(tex));
            // let link = this._mathNode.el as HTMLLinkElement;
            // link.textContent = text;
            // link.href = href;
            // let fromCursor = this.editor.cursor.current();
            // this.editor.cursor.selectElement(link);
            this.editor.actions.doAction();
            this.editor.defaultUI.popover.hide();
        }
    }

    private _editCancel() {
        this.editor.cursor.restore();
        this.editor.defaultUI.popover.hide();
    }

    private _openEdit() {
        if (!this._popEdit) {
            this._createEditPanel();
        }
        this.editor.defaultUI.popover.show(this._mathNode.el, this._popEdit);
        setTimeout(() => {
            let $code = this._popEdit.querySelector('input[name="code"]') as HTMLInputElement;
            // $code.focus();
        }, 150);
    }
} 