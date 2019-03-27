export function HitModel(canvas,page) {
    this.list = {};
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleBoxX = undefined;
    this.scaleBoxY = undefined;
    this.rectLeft = undefined;
    this.rectTop = undefined;
    this.currentId = undefined;

    this.canvas = canvas;
    this.page = page
    this.setScale(canvas); 
}

HitModel.prototype = {
    add: function (id, type, x, y, width, height) {
        if (!this.list[type]) this.list[type] = {};
        var temp = x;
        x = y;
        y = temp;
        var obj = null

        this.list[type][id] = {

            startX: -x - height + this.page.height, 
            startY: y,
            endX: -x + this.page.height,
            endY: y + width
        }
    },

    clear: function () {
        this.list = {};
    },

    remove: function (type, id) {
        if (arguments.length === 1) {
            if (this.list[type]) {
                this.list[type] = null;
            }
        } else if (arguments.length > 1) {
            if (this.list[type] && this.list[type][id]) {
                this.list[type][id] = null;
            }
        }
    },
    // 判断是否是点击范围
    isHit: function (x, y, hitModel) {
        if (!(x && y)) return false;
        if (hitModel.startX > x || x > hitModel.endX) return false;
        if (hitModel.startY > y || y > hitModel.endY) return false;
        return true;
    },

    //type = null: traverse all type, else traverse the specified type
    firstHitId: function (_x, _y, _type) {
        var obj = this.convertToCanvasPosition(_x, _y);
        // console.table({clientX : obj.x , clientY : obj.y})
        if (_type) {
            for (var key in this.list[_type]) {
                if (this.isHit(obj.x, obj.y, this.list[_type][key])) {
                    return { id: key, type: _type };
                }
            }
        } else {
            for (var type in this.list) {
                for (var key in this.list[type]) {
                    // 判断传入的点击事件的坐标是否和以保存的设备坐标匹配
                    if (this.isHit(obj.x, obj.y, this.list[type][key])) {
                        return { id: key, type: type };
                    }
                }
            }
        }
        return null;
    },

    setScale: function (canvas) {
    /*    var rect = canvas.getBoundingClientRect();
        // 计算比值
        this.scaleBoxX = canvas.width / rect.width;
        this.scaleBoxY = canvas.height / rect.height;

        this.rectLeft = rect.left * this.scaleBoxX;
        this.rectTop = rect.top * this.scaleBoxY;*/
    },
    
    convertToCanvasPosition: function (x, y) {
        var rect = this.canvas.getBoundingClientRect();
        // 根据点击的坐标恢复到1920 * 955 或者其他 分辨率下的坐标
        return {
            x:(x - rect.left - this.canvas.scrollLeft) * this.scaleX,
            y:(y - rect.top - this.canvas.scrollTop) * this.scaleY
        }
    }
}

export const StringTools = {};
StringTools.wordWrap = function (context, x, y, width, text, options) {
    //TODO:
    var strs = new Array();
    var str = "";
    if(text){
        
        for (var i = 0; i < text.length; i++) {
            str += text[i];
            if (context.measureText(str).width > width - 8) {
                strs.push(str);
                str = "";
            }
        }
        strs.push(str); // the last line
    }

    var size = context.font.split("px")[0];
    size = size.split(' ');
    size = size[size.length - 1];

    var heigth = parseInt(size) * 4 / 3;
    for (var i = 0; i < strs.length; i++) {
        context.fillText(strs[i], x, y + heigth * i);
    }
};

StringTools.getRealStringLength = function (str) {
    var length = 0;
    for (i = 0; i < str.length; i++) {
        if ((str.charCodeAt(i) & 0xff00) != 0) {
            length++;
        }
        length++;
    }
    return length;
}

export function CanvasGeometry() { };

CanvasGeometry.fillRadiusRect = function (ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
};
