import { Editor } from 'core/editor';
import { toolFactory } from 'core/tools';

export interface IButtonConfig {
    name: string;
    token: string;
    iconFA?: string;
    isDropdown?: boolean;
    text?: string;
    click?: (ev?: Event) => any;
}

export interface IToolbarButton extends IButtonConfig {
    tool: EE.IEditorTool;
    element: HTMLElement;
}

export class Buttons {
    private _configs: any[] = [];
    constructor(
        private editor: Editor,
        private ui: EE.IDefaultUI
    ) {
        this._loadOptions();
    }

    private _loadOptions() {
        for (let key in toolFactory) {
            let options = toolFactory[key].options;
            if (options.buttonOptions) {
                let config: IButtonConfig = {
                    name: options.buttonOptions.name,
                    token: options.token,
                    iconFA: options.buttonOptions.iconFA,
                    text: options.buttonOptions.text
                };
                this._configs.push(config);
            }
        }
    }

    register(config: IButtonConfig) {
        if (this._configs.findIndex(c => c.name === config.name) < 0) {
            this._configs.push(config);
        }
    }

    createButton(name: string): IToolbarButton {
        let config = this._configs.find(c => c.name === name);
        if (config) {
            let toolbarButton = Object.assign({}, config) as IToolbarButton;
            let _editor = this.editor;
            let button = _editor.ownerDoc.createElement('div');
            button.classList.add('ee-button');
            button.setAttribute('data-token', toolbarButton.token);
            button.setAttribute('title', toolbarButton.text);
            button.innerHTML = `<i class="fa ${toolbarButton.iconFA}"></i>`;
            toolbarButton.tool = _editor.tools.matchToken(toolbarButton.token);
            if (!toolbarButton.click) {
                toolbarButton.click = (ev: MouseEvent) => {
                    if (toolbarButton.tool && !toolbarButton.element.classList.contains('active')) {
                        toolbarButton.tool.apply && toolbarButton.tool.apply();
                    }
                }
            }
            button.addEventListener('mousedown', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            });
            button.addEventListener('click', toolbarButton.click);
            toolbarButton.element = button;
            return toolbarButton;
        }
    }
}