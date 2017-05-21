
const _buttons: EE.IButtonOption[] = [
    {
        name: 'pre',
        action: 'pre',
        iconFA: 'fa-code',
        text: '代码'
    },
    {
        name: 'bold',
        action: 'bold',
        iconFA: 'fa-bold',
        text: '加粗'
    },
    {
        name: 'italic',
        action: 'italic',
        iconFA: 'fa-italic',
        text: '斜体'
    },
    {
        name: 'underline',
        action: 'underline',
        iconFA: 'fa-underline',
        text: '下划线'
    },
    {
        name: 'strike',
        action: 'strike',
        iconFA: 'fa-strikethrough',
        text: '删除线'
    }
]

export class Toolbar implements EE.IToolbar {
    panel: HTMLElement;
    constructor(
        private editor: EE.IEditor,
        private ui: EE.IDefaultUI
    ) { }

    init() {
        this.panel = this.editor.ownerDoc.createElement('div');
        this.panel.classList.add('ee-toolbar');
        this.ui.container.insertBefore(this.panel, this.editor.rootEl);

        this.editor.options.toolbars.forEach(item => {
            if (item === '|') {
                this.panel.appendChild(this.createDivider());
            }
            else {
                let option = _buttons.find(p => p.name === item);
                if (option) {
                    this.panel.appendChild(this.createButton(option));
                }
            }
        });
    }

    createButton(option: EE.IButtonOption) {
        let _editor = this.editor;
        let button = _editor.ownerDoc.createElement('div');
        button.classList.add('ee-button');
        button.setAttribute('data-action', option.action);
        button.innerHTML = `<i class="fa ${option.iconFA}"></i>`;
        if (!option.click) {
            option.click = function (this: EE.IButtonOption, ev: MouseEvent) {
                let tool = _editor.tools.matchActionTool(this.action);
                if (tool) {
                    tool.redo();
                }
                ev.stopPropagation();
                ev.stopImmediatePropagation();
                ev.preventDefault();
                return false;
            }
        }
        button.addEventListener('mousedown', (ev)=>{
            ev.stopPropagation();
            ev.preventDefault();
        });
        button.addEventListener('click', option.click.bind(option));
        return button;
    }

    createDivider() {
        let div = this.editor.ownerDoc.createElement('div');
        div.classList.add('divider');
        return div;
    }
}