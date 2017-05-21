/// <reference path="index.d.ts" />

import { Editor } from 'core/editor';

import './styles/index.less';

$(() => {
    let el = document.querySelector('#Editor');

    let editor = new Editor(el);
    $('#GET').click(() => {
        console.log(editor.getData());
    })
    $('.action').click(function () {
        let $btn = $(this);
        let action = $btn.attr('role');
        editor.excuCommand(action);
    })
})
