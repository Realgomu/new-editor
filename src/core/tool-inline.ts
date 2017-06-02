import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { IActionStep } from 'core/action';

export abstract class InlineTool implements EE.IEditorTool {
    readonly token: string;
    readonly level: EE.ToolLevel;
    abstract selectors: string[];

    constructor(protected editor: Editor) {
    }

    getDataFromEl(el: Element, start: number): EE.IInline {
        return this.createData(start, start + el.textContent.length);
    }

    createData(start: number, end: number, data?: any) {
        let inline: EE.IInline = {
            start: start,
            end: end,
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

    /** 合并样式 */
    protected $mergeApply(list: EE.IInline[], apply: EE.IInline) {
        let newList: EE.IInline[] = [];
        if (!list || list.length === 0) {
            newList.push(apply);
        }
        else {
            for (let i = 0, l = list.length; i < l; i++) {
                let inline = Util.Extend({}, list[i]);
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
            if (apply) {
                newList.push(apply);
            }
        }
        return newList;
    }

    /** 删除样式 */
    protected $removeApply(list: EE.IInline[], apply: EE.IInline) {
        let newList: EE.IInline[] = [];
        for (let i = 0, l = list.length; i < l; i++) {
            let inline = Util.Extend({}, list[i]);
            if (apply.start >= inline.start && apply.end <= inline.end) {
                if (apply.start > inline.start) {
                    newList.push({ start: inline.start, end: apply.start, data: inline.data });
                }
                if (apply.end < inline.end) {
                    newList.push({ start: apply.end, end: inline.end, data: inline.data });
                }
            }
            else {
                newList.push(inline);
            }
        }
        return newList;
    }

    apply(merge: boolean) {
        let cursor = this.editor.cursor.current();
        if (!cursor.collapsed) {
            let step: IActionStep = {
                fromCursor: cursor,
                toCursor: cursor,
                rows: [],
            };
            this.editor.cursor.eachRow((block, start, end) => {
                let from = Util.Extend({}, block, true) as EE.IBlock;
                let to = block
                //合并
                if (merge) {
                    to.inlines[this.token] = this.$mergeApply(block.inlines[this.token], this.createData(start, end));
                }
                else {
                    to.inlines[this.token] = this.$removeApply(block.inlines[this.token], this.createData(start, end));
                }
                //插入一条action step
                step.rows.push({
                    from: from,
                    to: to
                })
                //重新渲染block
                this.editor.refreshBlock(to);
            });
            this.editor.cursor.restore();
            this.editor.actions.push(step);
        }
    }
}