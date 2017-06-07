import * as Core from 'core/editor';
import * as Util from 'core/util';

import * as Wiris from 'extends/wiris-editor.ts';

interface IKatex extends EE.IInline {
    tex: string;
}

declare var wrs_openEditorWindow: any;

@Core.EditorTool({
    token: 'math',
    level: EE.ToolLevel.Math
})
export default class Math extends Core.InlineTool {
    selectors = ['span.math'];

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
                            console.log(result);
                        });
                    },
                    mathml: '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>e</mi><mo>=</mo><mo>&#xB1;</mo><msqrt><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup><mo>+</mo><msup><mi>c</mi><mn>2</mn></msup></msqrt></math>'
                });
            }
        })
    }

    init() {
        Wiris.Init();
        // this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLLinkElement) => {
        //     ev.preventDefault();
        //     ev.stopPropagation();
        // }, 'span.math');
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

    readData(el: Element, start: number): IKatex {
        let tex = ''
        //检查tex节点内容
        let code = el.querySelector('.tex-code');
        if (code) {
            tex = code.textContent;
        }
        //检查attr
        if (!tex) {
            tex = el.getAttribute('data-katex');
        }
        if (tex) {
            //渲染公式
            katex.render(tex, el);
            el.setAttribute('contenteditable', 'false');
            code = this._createCodeEl(tex);
            el.appendChild(code);
            let inline: IKatex = {
                start: start,
                end: start + tex.length,
                tex: tex
            }
            return inline;
        }
    }

    render(inline: IKatex, replaceText: Text) {
        let el = this.editor.renderElement({
            tag: 'span',
            attr: {
                'class': 'math',
                'contenteditable': 'false',
            }
        });
        //渲染公式
        if (inline.tex) {
            let kt = katex.render(inline.tex, el);
        }
        let texCode = this.editor.renderElement({
            tag: 'span',
            attr: {
                class: 'tex-code',
                style: 'display:none;'
            }
        });
        el.appendChild(texCode);
        if (replaceText) {
            replaceText.parentNode.replaceChild(el, replaceText);
            texCode.appendChild(replaceText);
        }
        return el;
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