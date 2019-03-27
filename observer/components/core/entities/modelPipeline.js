import { Sprite } from '../sprites';

function ModelPipeline(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.executeAnimation }];

    this.idCom = undefined;
    this.dictIdCom = {};
    this.startX = undefined;
    this.startY = undefined;
    this.endX = undefined;
    this.endY = undefined;
    this.layer = undefined;
    this.lineWidth = 10;
    this.color = undefined;

    this.pathLengthX = undefined;
    this.pathLengthY = undefined;
    this.originX = undefined;
    this.originY = undefined;

    this.direction = undefined;
    this.speed = undefined;
    this.pointX = undefined;
    this.pointY = undefined;
    this.radius = 10;
    this.waterType = undefined;
    this.isRunning = false;
};

ModelPipeline.prototype = new Sprite();

ModelPipeline.prototype.paint = function (ctx) {
    ctx.save();

    var alpha = this.isRunning ? '0.7' : '0.2';
    switch (this.waterType) {
        case "0": ctx.strokeStyle = 'rgba(0, 114, 201, ' + alpha + ')'; break;
        case "1": ctx.strokeStyle = 'rgba(78, 157, 50, ' + alpha + ')'; break;
        case "2": ctx.strokeStyle = 'rgba(244, 191, 88, ' + alpha + ')'; break;
        case "3": ctx.strokeStyle = 'rgba(196, 101, 105, ' + alpha + ')'; break;
        default: ctx.strokeStyle = '#ccc'; break;
    }

    //ctx.strokeStyle = "rgb(" + this.color.b + "," + this.color.g + "," + this.color.r + ")";
    
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    if (this.isRunning) {
        //draw point
        ctx.fillStyle = '#017db6';
        ctx.save();
        if (this.waterType) ctx.fillStyle = this.waterType == 0 ? "#017db6" : "#6fc88f";
        ctx.beginPath();
        //ctx.arc(this.pointX, this.pointY, this.radius, 0, Math.PI * 2);
        ctx.arc(this.pointX, this.pointY, this.lineWidth / 2 - 1, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

ModelPipeline.prototype.executeAnimation = function (sprite, ctx, time) {
    //status: 1 = open, 0 = close.
    sprite.isRunning = false;
    for (var item in sprite.dictIdCom) {
        if (sprite.dictIdCom[item]) {
            sprite.isRunning = true; break;
        }
    }
    if (!sprite.isRunning) return;

    if (sprite.pointX == undefined || sprite.pointY == undefined) sprite.initAnimationParams();

    if (sprite.endY == sprite.startY) {
        //moving as axis X
        if (Math.abs(sprite.pointX - sprite.originX) > sprite.pathLengthX) sprite.initAnimationParams();
        sprite.pointX += sprite.speed;
    } else {
        //moving as axis Y
        if (Math.abs(sprite.pointY - sprite.originY) > sprite.pathLengthY) sprite.initAnimationParams();
        sprite.pointY += sprite.speed;
    }
}

//animation start point and the length of path.
ModelPipeline.prototype.initAnimationParams = function () {
    this.pathLengthX = Math.abs(this.endX - this.startX) - this.radius;
    this.pathLengthY = Math.abs(this.endY - this.startY) - this.radius;

    if (this.direction) {
        //forward direction                                   
        this.originX = this.startX;
        this.originY = this.startY;
        if (this.speed > 0 && (this.endX < this.startX || this.endY < this.startY)) this.speed = -1 * this.speed;
    } else {
        //backward direction
        this.originX = this.endX;
        this.originY = this.endY;
        if (this.speed > 0 && (this.endX > this.startX || this.endY > this.startY)) this.speed = -1 * this.speed;
    }

    this.pointX = this.originX;
    this.pointY = this.originY;
}
export default ModelPipeline;
