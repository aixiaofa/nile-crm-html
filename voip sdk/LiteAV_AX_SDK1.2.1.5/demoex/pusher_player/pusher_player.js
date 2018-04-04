
//////////////////////////////////////////////////////
//IPusherPluginCtrl
//////////////////////////////////////////////////////

function isRtmpUrl(strUrl) {
    var temp = "rtmp";
    return strUrl.indexOf(temp) >= 0;
}

function doStartPush(targetURL) {

    if (targetURL == "" || isRtmpUrl(targetURL) == false) {
        alert("请输入正确推流url");
    }
    else {
        pusher.setPusherEventCallBack(PusherEventListener, 100);
        pusher.setRenderWndSize(480, 360);
        pusher.startPush(targetURL);
    }
}
function doStopPush() {
    pusher.stopPush();
}

function refreshCamera() {
    var szRet = pusher.enumCameras();
    var obj = JSON.parse(szRet);
    if (obj.camera_cnt != 0) {
        for (var i = 0; i < obj.camera_cnt; ++i) {
            //jsCameraToSelect(obj.cameralist[i].id, obj.cameralist[i].name);
            //alert(obj.cameralist[i].name);
            var objSelect = document.getElementById('cameralistselect');
            objSelect.add(new Option(obj.cameralist[i].camera_name, obj.cameralist[i].id));
        }
        switchCameraSelect();
    }
    else {
        alert("无可用摄像头");
    }
}

function getNewPushUrl() {
    var szRet = pusher.getNewPushUrl();
    var obj = JSON.parse(szRet);
    if (obj.suc == 1) {
        document.getElementById('PusherUrlTextField').value = obj.push_url;
        document.getElementById('PlayerUrlTextField').value = obj.play_url;
    }
    else {
        alert("获取推流地址失败！");
    }
}

function switchCameraSelect() {
    var obj = document.getElementById('cameralistselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var val = obj.options[index].value;
    pusher.switchCamera(parseInt(val));
}

function BitrateModeChange() {
    var obj = document.getElementById('cameralistselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var name = obj.options[index].name;
    if (name == "超清") {
        pusher.setVideoBitRate(800);
    }
    else if (name == "高清") {
        pusher.setVideoBitRate(500);
    }
    else if (name == "标清") {
        pusher.setVideoBitRate(300);
    }
}

function doFpsRateSelect() {
    var obj = document.getElementById('fpsrateselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setVideoFPS(parseInt(value));
}

function ResolutionselectModeSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('resolutionselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setVideoResolution(parseInt(value));
}

function doRenderTypeSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('rendertypeselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setRenderMode(parseInt(value));
}

function doRotationSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('rotationselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setRotation(parseInt(value));
}

function doPusherEventCallBack(eventId, objectId, paramJson) {
    //200001 参考iOnEventCallBackDef.h
    if (eventId == 200001) {
        doUpdatePusherStatusInfo(paramJson);
    }
}
/* json 格式参考
root["cmd"] = eventId;
root["cookie"] = index;
root["cnt"] = paramCount;
for (int i = 0; i< paramCount; ++i)
{
	Json::Value jItem;
	jItem["key"] = paramKeys[i];
	jItem["value"] = paramValues[i];
}
root["paramlist"] = paramlist;
*/

function doUpdatePusherStatusInfo(paramJson) {
    var obj = JSON.parse(paramJson);
    if (obj.paramCnt != 0) {
        for (var i = 0; i < obj.paramCnt; ++i) {
            if(obj.paramlist[i].key == "VIDEO_BITRATE")
                document.getElementById('PUSHVIDEO_BITRATEID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "AUDIO_BITRATE")
                document.getElementById('PUSHAUDIO_BITRATEID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "VIDEO_FPS")
                document.getElementById('PUSHVIDEO_FPSID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "NET_SPEED")
                document.getElementById('PUSHNET_SPEEDID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "CACHE_SIZE")
                document.getElementById('PUSHCACHE_SIZEID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "VIDEO_WIDTH")
                document.getElementById('PUSHVIDEO_WIDTHID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "VIDEO_HEIGHT")
                document.getElementById('PUSHVIDEO_HEIGHTID').innerHTML = obj.paramlist[i].value;
            else if(obj.paramlist[i].key == "CODEC_CACHE")
                document.getElementById('PUSHCODEC_CACHEID').innerHTML = obj.paramlist[i].value;
        }
    }
}

//////////////////////////////////////////////////////
//IPlayerPluginCtrl
//////////////////////////////////////////////////////
//player interface
function doStartPlay(targetURL) {
    if (targetURL == "" || isRtmpUrl(targetURL) == false) {
        alert("请输入正确拉流url");
    }
    else {
        player.setTXEPlayType(1);
        player.setRenderWndSize(480, 360);
        player.setPlayerEventCallBack(PlayerEventListener, 200);
        player.startPlay(targetURL, 1);

    }
}
function doStopPlay() {
    player.stopPlay();
}


function doPlayerRenderTypeSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('player_rendertypeselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    player.setRenderMode(parseInt(value));
}

function doPlayerRotationSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('player_rotationselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    player.setRotation(parseInt(value));
}


function doPlayerEventCallBack(eventId, paramJson) {
    return;
    if (eventId == 200002) {
        doUpdatePlayerStatusInfo(paramJson);
    }
}

function doUpdatePlayerStatusInfo(paramJson) {
    var obj = JSON.parse(paramJson);
    if (obj.paramCnt != 0) {
        for (var i = 0; i < obj.paramCnt; ++i) {
            if (obj.paramlist[i].key == "VIDEO_BITRATE")
                document.getElementById('PLAYVIDEO_BITRATEID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "AUDIO_BITRATE")
                document.getElementById('PLAYAUDIO_BITRATEID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "VIDEO_FPS")
                document.getElementById('PLAYVIDEO_FPSID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "NET_SPEED")
                document.getElementById('PLAYNET_SPEEDID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "CACHE_SIZE")
                document.getElementById('PLAYCACHE_SIZEID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "VIDEO_WIDTH")
                document.getElementById('PLAYVIDEO_WIDTHID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "VIDEO_HEIGHT")
                document.getElementById('PLAYVIDEO_HEIGHTID').innerHTML = obj.paramlist[i].value;
            else if (obj.paramlist[i].key == "CODEC_CACHE")
                document.getElementById('PLAYCODEC_CACHEID').innerHTML = obj.paramlist[i].value;
        }
    }
}

var PusherEventListener = function (msg) {
    var obj = JSON.parse(msg);
    if (parseInt(obj.eventId) == 200001) {
        doUpdatePusherStatusInfo(msg);
    }
};

var PlayerEventListener = function (msg) {
    var obj = JSON.parse(msg);
    if (parseInt(obj.eventId) == 200002 && parseInt(obj.objectId) == 200) {
        doUpdatePlayerStatusInfo(msg);
    }
};