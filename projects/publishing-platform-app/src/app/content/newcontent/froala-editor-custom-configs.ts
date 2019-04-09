declare const $: any;

export const FroalaEditorCustomConfigs = function () {

    $.FE.VIDEO_PROVIDERS.push({
        test_regex: /^.+(media.tagesschau.de|tagesschau.de)\/(video)?\/?([^_]+)[^#]*(#video=([^_&]+))?/,
        url_regex: /(?:https?:\/\/)?(?:www\.)?(?:media.tagesschau\.de|tagesschau\.de)\/(?:video)?\/?(.+)/g,
        url_text: 'https://media.tagesschau.de/video/$1',
        html:
            '<iframe width="640" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
        provider: 'tagesschau'
    });

    // $.FroalaEditor.DefineIcon('videoCaption', {NAME: 'commenting'});
  //     // $.FroalaEditor.RegisterCommand('videoCaption', {
  //     //     title: 'Video Caption',
  //     //     focus: false,
  //     //     refreshAfterCallback: false,
  //     //     callback: function (cmd) {
  //     //         const result = this.shared.popup_buttons.filter(
  //     //             item => item.getAttribute('data-cmd') == cmd
  //     //         )[0];
  //     //         const $btn = $(result);
  //     //         const $tb = $(this.shared.popups['video.edit'][0]);
  //     //         $(this.shared.$tb[0])
  //     //             .find('button')
  //     //             .removeClass('fr-disabled');
  //     //         if (!$btn.hasClass('active-caption')) {
  //     //             const videoContentBeforeSelection = this.video.get()[0];
  //     //             const parentElement = $(videoContentBeforeSelection).closest('p');
  //     //             parentElement.find('br:last-child').remove();
  //     //             parentElement.after('<p><br></p>');
  //     //             const span = document.createElement('span');
  //     //             span.contentEditable = 'true';
  //     //             span.classList.add('video_caption');
  //     //             span.classList.add('fr-inner');
  //     //             span.innerHTML = '&#xfeff;Video description';
  //     //             span.addEventListener('click', function (e) {
  //     //                 e.preventDefault();
  //     //                 e.stopPropagation();
  //     //             });
  //     //
  //     //             span.addEventListener('keydown', function (e) {
  //     //                 const selection = window.getSelection();
  //     //                 if (
  //     //                     selection.rangeCount > 0 &&
  //     //                     selection.getRangeAt(0).startOffset == 0 &&
  //     //                     e.keyCode === 8 &&
  //     //                     span.innerText.length > 0 &&
  //     //                     document.getSelection().toString() !== ''
  //     //                 ) {
  //     //                     e.preventDefault();
  //     //                     e.stopPropagation();
  //     //                     if (span.textContent[0] !== '\uFEFF') {
  //     //                         span.innerHTML = '&#xfeff;' + span.textContent;
  //     //                     }
  //     //                     selection.getRangeAt(0).setStart(span, 0);
  //     //                 } else if (
  //     //                     span.innerHTML.replace(/[^\x00-\x7F]/g, '').length == 0 &&
  //     //                     e.keyCode === 8
  //     //                 ) {
  //     //                     span.parentNode.removeChild(span);
  //     //                 }
  //     //             });
  //     //
  //     //             videoContentBeforeSelection.insertAdjacentElement('beforeend', span);
  //     //             $btn.addClass('active-caption');
  //     //             $tb.removeClass('fr-active');
  //     //             span.focus();
  //     //         } else {
  //     //             if (this.video.get()) {
  //     //                 const videoContentBeforeSelection = this.video.get()[0];
  //     //                 const captionSpan = videoContentBeforeSelection.getElementsByClassName(
  //     //                     'video_caption'
  //     //                 );
  //     //                 if (captionSpan != null && captionSpan.length > 0 && captionSpan[0]) {
  //     //                     captionSpan[0].parentNode.removeChild(captionSpan[0]);
  //     //                 }
  //     //                 $btn.removeClass('active-caption');
  //     //             }
  //     //         }
  //     //     },
  //     //     refresh: function ($btn) {
  //     //         if (this.video.get()) {
  //     //             const videoContentBeforeSelection = this.video.get()[0];
  //     //             const captionSpan = videoContentBeforeSelection.getElementsByClassName(
  //     //                 'video_caption'
  //     //             );
  //     //             if (captionSpan != null && captionSpan.length > 0 && captionSpan[0]) {
  //     //                 $btn.addClass('active-caption');
  //     //             } else {
  //     //                 $btn.removeClass('active-caption');
  //     //             }
  //     //         }
  //     //     }
  //     // });
};
