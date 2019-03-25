import { Sprite } from '../sprites';
import appConfig from '../../../../../common/appConfig';
import { StringTools } from '../commonCanvas';

/////////////
// TOOLTIP //
/////////////
var TOOLTIP_DELAY = 1000;
var $tooltip = null;
var tooltipTimer = null;
var tooltip = {
    show: function () {
        $tooltip.style.display = '';
        $tooltip.style.opacity = configMap.textTooltipOpacity;
        if (tooltipTimer) { window.clearTimeout(tooltipTimer); tooltipTimer = null; }
    },
    hide: function () {
        if (!tooltipTimer) {
            tooltipTimer = window.setTimeout(function () {
                if ($tooltip !== null) {
                    $tooltip.style.opacity = 0;
                }
                tooltipTimer = null;
            }, TOOLTIP_DELAY);
        }
    }
};

var configMap = {
    textTooltipTemplate: `
    <div class="ant-popover ant-popover-placement-top observer-text-tooltip" data-ds-id="" style="text-align: center;transition: all 0.3s ease-in-out;">
        <div class="ant-popover-content">
            <div class="ant-popover-inner">
                <div>
                    <div class="ant-popover-inner-content tooltip-inner">
                        <p class="pointName"></p>
                        <p><a class="linkAddToHistory" href="javascript:;">添加到历史曲线</a></p>
                        <p><a class="linkAddAlert" href="javascript:;">添加报警</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    textTooltipZIndex: 2000,
    textTooltipOpacity: .8,
    textTooltipBackgroundColor: '#1A1A1A'
}
var cachedContainerStyle;

function ModelText(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.executeAnimation }];

    this.value = undefined;
    this.isDiffValue = undefined;
    this.font = undefined;
    this.color = undefined;
    this.fontSize = undefined;
    this.align = undefined;
    this.decimalplace = undefined;
    this.idCom = undefined;
    this.dictBindString = [];
    this.showMode = undefined;
    this.tooltipTemplate = configMap.textTooltipTemplate;
    this.enableTooltip = true;
    this.isInMouserOver = false;
    this.isNeedMark = undefined;
    this.options = undefined
};

ModelText.prototype = new Sprite();

ModelText.prototype.clearTextTooltip = function () {
    document.querySelector('#divMain .observer-text-tooltip').remove();
}

ModelText.prototype.paint = function (ctx) {
    var _this = this;
    ctx.save();

    var curColor = this.color;
    var strFont;
    if (this.fontSize) strFont = this.fontSize + "px ";
    strFont += _this.font ? _this.font : "Arial";
    ctx.font = strFont;

    if (this.bgColor) {
        curColor = "#ffffff";
        paintDiagNoticeBg();
    }
    if (!this.isDiffValue) {
        paintText(curColor);
    } else {
        strFont = 'bold ' + strFont;
        paintText("#ff7200");
    }

    ctx.restore();

    function paintText(color) {
        ctx.save();

        ctx.textBaseline = "middle";

        if (color) ctx.fillStyle = color;

        var str;
        if (!isNaN(_this.value) && _this.decimalplace != undefined) {
            str = parseFloat(_this.value).toFixed(_this.decimalplace);
            if (str == "NaN") str = "--";
        }else if(_this.value === 'Null'){
            str = "--";
        }
        else {
            str = _this.value;
        }
        //文本右对齐时，x增加一个当前单位的width值，左对齐不变
        var strX = _this.align === 1? _this.x + _this.width : _this.x;
        //将文本对齐方式存入ctx的canvas
        ctx.textAlign = _this.align === 1? 'right': 'left';

        var index = parseInt(_this.value);
        if (_this.dictBindString[index]) str = _this.dictBindString[index];

        if (_this.width && ctx.measureText(str).width < _this.width) {
            if (!_this.isNeedMark) {
                ctx.fillText(str, strX, _this.y);
            } else {
                ctx.strokeStyle = '#222';
                ctx.strokeText(str, strX, _this.y);
            }
        } else {
            StringTools.wordWrap(ctx, strX, _this.y - _this.height / 2 + 15, _this.width, str, null);
        }

        ctx.restore();
    }

    function paintDiagNoticeBg() {
        if (!_this.alphaBg) _this.alphaBg = 1;

        if (!(_this.grade == 0 || _this.grade == undefined)) {
            if (_this.alphaBg < 0.3 || _this.alphaBg > 1) {
                _this.isFade = !_this.isFade;
            }
            _this.alphaBg = _this.isFade ? _this.alphaBg + 0.02 : _this.alphaBg - 0.02;
        }

        ctx.save();
        ctx.fillStyle = _this.bgColor;
        ctx.globalAlpha = _this.alphaBg.toFixed(2);
        if (_this.width && ctx.measureText(_this.value).width < _this.width) {
            CanvasGeometry.fillRadiusRect(ctx, _this.x - 5, _this.y - _this.height / 2, ctx.measureText(_this.value).width + 12, _this.height, 3);
        } else {
            CanvasGeometry.fillRadiusRect(ctx, _this.x - 5, _this.y - _this.height / 2, ctx.measureText(_this.value).width -30, _this.height, 3);
        }
        ctx.fill();
        ctx.restore();
    }
}

//isNeedMark 暂时用于标记是否为温度梯度图
ModelText.prototype.update = function (value, isNeedMark) {
    this.isDiffValue = !(this.value == value);
    if (this.value == '--') this.isDiffValue = false;
    this.isNeedMark = isNeedMark;
    this.value = value;
}

ModelText.prototype.updateDiagnosisGrade = function (grade) {
    this.grade = grade;
    switch (grade) {
        case 0: this.bgColor = '#5bc0de'; break;
        case 1: this.bgColor = '#f0ad4e'; break;
        case 2: this.bgColor = '#d9534f'; break;
        default: this.bgColor = '#d9534f'; break;
    }
}

ModelText.prototype.createTooltip = function (pointName) {
    var _this = this;
    var template, $template = $tooltip;
    var parser;
    // console.info(arguments)
    if (!$template) {
        template = this.tooltipTemplate;
        parser = new DOMParser();
        $template = parser.parseFromString(template, "text/html").querySelector('.observer-text-tooltip');

        $template.onmouseenter = function (e) {
            tooltip.show();
            e.stopPropagation();
        };
        $template.onmouseleave = function (e) {
            tooltip.hide();
            e.stopPropagation();
        };
        $template.ontransitionend = function (e) {
            if (e.propertyName === 'opacity' && e.target.style.opacity === '0') {
                e.target.style.display = 'none';
            }
            e.stopPropagation();
        };
        $template.style.maxWidth = null;
        $template.style.opacity = configMap.textTooltipOpacity;
        $template.style.zIndex = configMap.textTooltipZIndex;
        $template.style.display = 'block';

        let elemTooltipInner = $template.querySelector('.tooltip-inner');
        elemTooltipInner.maxWidth = null;
        elemTooltipInner.opacity = configMap.textTooltipOpacity;
        elemTooltipInner.backgroundColor = configMap.textTooltipBackgroundColor;
        // $template.querySelector('.linkAddToHistory').onclick = function (e) {
        //     _this.options.addPoint(pointName)
        //     e.preventDefault();
        //     e.stopPropagation();
        // }
        // $template.querySelector('.linkAddAlert').onclick = function (e) {
        //     console.info( curpointName )
        //     _this.options.showCommomAlarm({
        //         pointName : pointName
        //     })
        //     e.preventDefault();
        //     e.stopPropagation();
        // }
        document.querySelector('#divMain').appendChild($template);
    }
    $template.querySelector('.linkAddToHistory').onclick = function (e) {
        if(typeof _this.options.addPoint == 'function'){
            _this.options.addPoint(pointName)
        }
        e.preventDefault();
        e.stopPropagation();
    }
    $template.querySelector('.linkAddAlert').onclick = function (e) {
        if(typeof _this.options.showCommomAlarm == 'function'){
            _this.options.showCommomAlarm({
                pointName : pointName
            })
        }
        if(typeof _this.options.showMainInterfaceModal === 'function'){
            _this.options.showMainInterfaceModal({
                pointName : pointName
            })
        }
        e.preventDefault();
        e.stopPropagation();
    }
    $template.querySelector('.pointName').textContent = this.idCom;
    $template.dataset.dsId = '@'+appConfig.project.id+'|'+this.idCom;
    return $template;
}

ModelText.prototype.checkPopoverBoundary = function ($popover, offsetX, offsetY) {
    if (!offsetX) {
        offsetX = this.x;
    }
    if (!offsetY) {
        offsetY = this.y;
    }
    if (!cachedContainerStyle) {
        cachedContainerStyle = window.getComputedStyle(document.querySelector('#divMain'));
    }
    var popoverStyle = window.getComputedStyle($popover);
    var documentWidth = parseInt(cachedContainerStyle.width),
        documentHeight = parseInt(cachedContainerStyle.height),
        popoverWidth = parseInt(popoverStyle.width),
        popoverHeight = parseInt(popoverStyle.height),
        popoverX = this.width + offsetX + popoverWidth,
        popoverY = this.height + offsetY + popoverHeight,
        popoverXOffset,
        popoverYOffset;
    popoverXOffset = popoverX > documentWidth ? offsetX - popoverWidth : offsetX + 15; 
    popoverYOffset = popoverY > documentHeight ? offsetY - popoverHeight : offsetY + 10;

    $popover.style.left = popoverXOffset;
    $popover.style.top = popoverYOffset
}

ModelText.prototype.mouseEnter = function (event, isInfo) {
    var _this = this;
    var data, dataNew, modelType;
    var requestDataNew = [];

     if (!cachedContainerStyle) {
        cachedContainerStyle = window.getComputedStyle(document.querySelector('#divMain'));
    }
    var documentWidth = parseInt(cachedContainerStyle.width),
        documentHeight = parseInt(cachedContainerStyle.height);

    if (_this.enableTooltip) {
        // prevent inner elements bubble events
        if (_this.isInMouserOver) return;

        if (!this.idCom) return;
        $tooltip = this.createTooltip(this.idCom);
        tooltip.show();
        if (isInfo.isInModal){ //在模态框里
            this.checkPopoverBoundary($tooltip, event.offsetX + (documentWidth-isInfo.pageWidth)/2 , event.offsetY + (documentHeight-isInfo.pageHeight)/2 );
        }else{
            this.checkPopoverBoundary($tooltip, event.offsetX, event.offsetY);
        }
        
        this.isInMouserOver = true;
    }
}

ModelText.prototype.mouseOut = function (event) {
    var _this = this;
    if (this.enableTooltip) {
        tooltip.hide();
        this.isInMouserOver = false;
    }
}

ModelText.prototype.mouseDown = function (event) {}

// static
ModelText.destroy = function () {
    if (tooltipTimer) {
        clearTimeout(tooltipTimer);
        tooltipTimer = null;
    }
    if ($tooltip !== null) {
        $tooltip.parentNode.removeChild($tooltip);
        $tooltip = null;
    }
    if (cachedContainerStyle) {
        cachedContainerStyle = null;
    }
};

export default ModelText;
