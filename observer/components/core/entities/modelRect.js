import { Sprite } from '../sprites';

function ModelRect(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.layer = null;

    this.lineStyle = [6];
};

ModelRect.prototype = Object.create(Sprite.prototype);

ModelRect.prototype.paint = function (ctx) {
    ctx.save();
    ctx.setLineDash(this.lineStyle);
    ctx.lineWidth = "4";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
},

ModelRect.prototype.mouseEnter = function () {
},

ModelRect.prototype.mouseOut = function () {
}

ModelRect.prototype.mouseDown = function () {
}

export default ModelRect;
