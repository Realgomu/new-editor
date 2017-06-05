import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { BlockTool } from 'core/tools';
import { IToolbarButton } from 'core/buttons';

export abstract class InlineTool implements EE.IEditorTool {
    readonly token: string;
    readonly level: EE.ToolLevel;
    abstract selectors: string[];

    constructor(protected editor: Editor) {
    }

    protected $createData(start: number, end: number) {
        let inline: EE.IInline = {
            start: start,
            end: end,
        }
        return inline;
    }

    readData(el: Element, start: number): EE.IInline {
        return this.$createData(start, start + el.textContent.length);
    }

    protected $renderNode(inline: EE.IInline) {
        let node: EE.IRenderNode = {
            tag: this.selectors[0],
            start: inline.start,
            end: inline.end
        };
        return node;
    }

    renderNode(inline: EE.IInline) {
        return this.$renderNode(inline);
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
                    newList.push({ start: inline.start, end: apply.start });
                }
                if (apply.end < inline.end) {
                    newList.push({ start: apply.end, end: inline.end });
                }
            }
            else {
                newList.push(inline);
            }
        }
        return newList;
    }

    apply(button: IToolbarButton) {
        let cursor = this.editor.cursor.current();
        if (!cursor.collapsed) {
            this.editor.cursor.eachRow((node, start, end) => {
                let to = node.block;
                //合并
                if (!button.active) {
                    to.inlines[this.token] = this.$mergeApply(to.inlines[this.token], this.$createData(start, end));
                }
                else {
                    to.inlines[this.token] = this.$removeApply(to.inlines[this.token], this.$createData(start, end));
                }
                //重新渲染block
                this.editor.createElement(to);
            });
            this.editor.cursor.restore();
            this.editor.actions.doInput();
        }
    }
}