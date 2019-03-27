import { Sprite } from '../sprites';

function ModelButton(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.image = undefined;
    this.imageComm = undefined;
    this.imageOver = undefined;
    this.imageDown = undefined;
    this.imageDisable = undefined;
    this.url = undefined;
    this.idCom = undefined;
    this.text = undefined;
    this.link = undefined;
    this.description = undefined;
    this.fontSize = undefined;
    this.fontColor = undefined;

    this.idCom = undefined;
    this.setValue = undefined;

    this.status = undefined;
    this.history = undefined;
    this.button = undefined;
    this.relation = undefined;
    this.relatType = undefined;
    this.enabled = undefined;
};

ModelButton.prototype = new Sprite();

ModelButton.prototype.paint = function (ctx) {
    if (this.image !== undefined) {
        if (this.image.complete) {
            this.drawImage(this, ctx);
        } else {
            var _this = this;
            this.image.onload = function (e) {
                _this.drawImage(_this, ctx)
            };
        }
    }
},

ModelButton.prototype.drawImage = function (_this, ctx) {
    ctx.save();
    if ((!_this.width) || (!_this.height)) {
        _this.width = _this.image.width;
        _this.height = _this.image.height;
    }
    try {
        ctx.drawImage(_this.image, _this.x, _this.y, _this.width, _this.height);

        if (_this.text) {
            if (this.fontSize) {
                ctx.font = _this.fontSize + "px \'微软雅黑\'";
            };
            ctx.fillStyle = _this.fontColor ? "rgb(" + _this.fontColor.r + "," + _this.fontColor.g + "," + _this.fontColor.b + ")" : "#333333";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(_this.text, _this.x + _this.width / 2, _this.y + _this.height / 2);
        }
    } catch (e) {
        console.error(e);
    }
    ctx.restore();
},

ModelButton.prototype.mouseEnter = function () {
    if (this.status == "down") return;
    if (!this.enabled) return;
    this.image = this.imageOver;
},

ModelButton.prototype.mouseOut = function () {
    if (!this.enabled) return;
    this.image = this.imageComm;
    this.status = undefined;
}

ModelButton.prototype.mouseDown = function () {
    if (!this.enabled) return;
    this.image = this.imageDown;
    this.status = "down";
}

var enablePoint, enableValue;

ModelButton.prototype.update = function (obj) {
    if( this.relation && this.relation.length) {
        enablePoint = this.relation[0].point;
        if(this.relation[0].type == '0' && this.relatType == '0'){
            if(this.relation[0].value == '1' && this.relation[1].value == '0'){
                if ((enableValue == '1' && obj.value == '0')) {
                    console.log('可以点击开启');      
                    this.enabled = true;
                }else{
                    this.image = this.imageOver;
                    this.status = "down";
                    this.enabled = false;
                    console.log('不可以点击开启');
                }
            }else
            if(this.relation[0].value == '1' && this.relation[1].value == '1'){
                if ((enableValue == '1' && obj.value == '1')) {
                    console.log('可以点击关闭');
                    this.enabled = true;
                }else{
                    this.image = this.imageOver;
                    this.status = "down";
                    this.enabled = false;
                    console.log('不可以点击关闭');
                }
            }
        }
     
    }else{
        this.enabled = true
       if(obj.name == enablePoint) {
           console.log(obj);
           enableValue = obj.value;
       }
    }
}

export default ModelButton;
