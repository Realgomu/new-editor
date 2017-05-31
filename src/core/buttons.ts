import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { toolFactory } from 'core/tools';

export interface IButtonConfig {
    name: string;
    token: string;
    iconFA?: string;
    isDropdown?: boolean;
    text?: string;
    click?: (ev?: Event) => any;
    active?: () => boolean;
    disable?: () => boolean;
}

export interface IToolbarButton extends IButtonConfig {
    tool: EE.IEditorTool;
    element: HTMLElement;
}

export class Buttons {
    private _configs: IButtonConfig[] = [];
    constructor(
        private editor: Editor
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
            let button = Util.Extend({}, config) as IToolbarButton;
            let _editor = this.editor;
            let el = _editor.ownerDoc.createElement('div');
            el.classList.add('ee-button');
            // el.setAttribute('data-token', button.token);
            el.setAttribute('title', button.text);
            el.innerHTML = `<i class="fa ${button.iconFA}"></i>`;
            button.tool = _editor.tools.matchToken(button.token);
            if (!button.click) {
                button.click = function (ev: MouseEvent) {
                    if (button.tool) {
                        let active = button.element.classList.contains('active');
                        button.tool.apply && button.tool.apply(!active);
                    }
                }
            }
            this.editor.events.attach('mousedown', el, (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            })
            this.editor.events.attach('click', el, button.click);
            button.element = el;
            return button;
        }
    }
}