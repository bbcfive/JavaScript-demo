import { Sprite } from '../sprites';

var configMap = {
    heat_radius: 15,
    heat_blur: 40,
    heat_interval_y: 15,
    heat_interval_x: 20,
    maxDistanceToCalc: 200,
    limitedDistance: 50,
    TEMP_RANGE: {
        min: 20,
        max: 30
    }
};

function getHeatData(data) {
    var result = [];
    for (var n = 0, len = data.length; n < len; n++) {
        var item = data[n], temp = +item.value;
        result.push([item.x, item.y, temp ? temp : 0])
    }
    return result;
}

function getTwoPointDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((Math.abs(x2) - Math.abs(x1)), 2) + Math.pow((Math.abs(y2) - Math.abs(y1)), 2));
}

function calcPointTemp(x, y, heatData) {
    if (!heatData || heatData.length === 0) {
        return
    }
    var temp = 0, distanceTotal = 0,
        confortableLength = (configMap.TEMP_RANGE.max - configMap.TEMP_RANGE.min) / 2,
        confortableTemp = configMap.TEMP_RANGE.max - confortableLength;

    for (var m = 0, mlen = heatData.length; m < mlen; m++) {
        var heatDataItem = heatData[m], distance = getTwoPointDistance(x, y, heatDataItem[0], heatDataItem[1]);
        var heatDataItemTemp = heatDataItem[2];
        if (distance === 0) {
            return Number(heatDataItemTemp);
        }
        if (distance > configMap.maxDistanceToCalc) {
            continue;
        }
        if (heatDataItemTemp > 50 || heatDataItemTemp < 0) {
            continue;
        }

        if (distance < configMap.limitedDistance) {
            //过热、过冷另行处理
            if (heatDataItemTemp > configMap.TEMP_RANGE.max) {
                return configMap.TEMP_RANGE.max;
            }
            if (heatDataItemTemp < configMap.TEMP_RANGE.min) {
                return configMap.TEMP_RANGE.min;
            }
            return heatDataItemTemp;
        }

        temp += (heatDataItemTemp && distance) ? heatDataItemTemp / distance : heatDataItemTemp;
        distanceTotal += 1 / (distance * 0.9);
    }
    if (!distanceTotal) {
        distanceTotal = 1;
    }
    temp = temp / distanceTotal;
    return Number(temp);
}

function calcAllTempData(rawData, x, y, w, h) {
    if (!rawData) {
        return [];
    }

    var heatData = getHeatData(rawData),
        maxX = x + w,
        maxY = y + h,
        yInterval = configMap.heat_interval_y,
        xInterval = configMap.heat_interval_x,
        allTempPoint = [];

    for (var m = x - 5 * xInterval; m < maxX + 5 * xInterval; m = m + xInterval) {
        for (var n = y - 5 * yInterval; n < maxY + 5 * yInterval; n = n + yInterval) {
            var temp = calcPointTemp(m, n, heatData);
            if (typeof temp === 'undefined') {
                continue;
            }
            temp = Number(temp.toFixed(2));
            if (typeof temp != 'number' || temp < 0) {
                temp = 0;
            }
            allTempPoint.push([Number(m.toFixed(2)), Number(n.toFixed(2)) - y, temp]);
        }
    }
    return allTempPoint;
}


function ModelTempDistribution(id, painter, behaviors, pageScreen) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = {
        paint: this.paint
    };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.canvasOffline = document.createElement("canvas");
    this.ctxOffline = this.canvasOffline.getContext("2d");

    this.heat = undefined;

    this.data = [];
    //兼容新版热力图
    this.pageScreen = pageScreen;
}

ModelTempDistribution.prototype = new Sprite();
ModelTempDistribution.prototype.constructor = ModelTempDistribution;

ModelTempDistribution.prototype.close = function () {
    this.canvasOffline = null;
    this.ctxOffline = null;
    this.data = [];
    this.heat.destroy();
    this.heat = null;
};

