var interval = 60 * 1000;
var id = undefined;
var projectId = undefined;
var pointList;
var serverUrl = '';

function requestData() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200) {
            //将获取到的点值数据返回给主线程
            postMessage(JSON.parse(xhr.responseText));
            setTimeout(requestData, interval);
        }
        else {
            postMessage({error: '1000'});
        }
    };
    xhr.open("POST", serverUrl + "/api/get_realtimedata");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({proj: projectId, pointList: pointList}));
}

function messageHandler(e) {
    var type = e.data.type, name;
    switch (type) {
        case 'dataRealtime':
            projectId = e.data.projectId;
            id = e.data.id;
            pointList = e.data.pointList;
            serverUrl = e.data.serverUrl;
            requestData();
            break;
    }
}
//addEventListener("message", messageHandler, true);
