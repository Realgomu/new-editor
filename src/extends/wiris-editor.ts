import * as Util from 'core/util';

declare var com: any;

const editorOptions = {
    statEditor: 'GenericHTML',
    statSaveMode: 'xml',
    statVersion: '4.3.1.1367',
    baseUrl: 'http://www.wiris.net/demo/editor/editor',
    language: 'zh',
    toolbar: 'chemistry',
    randerUrl: 'http://test.xinpingzi.com:4002/integration/showimage.aspx',
}

let submitCB: Function;
let cancelCB: Function;
export function Init() {
    // Insert editor.
    let script = document.createElement('script');
    script.type = 'text/javascript';
    let editorUrl = editorOptions.baseUrl;
    // Change to https if necessary.
    if (window.location.href.indexOf("https://") == 0) {
        if (editorUrl.indexOf("http://") == 0) {
            editorUrl = "https" + editorUrl.substring(4);
        }
    }

    // Editor stats.
    script.src = editorUrl + "?lang=" + editorOptions.language + '&stats-editor=' + editorOptions.statEditor + '&stats-mode=' + editorOptions.statSaveMode + '&stats-version=' + editorOptions.statVersion;
    document.getElementsByTagName('head')[0].appendChild(script);
}

let editor: any;
let $wrapper: HTMLElement;

let html = `
<div class="modal-container">
<div class="modal-title"></div>
<div id="WRSEditor"></div>
<div class="modal-footer">
<button class="cancel">取消</button>
<button class="submit">确定</button>
</div>
</div>
`

function createModal() {
    if (!editor) {
        if (com.wiris.jsEditor.defaultBasePath) {
            editor = com.wiris.jsEditor.JsEditor.newInstance({
                language: editorOptions.language,
                toolbar: editorOptions.toolbar,
            });
        }
        else {
            editor = new com.wiris.jsEditor.JsEditor('editor', null);
        }
        console.log(editor);
        $wrapper = Util.CreateRenderElement(document, {
            tag: 'div',
            attr: {
                'class': 'wrs-editor-container'
            }
        });
        $wrapper.innerHTML = html;
        let btnCancel = $wrapper.querySelector('.cancel');
        let btnSubmit = $wrapper.querySelector('.submit');
        document.body.appendChild($wrapper);
        editor.insertInto(document.getElementById('WRSEditor'));
        //事件
        btnCancel.addEventListener('click', () => {
            HideModal();
            modalOptions && modalOptions.cancel && modalOptions.cancel();
        });
        btnSubmit.addEventListener('click', () => {
            let mathml = editor.getMathML();
            HideModal();
            modalOptions && modalOptions.submit && modalOptions.submit(mathml);
        });
    }
}

export interface IModalOptions {
    submit?: (mathml: string) => void;
    cancel?: () => void;
    mathml?: string;
}

let modalOptions: IModalOptions
export function OpenModal(options?: IModalOptions) {
    modalOptions = options;
    createModal();
    $wrapper.style.display = 'flex';
    if (options.mathml) {
        editor.setMathML(options.mathml);
    }
}

export function HideModal() {
    $wrapper.style.display = 'none';
}

export interface ISvgRenderResult {
    status: string;
    result: {
        baseline: string;
        content: string;
        format: string;
        height: string;
        width: string;
    }
}

export function RenderMathML(mathml: string, cb: (result: ISvgRenderResult) => void) {
    let request = new XMLHttpRequest();
    try {
        request.open('POST', editorOptions.randerUrl, true);
        // request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        let formData = new FormData();
        formData.append('mml', mathml);
        request.send(formData);
        request.onload = (ev) => {
            if (request.status === 200) {
                let result = JSON.parse(request.responseText);
                cb && cb(result);
            }
        }
    }
    catch (ex) {

    }
}