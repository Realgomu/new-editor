import EE = EnrichEditor;

declare var EREditor: EnrichEditor.IEditorStatic;

declare module EnrichEditor {
    /** edtitor tool type enum [priority for render dom from page data] */
    const enum ToolLevel {
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
        Hr = 100,
        Paragraph = 101,
        Header,
        Pre = 110,
        //other block
        List = 200,
        Quote = 210,
        //extends
        Align = 1000,
    }

    /** page dada */
    interface IPage {
        rows: IBlock[];
        extends?: any
    }

    type IBlockMap = {
        [id: string]: EE.IBlock;
    }

    const enum BlockType {
        Normal,
        Root,
        Leaf,
        Close,
    }

    interface IBlockNode {
        id: string;
        pid: string;
        children: IBlockNode[];
    }

    /** block data */
    interface IBlock {
        rowid: string;
        token: string;
        text: string;
        inlines: InlineMap;
        style?: any;
        pid?: string;
    }

    /** inlines map in block */
    type InlineMap = {
        [token: string]: IInline[]
    };

    /** inline data */
    interface IInline {
        start: number;
        end: number;
        data?: any;
    }


    /** dom render node */
    interface IRenderNode {
        tag: string;
        start?: number;
        end?: number;
        content?: string;
        attr?: IAttributeMap;
        children?: IRenderNode[];
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
        A = 65,
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

        ownerDoc: Document;
        rootEl: Element;

        // initContentEditable(el: HTMLElement): void;
        // getData(): IPage;
        // getRowData(rowid: string): EE.IBlock;
        // getRowElement(rowid: string): Element;
        // interNewRow(rowid: string, focus?: boolean);
    }

    /** constructor function interface for editor tool class */
    interface IToolConstructor extends Function {
        new (...args: any[]): IEditorTool;
        prototype: {
            token?: string;
            level?: ToolLevel;
            blockType?: BlockType;
        }
    }

    /** editor tool base interface */
    interface IEditorTool {
        readonly level: EE.ToolLevel;
        readonly token: string;
        readonly blockType?: BlockType;
        selectors?: string[];
        init?: Function;
        apply?: Function;
    }

    /** selection position, cursor position in block */
    interface ICursorPosition {
        rows: string[];
        start: number;
        end: number;
        collapsed?: boolean;
        mutilple?: boolean;
        atStart?: boolean;
        atEnd?: boolean;
    }
}

interface Node {
    $renderNode: any;
}