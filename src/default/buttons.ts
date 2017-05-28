import { Editor } from 'core/editor';
import { toolFactory } from 'core/tools';

export interface IButtonConfig {
    name: string;
    token: string;
    iconFA?: string;
    isDropdown?: boolean;
    text?: string;
    click?: Function;
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

    createButton(name: string) {
        let config = this._configs.find(c => c.name === name);
        if (config) {
            let _editor = this.editor;
            let button = _editor.ownerDoc.createElement('div');
            button.classList.add('ee-button');
            button.setAttribute('data-token', config.token);
            button.setAttribute('title', config.text);
            button.innerHTML = `<i class="fa ${config.iconFA}"></i>`;
            if (!config.click) {
                config.click = function (this: IButtonConfig, ev: MouseEvent) {
                    let tool = _editor.tools.matchToken(this.token);
                    if (tool) {
                        tool.apply && tool.apply();
                    }
                }
            }
            button.addEventListener('mousedown', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            });
            button.addEventListener('click', config.click.bind(config));
            return button;
        }
    }
}