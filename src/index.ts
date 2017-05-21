/// <reference path="index.d.ts" />

import { Editor } from 'core/editor';

import './styles/index.less';

$(() => {
    let el = document.querySelector('#Editor');

    let editor = new Editor(el as HTMLElement);
    $('#GET').click(() => {
        console.log(editor.getData());
    })
    $('.action').click(function () {
        let $btn = $(this);
        let action = $btn.attr('role');
        let option = $btn.attr('role-option');
        editor.excuCommand(action, option);
    });
})