ModelTempDistribution.prototype.init = function () {
    this.canvasOffline.width = this.width;
    this.canvasOffline.height = this.height;
};

//var data = {
//            "CO": {
//                "max": {"color": "red", "value": 49},
//                "min": {"color": "blue", "value": 26}
//            },
//            "temperature": {
//                "max": {"color": "red", "type": "max", "value": 49},
//                "min": {"color": "blue", "type": "min", "value": 26}
//            }
//};

ModelTempDistribution.prototype.resetMaxMinTemp = function () {
    configMap.TEMP_RANGE.max = 30;
    configMap.TEMP_RANGE.min = 20;
};

ModelTempDistribution.prototype.setMaxMinTemp = function () {
    var tempSetType, setValue;

    if (this.colorSettings) {
        for (tempSetType in this.colorSettings) {
            if (this.colorSettings.hasOwnProperty(tempSetType)) {
                if (tempSetType == 'max') {
                    setValue = this.colorSettings[tempSetType].value;
                    configMap.TEMP_RANGE.max = (typeof setValue == 'undefined' || setValue === '') ? 30 : Number(setValue);
                } else if (tempSetType == 'min') {
                    setValue = this.colorSettings[tempSetType].value;
                    configMap.TEMP_RANGE.min = (typeof setValue == 'undefined' || setValue === '') ? 20 : Number(setValue);
                }
            }
        }
    } else {
        this.resetMaxMinTemp();
    }
};

ModelTempDistribution.prototype.paint = function (ctx) {
    ctx.rect(this.x, this.y, this.canvasOffline.width, this.canvasOffline.height);
    ctx.drawImage(this.canvasOffline, this.x, this.y);
};

ModelTempDistribution.prototype.update = function (updateData) {
    if (!updateData || !this.width || !this.height) {
        return;
    }
    for (var m = 0; m < this.data.length; m++) {
        for (var n = 0; n < updateData.length; n++) {
            if (this.data[m].idCom === updateData[n].name) {
                this.data[m].value = updateData[n].value;
                break;
            }
        }
    }
    this.renderTempDistribution();
};

ModelTempDistribution.prototype.filterBadPoint = function (rowData) {
    if (!rowData) {
        return [];
    }
    var result = [];
    for (var i = 0; i < rowData.length; i++) {
        if (rowData[i].idCom && rowData[i].value && rowData[i].value > 0 && rowData[i].value < 50) {
            result.push(rowData[i]);
        }
    }
    return result;
};

ModelTempDistribution.prototype.renderTempDistribution = function () {
    var _this = this, heat;
    _this.setMaxMinTemp();
    _this.data = _this.filterBadPoint(_this.data);
    var allHeatData = calcAllTempData(_this.data, _this.x, _this.y, _this.width, _this.height);
    //新版热力图刷新
    if(_this.pageScreen){
        _this.pageScreen.renderLastData()
    }
    if (!allHeatData || !allHeatData.length) {
        return;
    }
    _this.heat = simpleHeat(_this.ctxOffline.canvas).data(allHeatData);
    _this.heat.max(configMap.TEMP_RANGE.max);
    _this.heat.min(configMap.TEMP_RANGE.min);
    _this.heat.draw();
};

//显示温度标尺
ModelTempDistribution.prototype.createHeatRuler = function (ctx, x, y) {
    var x = x ? x : 20,
        y = y ? y : ctx.canvas.height - 280;
    var _this = this;
    if (!_this.heat) return;

    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#eee';
    CanvasGeometry.fillRadiusRect(ctx, x - 3, y - 3, 40, 262, 3);
    ctx.fill();

    ctx.drawImage(_this.heat.canvsdpalette, x, y, 34, 256);

    ctx.fillStyle = '#eee';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(configMap.TEMP_RANGE.min, x + 6, y + 26);
    ctx.fillText(configMap.TEMP_RANGE.max, x + 6, y + 246);
    ctx.restore();
};

export default ModelTempDistribution;
