/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */
let recordId = 1;
let records = {};
let mediaRecorder;
let constraints = {
    audio: {
      echoCancellation: {exact: true}
    },
    video: {
      width: 1280, height: 720
    }
  };

const errorMsgElement = document.querySelector('span#errorMsg');
const playerVideo = document.querySelector('video#player');
const recordButton = document.querySelector('button#record');
const historyList  = document.getElementById('history');
console.log(historyList);

recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
  }
});

/*const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});*/


function startRecording() {
    handleSuccess(window.stream);
    if(!mediaRecorder){
        mediaRecorder = new WebRecorder.WebRecorder({
            stream : window.stream
        })
        mediaRecorder.onstop = onRecordingStop;
        mediaRecorder.onerror = onRecordingError;
    }
       
    mediaRecorder.start().catch((e)=>{
        errorMsgElement.innerHTML = `WebRecorder.start. error:${e.toString()}`;
    });

    recordButton.textContent = 'Stop Recording';
}

function stopRecording() {
    mediaRecorder.stop();

}

function onRecordingError(err){
    recordButton.disabled = true;
    errorMsgElement.innerHTML = `WebRecorder.recording. error:${e.toString()}`;
}

function onRecordingStop(record){
    let id = recordId++;
    records[id] = record;
    recordButton.textContent = 'Start Recording';

    let li =document.createElement('LI');
    li.innerHTML = '#'+id;
    li.setAttribute('data-id',id);


    let playSpan = document.createElement('SPAN');
    playSpan.className = 'play';
    playSpan.innerHTML = 'play';
    playSpan.addEventListener('click',()=>{
        let record = records[id];
        playerVideo.src = null;
        playerVideo.srcObject = null;
        playerVideo.src = window.URL.createObjectURL(record.blob);
        playerVideo.controls = true;
        playerVideo.play();
    })

    let closeSpan = document.createElement('SPAN');
    closeSpan.className = 'close';
    closeSpan.innerHTML = 'X';
    closeSpan.addEventListener('click',()=>{
        delete records[id];
        li.parentNode.removeChild(li);
    })


    
    li.appendChild(playSpan);
    li.appendChild(closeSpan);
    historyList.appendChild(li);


}

function handleSuccess(stream) {
    recordButton.disabled = false;
    window.stream = stream;
    playerVideo.srcObject = stream;
  }

async function init() {

    try {
      let localStream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(localStream);
    } catch (e) {
      console.error('navigator.getUserMedia error:', e);
      errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }

  }

init();