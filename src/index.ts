/// <reference path="index.d.ts" />

import * as Editor from './editor/index';

import './styles/index.less';

$(() => {
    let el = document.querySelector('#Editor');

    Editor.init(el);
    $('#GET').click(() => {
        console.log(Editor.getData());
    })
    $('.action').click(function() {
        let $btn = $(this);
        let action = $btn.attr('role');
        Editor.excuCommand(action);
    })
})
