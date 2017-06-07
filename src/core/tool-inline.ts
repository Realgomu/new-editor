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

    readData(el: Element, start: number): EE.IInline {
        let inline: EE.IInline = {
            start: start,
            end: start + el.textContent.length,
        }
        return inline;
    }

    render(inline: EE.IInline, replaceText: Text) {
        let el = this.editor.renderElement({
            tag: this.selectors[0]
        });
        if (replaceText) {
            replaceText.parentNode.replaceChild(el, replaceText);
            el.appendChild(replaceText);
        }
        return el;
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
                    to.inlines[this.token] = this.$mergeApply(to.inlines[this.token], {
                        start: start,
                        end: end
                    });
                }
                else {
                    to.inlines[this.token] = this.$removeApply(to.inlines[this.token], {
                        start: start,
                        end: end
                    });
                }
                //重新渲染block
                this.editor.refreshElement(to);
            });
            this.editor.cursor.restore();
            this.editor.actions.doAction();
        }
    }
}