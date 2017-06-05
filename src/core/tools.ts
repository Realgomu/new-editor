import { Editor } from './editor';
import * as Util from './util';
import { InlineTool } from './tool-inline';
import { BlockTool } from './tool-block';
import { IActionStep } from 'core/action';

export { InlineTool } from './tool-inline';
export { BlockTool } from './tool-block';

export const toolFactory: {
    [token: string]: {
        ctrl: EE.IToolConstructor;
        options: IEditorToolOptions;
    }
} = {};

export interface IEnterBlockTool extends BlockTool {
    enterAtEnd?: (newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) => any;
    enterAtStart?: (newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) => any;
}

export interface IEditorToolOptions {
    token: string;
    level: EE.ToolLevel;
    blockType?: EE.BlockType;
}

/** 编辑器工具decorater */
export function EditorTool(options: IEditorToolOptions) {
    return function (ctrl: EE.IToolConstructor) {
        ctrl.prototype.token = options.token;
        ctrl.prototype.level = options.level;
        if (options.blockType !== undefined) {
            ctrl.prototype.blockType = options.blockType;
        }
        if (toolFactory[options.token]) {
            throw new Error(`repeated editor tool [${options.token}]!`);
        }
        else {
            toolFactory[options.token] = {
                ctrl: ctrl,
                options: options
            };
        }
    }
}

/** 扩展工具 */
export function ExtendTool() {

}

export class Tools {
    private _toolCache: EE.IEditorTool[] = [];
    rowTool: IEnterBlockTool;
    constructor(private editor: Editor) {
        this._loadOptions(editor.options.tools);
        this.rowTool = this.matchToken('paragraph') as IEnterBlockTool;
    }

    private _loadOptions(token: 'all' | string[]) {
        if (typeof token === 'string' && token === 'all') {
            for (let key in toolFactory) {
                this._toolCache.push(new toolFactory[key].ctrl(this.editor));
            }
        }
        else {
            token.forEach(key => {
                let ctrl = toolFactory[key].ctrl;
                if (ctrl) {
                    try {
                        if (!this._toolCache[key]) {
                            this._toolCache.push(new ctrl(this.editor));
                        }
                    }
                    catch (ex) {
                        console.warn(`init editor tool [${ctrl.prototype.token}] error !`);
                    }
                }
            });
        }
        //按优先级从高到低排序
        this._toolCache.sort((a, b) => b.level - a.level);
    }

    init() {
        for (let key in this._toolCache) {
            let tool = this._toolCache[key];
            if (tool && tool.init) {
                tool.init();
            }
        }
    }

    private _match(func: (tool: EE.IEditorTool) => boolean) {
        for (let item of this._toolCache) {
            if (func && func(item)) {
                return item;
            }
        }
    }

    /** 根据element的tag匹配相对应的inline tool */
    matchInlineTool(el: Element) {
        return this._match((t) => {
            return t.level > 0 && t.level < 100 && matchSelectors(el, t);
        }) as InlineTool;
    }

    /** 根据element的tag匹配相对应的block tool */
    matchBlockTool(el: Element) {
        return this._match((t) => {
            return t.level >= 100 && t.level < 1000 && matchSelectors(el, t);
        }) as BlockTool;
    }

    matchToken(token: string) {
        return this._match((tool) => {
            return tool.token === token;
        });
    }

    getInlineTools() {
        return this._toolCache.filter(t => t.level < 100 && t.level > 0) as InlineTool[];
    }

    getBlockTools() {
        return this._toolCache.filter(t => t.level >= 100 && t.level < 1000) as BlockTool[];
    }

    getActiveTokens(target: Element) {
        let list = [];
        Util.FindParent(target, (el) => {
            if (el == this.editor.rootEl) return true;
            let tool = this._match(t => matchSelectors(el, t));
            if (tool) {
                list.push(tool.token);
            }
            return false;
        });
        return list;
    }

    createNewRow() {
        let el = Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: this.rowTool.selectors[0],
            attr: {
                'data-row-id': Util.RandomID()
            },
            children: [{
                tag: 'br'
            }]
        }) as HTMLElement;
        let block = this.rowTool.readData(el);
        this.editor.blockMap[block.rowid].block = block;
        return el;
    }
}

function matchSelectors(el: Element, tool: EE.IEditorTool) {
    if (tool.selectors && tool.selectors.length > 0) {
        for (let i = 0, l = tool.selectors.length; i < l; i++) {
            let selector = tool.selectors[i];
            if (Util.MathSelector(el, selector)) {
                return true;
            }
        }
    }
    return false;
}