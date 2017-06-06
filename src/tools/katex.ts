import * as Core from 'core/editor';
import * as Util from 'core/util';

interface IKatex extends EE.IInline {
    tex: string;
}

@Core.EditorTool({
    token: 'katex',
    level: EE.ToolLevel.Katex
})
export default class Katex extends Core.InlineTool {
    selectors = ['span.math'];
    constructor(editor: Core.Editor) {
        super(editor);
    }

    init() {
        this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLLinkElement) => {
            console.log(target);
            ev.preventDefault();
            ev.stopPropagation();
        }, 'span.math');
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
        let tex = el.getAttribute('data-katex');
        if (tex) {
            let kt = katex.render(tex, el);
        }
        el.setAttribute('contenteditable', 'false');
        let code = this._createCodeEl(tex);
        el.appendChild(code);
        let inline: IKatex = {
            start: start,
            end: start + tex.length,
            tex: tex
        }
        return inline;
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
            replaceText.parentNode.replaceChild(replaceText, el);
            texCode.appendChild(replaceText);
        }
        return el;
    }
} 