import { Sprite } from '../sprites';
import appConfig from '../../../../../common/appConfig'
import http from '../../../../../common/http'

function ModelCheckbox(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.idCom = undefined;
    this.type = undefined;
    this.fontColor = undefined;
    this.fontSize = undefined;
    this.setValue = undefined;
    this.unsetValue = undefined;
    this.text = undefined;
    this.idGroup = undefined;
    this.expression = undefined;
    this.checkboxUrl = appConfig.checkboxUrl;
    this.width = undefined;
    this.height = undefined;
    this.image = undefined
};
ModelCheckbox.prototype = new Sprite();

ModelCheckbox.prototype.paint = function (ctx) {
    
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
};

ModelCheckbox.prototype.drawImage = function(_this,ctx){
    
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
            ctx.textAlign = "left";
            ctx.fillText(_this.text, _this.x + _this.width / 2 + 10, _this.y + _this.height / 2);
        }
    } catch (e) {
        console.error(e);
    }
    ctx.restore();
}

//更新后改变image的图片
// 从static/images里引入标准控件名
ModelCheckbox.prototype.update = function (obj) {
    if(this.type === '1'){
        if(this.setValue==obj.value){
            this.image.src=appConfig.staticImage+"/omsite/check_btn_sel_com.png"
        }else if(obj.value == ''){
            this.image.src=appConfig.staticImage+"/omsite/check_btn_unsel_com.png"
        }else{
            this.image.src=appConfig.staticImage+"/omsite/check_btn_unsel_com.png"
        }
    }else if(this.type === '0'){
        if(this.setValue==obj.value){
            this.image.src = appConfig.staticImage + `/omsite/radio_btn_sel_com.png`  ;
        }else if(obj.value == ''){
            this.image.src = appConfig.staticImage + `/omsite/radio_btn_unsel_com.png`;
        }else{
            this.image.src = appConfig.staticImage + `/omsite/radio_btn_unsel_com.png`;
        }
    }
}

export default ModelCheckbox;
