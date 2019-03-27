import { Sprite } from '../sprites';

function ModelEquipment(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.updateImageIndex }];

    this.url = undefined;
    this.image = undefined;
    this.rotate = undefined;
    this.value = undefined;
    this.hasAnimation = undefined;
    this.animation = undefined;
    this.idCom = undefined;
    this.indexImage = 0;
    this.layer = undefined;
    this.link = undefined;

    this.history = undefined;
    this.timeLastRefresh = 0;
};

ModelEquipment.prototype = new Sprite();

ModelEquipment.prototype.paint = function (ctx) {
    if (this.image) {
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

ModelEquipment.prototype.drawImage = function (_this, ctx) {
    ctx.save();
    if ((!_this.width) || (!_this.height)) {
        _this.width = _this.image.width;
        _this.height = _this.image.height;
    }

    try {
        if (_this.rotate) {
            ctx.translate(_this.x, _this.y);
            ctx.translate(_this.width / 2, _this.height / 2);
            ctx.rotate(_this.rotate * Math.PI / 180);
            //TODO
            if (Math.abs(_this.rotate) > 90 && Math.abs(_this.rotate < 270)) {
                ctx.drawImage(_this.image, -_this.width / 2, -_this.height / 2, _this.width, _this.height);
            } else {
                ctx.drawImage(_this.image, -_this.height / 2, -_this.width / 2, _this.height, _this.width);
            }
        } else {
            ctx.drawImage(_this.image, _this.x, _this.y, _this.width, _this.height);
        }
    } catch (e) { }

    ctx.restore();
},

ModelEquipment.prototype.updateImageIndex = function (_this, ctx, time) {
    _this.value = parseInt(_this.value);
    if (!(_this.animation[_this.value] && _this.animation[_this.value].frameCount)) return;
    if (_this.animation[_this.value].frameCount > 1 && _this.indexImage < _this.animation[_this.value].frameCount) {
        if (time && time - _this.timeLastRefresh > _this.animation[_this.value].interval) {
            _this.indexImage++;
            _this.timeLastRefresh = time;
        }
    } else {
        _this.indexImage = 0;
    }
}

ModelEquipment.prototype.refreshImage = function (dictList, dictImages) {
    if (this.hasAnimation == undefined) {
        this.hasAnimation = false;
        for (var item in this.animation) {
            this.hasAnimation = true; break;
        }
    }

    if (this.hasAnimation && this.animation[this.value] && this.animation[this.value].frameCount) {
        var id = this.animation[this.value].frameCount > 1 ? "animation_" : "";
        if (this.animation[this.value].frameCount > 1 && dictList[this.animation[this.value].animationId])
            id += dictList[this.animation[this.value].animationId][this.indexImage];
        else id = this.animation[this.value].animationId;
        if (dictImages[id]) {
            this.image = dictImages[id];
        }
    }
},

ModelEquipment.prototype.mouseEnter = function () {
    if (this.history == undefined) {
        this.history = {};
        this.history.width = this.width;
        this.history.height = this.height;
        this.history.x = this.x;
        this.history.y = this.y;

        this.width += 30;
        this.height += 30;
        this.x -= 15;
        this.y -= 15;

        var _this = this;
        setTimeout(function () {
            _this.mouseOut();
        }, 1000);
    }
},

ModelEquipment.prototype.mouseOut = function () {
    if (this.history) {
        this.width = this.history.width;
        this.height = this.history.height;
        this.x = this.history.x;
        this.y = this.history.y;
        this.history = undefined;
    }
}

export default ModelEquipment;
