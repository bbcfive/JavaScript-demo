import appConfig from '../../../../../common/appConfig';
import { Sprite } from '../sprites';

function ModelGage(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.canvasOffline = document.createElement("canvas");
    this.ctxOffline = this.canvasOffline.getContext("2d");
    this.value = 0;
    this.maxValue = 1.5;
    this.minValue = 0;
    this.idCom = undefined;

    this.imgMeterPan = new Image();
    this.imgMeterPan.src = appConfig.staticImage + "/plant/cybg001/1577.png";
    this.imgMeterPointer = new Image();
    this.imgMeterPointer.src = appConfig.staticImage +  "/plant/cybg001/meterpointer.png";
};

ModelGage.prototype = new Sprite();

ModelGage.prototype.close = function () {
    this.canvasOffline = null;
    this.ctxOffline = null;
}

ModelGage.prototype.paint = function (ctx) {
    ctx.drawImage(this.canvasOffline, this.x, this.y);
},

ModelGage.prototype.renderGage = function () {
    this.canvasOffline.width = this.width;
    this.canvasOffline.height = this.height;
    this.ctxOffline.clearRect(0, 0, this.canvasOffline.width, this.canvasOffline.height);
    var _this = this;
    if (this.imgMeterPan != undefined) {
        if (this.imgMeterPan.complete) {
            this.drawMeterPan(this, this.ctxOffline);
        } else {

            this.imgMeterPan.onload = function (e) {
                _this.drawMeterPan(_this, _this.ctxOffline);
            };
        }
    }

    if (this.imgMeterPointer != undefined) {
        if (this.imgMeterPointer.complete) {
            this.drawMeterPointer(this, this.ctxOffline);
        } else {
            this.imgMeterPointer.onload = function (e) {
                _this.drawMeterPointer(_this, _this.ctxOffline);
            };
        }
    }

    //draw gage
    //Please use "this.ctxOffline" as your canvas context.

},

ModelGage.prototype.drawMeterPan = function(_this, ctx)
{

    console.info( _this.imgMeterPan.src )
    _this.ctxOffline.drawImage(_this.imgMeterPan, 0, 0, _this.width, _this.height);


    var gradient = _this.ctxOffline.createLinearGradient(0, 0, _this.width, _this.height);
    gradient.addColorStop(0, 'blue');
    gradient.addColorStop(0.25, 'blue');
    gradient.addColorStop(0.5, 'white');
    gradient.addColorStop(0.75, 'red');
    gradient.addColorStop(1.0, 'yellow');

    _this.ctxOffline.font = "22pt Arial";
    _this.ctxOffline.fillStyle = gradient;
    _this.ctxOffline.strokeStyle = 'white';
    _this.ctxOffline.shadowColor = 'rgba(1,1,1,0.8)';
    _this.ctxOffline.shadowOffsetX = 2;
    _this.ctxOffline.shadowOffsetY = 2;
    _this.ctxOffline.shadowBlur = 5;
    _this.ctxOffline.textAlign = 'center';

    var valueDisplay = Math.round(_this.value * 100) / 100;
    _this.ctxOffline.fillText(valueDisplay.toString(), _this.width * 0.5, _this.height * 0.75);

    //draw the number on the gage
    _this.ctxOffline.font = "9pt Arial";
    _this.ctxOffline.fillStyle = '#4ebaff';
    var interval = (_this.maxValue - _this.minValue)/5, pi = Math.PI, angleInterval = pi / 5,
        radius = _this.width * 0.25, centerX = _this.width * 0.5, centerY = _this.width * 0.5;

    for(var n=0; n < 6; n++){
        var value = _this.minValue + (n * interval);
        if(value % 1 !==0 ){
            value = value.toFixed(1);
        }
        var angle = angleInterval * n;
        _this.ctxOffline.fillText(value, centerX - Math.cos(angle)*radius , centerY - Math.sin(angle)*radius);
    }

}

ModelGage.prototype.drawMeterPointer = function (_this, ctx) {
    _this.ctxOffline.save();

    //draw pointer
    var maxValueAsAngle = Math.PI / 2.0 * 3.0;
    var minValueAsAngle = Math.PI / 2.0;

    var curValueAngle = 0.0;
    if (Number(_this.value) > _this.maxValue) {
        curValueAngle = maxValueAsAngle;
    } else if (Number(_this.value) < _this.minValue) {
        curValueAngle = minValueAsAngle;
    } else {
        if (_this.maxValue > _this.minValue) {
            curValueAngle = minValueAsAngle + (maxValueAsAngle - minValueAsAngle) / (_this.maxValue - _this.minValue) * (_this.value - _this.minValue);
        }
    }

    //curValueAngle = 3.14;
    
    var pointerbasex = _this.width * 0.5;
    var pointerbasey = _this.height * 0.5;
    _this.ctxOffline.translate(pointerbasex, pointerbasey);
    _this.ctxOffline.rotate(curValueAngle);
    _this.ctxOffline.drawImage(_this.imgMeterPointer, -_this.imgMeterPointer.width / 2.0, -_this.imgMeterPointer.width / 2.0, _this.imgMeterPointer.width, _this.imgMeterPointer.height);

    _this.ctxOffline.restore();
}

ModelGage.prototype.update = function (value)
{
    if (value == this.value) return;
    this.value = value;
    this.renderGage();
}

export default ModelGage;
