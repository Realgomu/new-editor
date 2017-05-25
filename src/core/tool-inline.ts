import { Editor } from 'core/editor';
import { IInlineActions, IActionStep } from 'core/action';

export abstract class InlineTool implements EE.IInlineTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract selectors: string[];

    constructor(protected editor: Editor) {
    }

    getDataFromEl(el: Element, start: number): EE.IInline {
        return this.createData(start, el.textContent.length);
    }

    createData(start: number, end: number, data?: any) {
        let inline: EE.IInline = {
            type: this.type,
            start: start,
            end: start + end,
            data: data
        }
        return inline;
    }

    protected $render(inline: EE.IInline) {
        let node: EE.IRenderNode = {
            tag: this.selectors[0],
            start: inline.start,
            end: inline.end
        };
        return node;
    }

    render(inline: EE.IInline) {
        return this.$render(inline);
    }

    /** 计算操作 */
    calcActions(block: EE.IBlock, start: number, end: number) {
        let obj: IInlineActions = { token: this.token, list: [] };
        let list = block.inlines[this.token];
        if (list && list.length > 0) {
            for (let i = 0, l = list.length; i < l; i++) {
                let inline = list[i];
                if (start < inline.start) {
                    if (end <= inline.start) {
                        obj.list.push([start, end]);
                        break;
                    }
                    else {
                        obj.list.push([start, inline.start]);
                        if (end <= inline.end) {
                            inline[i].start = start;
                            break;
                        }
                        else {
                            start = inline.end;
                        }
                    }
                }
                else if (start <= inline.end) {
                    if (end <= inline.end) {
                        break;
                    }
                    else {
                        start = inline.end;
                    }
                }
                else if (i === l - 1) {
                    obj.list.push([start, end]);
                }
            }
        }
        else {
            obj.list.push([start, end]);
        }
        return obj;
    }

    /** 合并操作 */
    mergeApply(list: EE.IInline[], apply: EE.IInline) {
        let newList: EE.IInline[] = [];
        if (!list || list.length === 0) {
            newList.push(apply);
        }
        else {
            for (let i = 0, l = list.length; i < l; i++) {
                let inline = list[i];
                if (apply) {
                    if (apply.start < inline.start) {
                        if (apply.end < inline.start) {
                            newList.push(apply);
                            apply = undefined;
                        }
                        else if (apply.end <= inline.end) {
                            inline.start = apply.start;
                            newList.push(inline);
                            apply = undefined;
                        }
                        else {

                        }
                    }
                    else if (apply.start <= inline.end) {
                        if (apply.end <= inline.end) {
                            newList.push(inline);
                            apply = undefined;
                        }
                        else {
                            inline.end = apply.end;
                            apply = inline;
                        }
                    }
                    else {
                        newList.push(inline);
                    }
                }
                else {
                    newList.push(inline);
                }
            }
        }
        return newList;
    }

    apply(...args: any[]) {
        let step: IActionStep = {};
        this.editor.selection.eachRow((block, start, end) => {
            //计算actions
            let actions = this.calcActions(block, start, end);
            if (actions && actions.list.length > 0) {
                step[block.rowid] = actions;
            }
            //合并，重新渲染block
            block.inlines[this.token] = this.mergeApply(block.inlines[this.token], this.createData(start, end));
            this.editor.renderRow(block);
        });
        this.editor.selection.restore();
        console.log(step);
        return step;
    }

    redo(step: IActionStep) {
    }

    undo(step: IActionStep) {
        for (let rowid in step) {

        }
    }
}