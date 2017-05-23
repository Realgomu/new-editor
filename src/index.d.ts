import EE = EnrichEditor;

declare var EREditor: EnrichEditor.IEditorStatic;

declare module EnrichEditor {
    /** edtitor tool type enum [priority for render dom from page data] */
    const enum ToolType {
        None = 0,
        Br = 1,
        //inline
        Super = 20,
        Sub = 21,
        StrikeThrough = 30,
        Underline = 31,
        Italic = 40,
        Bold = 50,
        //inline block
        Link = 90,
        //block
        Paragraph = 100,
        Header,
        Pre = 110,
        //extend
        Quote = 200,
        OL,
        UL,
    }

    /** page dada */
    interface IPage {
        rows: IBlock[];
        extends?: any
    }

    /** block data */
    interface IBlock {
        rowid: string;
        token: string;
        type: ToolType;
        text: string;
        inlines: InlineMap;
        styles?: any;
        data?: any;
    }

    /** inlines map in block */
    type InlineMap = {
        [token: string]: IInline[]
    };

    /** inline data */
    interface IInline {
        type: ToolType;
        start: number;
        end: number;
        data?: any;
    }


    /** dom render node */
    interface IRenderNode {
        start: number;
        end: number;
        tag: string;
        content?: string;
        attr?: IAttributeMap;
        // children?: IRenderNode[];
    }

    /** dom render node attribute map */
    interface IAttributeMap {
        [name: string]: string
    }


    /**
     * key code enum
     */
    const enum KeyCode {
        BACKSPACE = 8,
        TAB = 9,
        ENTER = 13,
        ESCAPE = 27,
        SPACE = 32,
        Left = 37,
        Up = 38,
        Right = 39,
        Down = 40,
        DELETE = 46,
        K = 75,
        M = 77,
        V = 86,
        Y = 89,
        Z = 90
    }


    /** global editor obj on window for editor init*/
    interface IEditorStatic {
        new (el: Element, options: IEditorOptions): IEditor;
    }

    /** editor init options */
    interface IEditorOptions {
        /** 编辑器的tool配置,默认是'all'*/
        tools?: 'all' | string[];
        defaultUI?: boolean;
        inline?: boolean;
        toolbars?: string[];
    }

    /** 
     * editor instance 
     * @constructor
     */
    interface IEditor {
        options: EE.IEditorOptions;
        tools: ITools;
        selection: ISelection;
        actions: IActions;

        ownerDoc: Document;
        rootEl: Element;

        initContentEditable(el: HTMLElement): void;
        getData(): IPage;
        getRowData(rowid: string): EE.IBlock;
        getRowElementRoot(rowid: string): Element;
        interNewRow(rowid: string, focus?: boolean);
    }


    /** global tools container from editor */
    interface ITools {
        readonly enterTool: EE.IBlockTool;
        matchInlineTool(el: Element): IInlineTool;
        matchBlockTool(el: Element): IBlockTool;
        matchActionTool(name: string): IActionTool;
        matchToken(token: string): IEditorTool;
        getInlineTools(): IInlineTool[];
        getBlockTools(): IBlockTool[];
        getActiveTokens(el: Element): string[];
    }

    /** constructor function interface for editor tool class */
    interface IToolConstructor extends Function {
        new (...args: any[]): IEditorTool;
        prototype: {
            token?: string;
            type?: EE.ToolType;
        }
    }

    /** editor tool base interface */
    interface IEditorTool {
        readonly type: EE.ToolType;
        readonly token: string;
        selectors: string[];
    }

    /** action tool interface */
    interface IActionTool extends IEditorTool {
        action: string;
        useCommand?: boolean;
        redo: Function;
        undo: Function;
    }

    /** inline tool interface */
    interface IInlineTool extends IEditorTool {
        selectors: string[];
        getData(el: Element, start: number): EE.IInline;
        render(inline: EE.IInline): IRenderNode;
    }

    /** block tool interface */
    interface IBlockTool extends IEditorTool {
        selectors: string[];
        getData(el: Element): EE.IBlock;
        render(block: EE.IBlock): HTMLElement;
    }


    /** global event interface for editor */
    interface IEvents {

    }

    interface ICustomEventMap {
        [name: string]: IHandlerObj[];
    }

    interface IHandlerObj {
        name: string;
        listener: CommonListener;
        selector?: string;
    }

    type CommonListener = (editor: IEditor, ev: Event, ...args: any[]) => any;

    /** selection position, cursor position in block */
    interface ISelectionPosition {
        rowid: string;
        start: number;
        end: number;
        isCollapsed?: boolean;
        activeTokens?: string[];
    }

    /** global selection func for editor */
    interface ISelection {
        current(): ISelectionPosition;
        update(block?: Element): void;
        restore(block?: Element): void;
        moveTo(pos: EE.ISelectionPosition): void;
    }


    /** global action func for editor */
    interface IActions {
        doCommandAction(name: string, pos?: EE.ISelectionPosition): void;
        redo(): void;
        undo(): void;
        doEnter(ev: Event): void;
        doBackspace(): void;
    }

    /** action and command step from redo/undo */
    interface IActionStep extends ISelectionPosition {
        name: string;
        useCommand?: boolean;
    }


    /** default ui for editor */
    interface IDefaultUI {
        container: HTMLElement;
        toolbar: IToolbar;
    }

    /** toolbar ui for editor */
    interface IToolbar {

    }

    /** pop contianer ui for editor */
    interface IPopover {

    }

    interface IButtonOption {
        name: string;
        action: string;
        iconFA?: string;
        isDropdown?: boolean;
        text?: string;
        click?: Function;
    }
}

interface Node {
    $renderNode: any;
}