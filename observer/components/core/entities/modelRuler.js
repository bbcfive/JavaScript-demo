import { Sprite } from '../sprites';


var PANEL_DECIMAL_PRECISION = 2,
    GRADUATION_MAIN_HEIGHT = 28,
    GRADUATION_HALF_HEIGHT = 10,
    GRADUATION_TENTH_HEIGHT = 5,
    COLOR_IMPROVEMENT = '#d17965',
    COLOR_FAIR = '#d4861e',
    COLOR_GOOD = '#5b9d00',
    COLOR_EXCELLENT = '#0078b6';

var isLoaded = false;

var panel_change_max = 300, panel_change_rate = 6, panel_change_current = 0, panel_change_value = 0, panel_change_value_direc = 1;

function changeRangeIndex() {
    if (panel_change_value === 0) {
        panel_change_value_direc = 1;
    } else if (panel_change_value === 1) {
        panel_change_value_direc = -1;
    }
    panel_change_value = panel_change_value + panel_change_value_direc;
}

function drawReferrencePanel(context, x, y, w, h, isCurrentProject) {
    context.save();
    context.shadowColor = "RGBA(100,100,100,1)";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.shadowBlur = 0;
    if (isCurrentProject) {
        if (panel_change_current > panel_change_max) {
            panel_change_current = 0;
            changeRangeIndex();
        } else {
            panel_change_current += panel_change_rate;
        }
        switch (panel_change_value) {
            case 0: context.fillStyle = "#FF9900"; break;
            case 1: context.fillStyle = "#FFF"; break;
        }
    } else {
        context.fillStyle = "RGBA(255,255,255,1)";
    }

    CanvasGeometry.fillRadiusRect(context, x, y, w, h, 3);
    context.fill();

    context.restore();
}

function drawbutton(ctx, x, y, text) {
    if (document.querySelectorAll('.check-big-data').length !== 0) {
        return;
    }
    let btn = document.createElement('div');
    btn.class = 'check-big-data ant-btn';
    btn.style.position = 'absolute';
    btn.style.top = `${y+100}px`;
    btn.style.left = `${x}px`;
    btn.style.float = 'right';
    btn.style.fontSize = '18px';
    btn.style.fontFamily = '微软雅黑';
    btn.style.boxShadow = '0px 2px #666';
    
    let _this = this;
    btn.onclick = function() {
        _this.isBigDataLoad = !_this.isBigDataLoad;
    };
    document.querySelector('#divMain').appendChild(btn);
}

function getColorByAppraise(appraisement) {
    if (!appraisement) return '';
    var result = null;
    var o=I18n.resource.observer.entities;
    switch (appraisement) {
        case o.RELATIVELY_POOR: result = COLOR_IMPROVEMENT; break;
        case o.GENERAL: result = COLOR_FAIR; break;
        case o.GOOD: result = COLOR_GOOD; break;
        case o.EXCELLENT: result = COLOR_EXCELLENT; break;
    }
    return result;
}

function ModelRuler(screen, id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = {
        paint: this.paint
    };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.screen = screen;
    this.canvasOffline = document.createElement("canvas");
    this.ctxOffline = this.canvasOffline.getContext("2d");
    this.maxValue = undefined;
    this.minValue = undefined;
    this.name = undefined;
    this.decimal = undefined;
    this.mainScale = undefined;
    this.minorScale = undefined;
    this.idCom = undefined;
    this.list = new Array();
    this.levels = new Array();
    this.references = new Array();
    this.isInitFinished = false;
    this.plantIcon = new Image();
    this.plantIcon.src = '/static/images/plant_icon.png';
    this.isBigDataLoad = false
};

ModelRuler.prototype = new Sprite();

ModelRuler.prototype.close = function () {
    this.canvasOffline = null;
    this.ctxOffline = null;

    let node = document.querySelector('#divMain .check-big-data');
    node.parentNode.removeChild(node);
}

