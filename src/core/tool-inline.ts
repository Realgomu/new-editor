export abstract class InlineTool implements EE.IInlineTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract selectors: string[];

    constructor(protected editor: EE.IEditor) {
    }

    protected $getData(el: Element, start: number): EE.IInline {
        let inline: EE.IInline = {
            type: this.type,
            start: start,
            end: start + el.textContent.length
        }
        return inline;
    }

    getData(el: Element, start: number): EE.IInline {
        return this.$getData(el, start);
    }

    redo() {

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
}