ModelRuler.prototype.paint = function (ctx) {
    var _this = this;

    ctx.drawImage(this.canvasOffline, this.x, this.y);
    if (!this.references || this.references.length === 0) {
        return;
    }
    if(!this.isInitFinished){
        var ANIMATION_INTERVAL = 0.01,
                ANIMATION_DECIMAL_PRECISION = 3
    }else{
        var ANIMATION_INTERVAL = this.mainScale ? Number(this.mainScale) / 20 : 0.01,
                ANIMATION_DECIMAL_PRECISION = 3
    }
    var that = this, PANEL_WIDTH = 147, tempHeigth = this.height / 5, PANEL_MARGIN = 5;

    for (var rInd = 0, rLen = this.references.length; rInd < rLen; rInd++) {
        var ref = this.references[rInd];
        ref.joinPoint = null;
        ref.arrowPoint = null;
        ref.panel = null;
        ref.value = Number(ref.value).toFixed(PANEL_DECIMAL_PRECISION);
        if(Number(ref.isInUp) === 1){
            this.references[rInd] = new ModelRulerCurrentReference(ref, this);
        }else{
            this.references[rInd] = new ModelRulerReference(ref, this);
        }
    }

    function checkValue(value, maxValue, minValue) {
        if (value > maxValue) {
            return maxValue;
        } else if (value < minValue) {
            return minValue;
        } else {
            return value;
        }
    }

    var getDownJoinPoint = function (item) {
        var itemValue = checkValue(item.currentDrawValue, that.maxValue, that.minValue);
        return {
            X: that.x + 20 + (that.width - 40) * (itemValue - that.minValue) / (that.maxValue - that.minValue),
            Y: that.y + that.height - tempHeigth + 10
        }
    },
    getUpJoinPoint = function (item) {
        var itemValue = checkValue(item.currentDrawValue, that.maxValue, that.minValue);
        return {
            X: that.x + 20 + (that.width - 40) * (itemValue - that.minValue) / (that.maxValue - that.minValue),
            Y: that.y + tempHeigth - 10
        }
    },
    getUpArrowPoint = function (item) {
        var itemValue = checkValue(item.currentDrawValue, that.maxValue, that.minValue);
        return {
            X: that.x + 20 + (that.width - 40) * (itemValue - that.minValue) / (that.maxValue - that.minValue),
            Y: that.y + that.height / 2 - 35
        }
    },
    getDownArrowPoint = function (item) {
        var itemValue = checkValue(item.currentDrawValue, that.maxValue, that.minValue);
        return {
            X: that.x + 20 + (that.width - 40) * (itemValue - that.minValue) / (that.maxValue - that.minValue),
            Y: that.y + that.height / 2 + 35
        }
    };

    var compareJoinPoint = function (thisJoinPoint, comparedPoint) {
        var comparedValue = thisJoinPoint.X - comparedPoint.X
        if (Math.abs(comparedValue) < (PANEL_WIDTH)) {
            thisJoinPoint.X += Math.abs(PANEL_WIDTH - comparedValue) + 5
            return thisJoinPoint;
        }
        return null;
    }

    this.references.sort(function (itemA, itemB) {
        return Number(itemA.currentDrawValue) - Number(itemB.currentDrawValue);
    });

    var upRefs = this.references.filter(function (val, index) {
        return Number(val.isInUp) == 0 && index % 2 === 1;
    });
    var downRefs = this.references.filter(function (val, index) {
        return Number(val.isInUp) == 0 && index % 2 === 0;
    });

    upRefs.push(this.references.filter(function(val, index){
        return Number(val.isInUp) != 0;
    })[0])

    upRefs.sort(function (itemA, itemB) {
        return Number(itemA.currentDrawValue) - Number(itemB.currentDrawValue);
    });
    downRefs.sort(function (itemA, itemB) {
        return Number(itemA.currentDrawValue) - Number(itemB.currentDrawValue);
    });

    var reverseCheck = function (refs, index, item, itemIndex, getJoinPoint) {
        for (var n = index - 1; n > -1; n--) {
            if (n === itemIndex) {
                continue;
            }
            var comparedJoinPoint = refs[n].joinPoint ? refs[n].joinPoint : getJoinPoint(refs[n]);
            var comparedResult = compareJoinPoint(item.joinPoint, comparedJoinPoint);
            if (comparedResult) {
                item.joinPoint = comparedResult;
                return true;
            }
        }
        return false;
    }

    var handleRefs = function (refs, isUpRef) {
        if (isUpRef) {
            var getJoinPoint = getUpJoinPoint, getArrowPoint = getUpArrowPoint;
        } else {
            var getJoinPoint = getDownJoinPoint, getArrowPoint = getDownArrowPoint;
        }
        for (var i = 0; i < refs.length; i++) {

            var currentRef = refs[i];
            currentRef.isUpRef = isUpRef;
            if (!currentRef.currentDrawValue) {
                currentRef.currentDrawValue = currentRef.value;
            }

            if(isLoaded && Number(currentRef.value) === 0){
                currentRef.currentDrawValue = Number(currentRef.value);
            }

            if (Number(currentRef.currentDrawValue) < Number(currentRef.value)) {
                currentRef.currentDrawValue = (Number(currentRef.currentDrawValue) + ANIMATION_INTERVAL).toFixed(ANIMATION_DECIMAL_PRECISION);
            } else if (Number(currentRef.currentDrawValue) > Number(currentRef.value)) {
                currentRef.currentDrawValue = (Number(currentRef.currentDrawValue) - ANIMATION_INTERVAL).toFixed(ANIMATION_DECIMAL_PRECISION);
            }else if(Number(currentRef.value) != 0){
                isLoaded = true;
            }else{
                this.isInitFinished = true;
            }
            var currentJoinPoint = getJoinPoint(currentRef);
            currentRef.arrowPoint = getArrowPoint(currentRef);
            if (i === 0) {
                currentRef.joinPoint = currentJoinPoint;
            } else {
                var lastRef = refs[i - 1], lastJoinPoint = lastRef.joinPoint;
                var comparedResult;
                lastJoinPoint && (comparedResult = compareJoinPoint(currentJoinPoint, lastJoinPoint));

                if (comparedResult) {
                    currentRef.joinPoint = comparedResult;
                }

                if (!currentRef.joinPoint) {
                    currentRef.joinPoint = currentJoinPoint;
                }
            }

            while (reverseCheck(refs, i, currentRef, i, getJoinPoint)) {
            };

            currentRef.panel = {
            };
            currentRef.panel.x = currentJoinPoint.X - PANEL_WIDTH / 2;
            currentRef.panel.y = isUpRef ? currentJoinPoint.Y - tempHeigth : currentJoinPoint.Y;
            currentRef.panel.w = PANEL_WIDTH;
            currentRef.panel.h = tempHeigth;
        }
    };
    if(!this.isBigDataLoad){
        downRefs = [];
        upRefs = upRefs.filter(function(item){
            if(Number(item.isInUp) === 1){
                return true;
            }
        })
    }

    handleRefs(upRefs, true);
    handleRefs(downRefs, false);

    var refs = upRefs.concat(downRefs);

    for (var i = 0; i < refs.length; i++) {
        refs[i].value && Number(refs[i].value) && this.drawReference(ctx, refs[i]);
    }

    updateToHitModel();

    function updateToHitModel() {
        var ScreenCurrent = _this.screen;
        if (!ScreenCurrent) {
            return
        };
        ScreenCurrent.hitModel.remove(ScreenCurrent.enmuElementType.ruler);
        for (var n = 0, len = that.references.length; n < len; n++) {
            var ref = that.references[n];

            Number(ref.value) !== 0
            && ref.panel
            && ScreenCurrent.hitModel.add(that.id + '_' + n, ScreenCurrent.enmuElementType.ruler, ref.panel.x, ref.panel.y, ref.panel.w, ref.panel.h);
        }
    }
},

ModelRuler.prototype.init = function () {

    this.canvasOffline.width = this.width;
    this.canvasOffline.height = this.height;
    var ctx = this.ctxOffline;
    var geometry = new CanvasGeometry(ctx);
    ctx.clearRect(0, 0, this.canvasOffline.width, this.canvasOffline.height);

    //drawbutton(ctx, this.width, this.height, '大数据对比');

    //draw ruler pane
    var length = this.maxValue - this.minValue;
    var paneY = this.height / 3, paneHeight = this.height / 3, paneX, paneWidth;
    var gradient = ctx.createLinearGradient(0, paneY, 0, paneY + paneHeight);
    gradient.addColorStop(0, "#f1f1f1");
    gradient.addColorStop(0.2, "#fff");
    gradient.addColorStop(0.6, "#fff");
    gradient.addColorStop(1, "#e3e3e3");
    ctx.fillStyle = gradient;
    ctx.lineWidth = 0;
    CanvasGeometry.fillRadiusRect(ctx, 0, paneY, this.width, paneHeight, 15);
    ctx.fill();

    //draw level pane
    paneX = 15;
    paneY += paneHeight / 3 - 3;
    paneHeight = paneHeight / 3 + 6;
    paneWidth = this.width - 30;

    var gradient = ctx.createLinearGradient(0, paneY, 0, paneY + paneHeight);
    gradient.addColorStop(0, "#989898");
    gradient.addColorStop(0.2, "#e3e3e3");
    gradient.addColorStop(0.8, "#fff");
    ctx.fillStyle = gradient;
    ctx.lineWidth = 0;
    CanvasGeometry.fillRadiusRect(ctx, paneX, paneY, paneWidth, paneHeight, 5);
    ctx.fill();

    //draw each level color pane
    paneX += 5;
    paneY += 3;
    paneHeight -= 6;
    paneWidth -= 10
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#323232";

    for (var i = 0; i < this.levels.length; i++) {
        var tempX = paneX + paneWidth * (this.levels[i].min - this.minValue) / length;
        var tempWidth = paneWidth * (this.levels[i].max - this.levels[i].min) / length;
        ctx.save();
        ctx.fillStyle = this.levels[i].color;
        ctx.fillRect(tempX, paneY, tempWidth, paneHeight);
        ctx.restore();
        ctx.save();
        ctx.font = "22px 微软雅黑";
        ctx.fillText(this.levels[i].text, tempX + tempWidth / 2, paneY + paneHeight / 2);
        ctx.restore();
    }

    if (this.mainScale == 0) {
        alert(I18n.resource.observer.entities.MAIN_SCALE_INFO);
        return;
    }

    //draw up scale
    var scaleY = paneY - 4;
    var unitWidth = paneWidth / length * this.mainScale, tenthUnitWidth = unitWidth / 10;
    ctx.lineWidth = 1;
    ctx.fillStyle = "#666666";
    for (var i = 0; i <= length / this.mainScale + 1; i++) {
        var tempX = paneX + i * unitWidth;
        ctx.strokeStyle = "#999999";
        ctx.beginPath();
        ctx.moveTo(tempX, scaleY);
        ctx.lineTo(tempX, scaleY - 15);
        ctx.closePath();
        ctx.stroke();

        ctx.save();
        ctx.font = "16px 微软雅黑";
        ctx.fillText((parseFloat(this.minValue) + this.mainScale * i).toFixed(this.decimal), tempX, scaleY - GRADUATION_MAIN_HEIGHT); //text
        ctx.restore();

        ctx.strokeStyle = "#cccccc";
        ctx.beginPath();
        ctx.moveTo(tempX + unitWidth / 2, scaleY);
        ctx.lineTo(tempX + unitWidth / 2, scaleY - GRADUATION_HALF_HEIGHT);
        ctx.closePath();
        ctx.stroke();
        var tenthX = 0;
        for (var count = 1; count < 10; count++) {
            tenthX = tempX + tenthUnitWidth * count;
            if (tenthX < (tempX + unitWidth)) {
                ctx.strokeStyle = "#cccccc";
                ctx.beginPath();
                ctx.moveTo(tenthX, scaleY);
                ctx.lineTo(tenthX, scaleY - GRADUATION_TENTH_HEIGHT);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    //draw down scale
    scaleY = paneY + paneHeight + 1;
    unitWidth = paneWidth / length * this.mainScale;
    for (var i = 0; i <= length / this.mainScale + 1; i++) {
        var tempX = paneX + i * unitWidth;
        ctx.strokeStyle = "#999999";
        ctx.beginPath();
        ctx.moveTo(tempX, scaleY);
        ctx.lineTo(tempX, scaleY + 15);
        ctx.closePath();
        ctx.stroke();

        ctx.save();
        ctx.font = "16px 微软雅黑";
        ctx.fillText((parseFloat(this.minValue) + this.mainScale * i).toFixed(this.decimal), tempX, scaleY + GRADUATION_MAIN_HEIGHT); //text
        ctx.restore();

        ctx.strokeStyle = "#cccccc";
        ctx.beginPath();
        ctx.moveTo(tempX + unitWidth / 2, scaleY);
        ctx.lineTo(tempX + unitWidth / 2, scaleY + GRADUATION_HALF_HEIGHT);
        ctx.closePath();
        ctx.stroke();

        var tenthX = 0;
        for (var count = 1; count < 10; count++) {
            tenthX = tempX + tenthUnitWidth * count;
            if (tenthX < (tempX + unitWidth)) {
                ctx.strokeStyle = "#cccccc";
                ctx.beginPath();
                ctx.moveTo(tenthX, scaleY);
                ctx.lineTo(tenthX, scaleY + GRADUATION_TENTH_HEIGHT);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }


},

ModelRuler.prototype.update = function (pointName, value) {
    for (var i = 0; i < this.references.length; i++) {
        if (this.references[i].idCom == pointName) {
            this.references[i].value = value;
        }
    }
},

ModelRuler.prototype.drawReference = function (ctx, item) {
    if (Number(item.value) === 0) {
        return;
    }
    ctx.save();
    //draw current label
    var tempHeigth = this.height / 5;

    var joinPoint = item.joinPoint,
        arrowPoint = item.arrowPoint,
        panelPoint = item.panel,
        isCurrentProject = Number(item.isInUp) === 1;


    if (item.isZoom) {
        panelPoint.w += 30;
        panelPoint.h += 20;
        panelPoint.x -= 15;
        panelPoint.y -= 15
        item.isUpRef ? joinPoint.Y += 5 : joinPoint.Y -= 14;
    }

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    //draw arrow
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(arrowPoint.X, arrowPoint.Y);
    ctx.lineTo(joinPoint.X, joinPoint.Y);
    ctx.lineTo(joinPoint.X + 7, joinPoint.Y);
    ctx.closePath();
    ctx.fillStyle = "#939393";
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.moveTo(arrowPoint.X, arrowPoint.Y);
    ctx.lineTo(joinPoint.X, joinPoint.Y);
    ctx.lineTo(joinPoint.X - 7, joinPoint.Y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    //标尺上的当前值的线
    ctx.save();
    ctx.fillStyle = "#ddd";
    ctx.fillRect(arrowPoint.X - 1, item.isUpRef ? arrowPoint.Y : arrowPoint.Y - 18, 2, 18);
    ctx.restore();

    //draw pane
    drawReferrencePanel(ctx, panelPoint.x, panelPoint.y, panelPoint.w, panelPoint.h, isCurrentProject);

    ctx.save();
    var zoomChangeHeight = item.isZoom ? 5 : 0;
    //value
    var itemValue = parseFloat(item.currentDrawValue).toFixed(PANEL_DECIMAL_PRECISION);
    if(isCurrentProject){
        switch (panel_change_value) {
            case 0: ctx.fillStyle = "#FFF"; break;
            case 1: ctx.fillStyle = "#FF9900"; break;
        }
        ctx.font = "25px 微软雅黑";
        ctx.fillText(itemValue, joinPoint.X, panelPoint.y + tempHeigth / 7 * 5 + zoomChangeHeight);
    }else{
        if (itemValue < this.levels[0].min) {
            ctx.fillStyle = COLOR_EXCELLENT;
        } else if (itemValue > this.levels[this.levels.length - 1].max) {
            ctx.fillStyle = COLOR_IMPROVEMENT;
        } else {
            for (var j = 0; j < this.levels.length; j++) {
                if (Number(itemValue) >= Number(this.levels[j].min) && Number(itemValue) <= Number(this.levels[j].max)) {
                    ctx.fillStyle = getColorByAppraise(this.levels[j].text);
                    break;
                }
            }
        }
        ctx.font = "25px 微软雅黑";
        ctx.fillText(itemValue, joinPoint.X + 8, panelPoint.y + tempHeigth / 7 * 5 + zoomChangeHeight);
    }

    var valueStyle = ctx.fillStyle;

    //text
    if(isCurrentProject){
        switch (panel_change_value) {
            case 0: ctx.fillStyle = "#FFF"; break;
            case 1: ctx.fillStyle = "#FF9900"; break;
        }

        ctx.font = "18px 微软雅黑";
        var itemNm = I18n.resource.observer.entities.CURRENT_PROJECT;
        ctx.fillText(itemNm, joinPoint.X, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight);
    }else{
        ctx.fillStyle = valueStyle;
        ctx.fillRect(joinPoint.X - 70, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight - 15, 35, 33);
        ctx.fillStyle = "#FFF";
        ctx.font = "35px 微软雅黑";
        var itemNm = item.name;
        if(itemNm.match(/\w/)){
            itemNm = itemNm.match(/\w/)[0];
        }
        ctx.fillText(itemNm, joinPoint.X - 53, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight);
        ctx.font = "14px 微软雅黑";
        ctx.fillStyle = "#232323";
        ctx.fillText(I18n.resource.observer.entities.WORKING_CONDITION_RATE, joinPoint.X + 10, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#CCC'
        ctx.beginPath();
        ctx.moveTo(joinPoint.X - 35, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight - 14);
        ctx.lineTo(joinPoint.X - 35, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight + 50);
        ctx.moveTo(joinPoint.X - 35, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight + 18);
        ctx.lineTo(joinPoint.X - 70, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight + 18);
        ctx.closePath()
        ctx.stroke();
        if (this.plantIcon !== undefined) {
            if (!this.plantIcon.complete) {
                this.plantIcon.onload = function (e) {
                    ctx.drawImage(this.plantIcon, joinPoint.X - 70, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight + 20, 30, 30);
                };
            }
            else {
                ctx.drawImage(this.plantIcon, joinPoint.X - 70, panelPoint.y + tempHeigth / 7 * 2 + zoomChangeHeight + 20, 30, 30);
            }
        }
    }

    ctx.restore();
    ctx.restore();
}

function ModelRulerReference(item, ruler) {
    this.ruler = ruler;
    for (var prop in item) {
        if (item.hasOwnProperty(prop)) {
            this[prop] = item[prop];
        }
    }
}
ModelRulerReference.prototype = new Sprite();
ModelRulerReference.prototype.constructor = ModelRulerReference;
ModelRulerReference.prototype.mouseEnter = function () {
    for (var n = 0; n < this.ruler.references.length; n++) {
        this.ruler.references[n].isZoom = false;
    }
    this.isZoom = true;
}

ModelRulerReference.prototype.mouseOut = function () {
    this.isZoom = false;
}


function ModelRulerCurrentReference(item, ruler) {
    this.ruler = ruler;
    for (var prop in item) {
        if (item.hasOwnProperty(prop)) {
            this[prop] = item[prop];
        }
    }
}
ModelRulerCurrentReference.prototype = new Sprite();
ModelRulerCurrentReference.prototype.constructor = ModelRulerCurrentReference;
ModelRulerCurrentReference.prototype.mouseDown = function () {
    this.ruler.isBigDataLoad = !this.ruler.isBigDataLoad;
}

ModelRuler.ModelRulerCurrentReference = ModelRulerCurrentReference;
ModelRuler.ModelRulerReference = ModelRulerReference;

export default ModelRuler
