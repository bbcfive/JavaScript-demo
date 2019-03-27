import { Sprite } from '../sprites';
import Chart from 'chart.js';
import http from '../../../../../common/http';
import moment from 'moment';
import appConfig from '../../../../../common/appConfig';

function ModelChart(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.interval = 5000;
    this.units = undefined;
    this.dataTable = {};
    this.maxPointCount = 241;
    this.chartData = [];
    this.chartlabels = undefined;
    this.chart = undefined;
    this.chartOptions = {
        responsive: false,
        animation:false //关闭动画
    };

    this.canvasOffline = undefined;
    this.ctxOffline = undefined;

    this.isRunning = false;
    this.receivedDate = {};
};

ModelChart.prototype = new Sprite();

ModelChart.prototype.close = function () {
    this.isRunning = false;
    this.canvasOffline = null;
    this.ctxOffline = null;
}

ModelChart.prototype.drawLegend = function () {
    this.ctxOffline.textBaseline = "middle";
    this.ctxOffline.textAlign = "left";
    var legendItemBeginX = 0, legendItemHeight = 14, legendItemLine = 0;
    for (var i = 0; i < this.units.length; i++) {
        if (legendItemBeginX > (this.width * 0.8)) {
            legendItemBeginX = 0;
            legendItemLine += 1;
        }

        if ((!text) || text == '') continue;

        var text = this.units[i].title, itemHeight = legendItemHeight * legendItemLine;
        this.ctxOffline.fillStyle = this.units[i].color;
        this.ctxOffline.fillRect(legendItemBeginX + 50, 8 + itemHeight, 10, 4);
        this.ctxOffline.fillStyle = "#333333";
        this.ctxOffline.fillText(text, legendItemBeginX + 70, 10 + itemHeight);
        legendItemBeginX += this.ctxOffline.measureText(text).width + 50;
    }
}

ModelChart.prototype.paint = function (ctx) {
    ctx.drawImage(this.canvasOffline, this.x, this.y);
},

ModelChart.prototype.update = function (pointName, value) {
    this.receivedDate[pointName] = value;
    if (value < 0) this.chartOptions.scaleStartValue = null;
}

////////////////////////////////////////////////////////////////////////////
export function LineChart(id, painter, behaviors) {
    ModelChart.call(this, id, painter, behaviors);

}
LineChart.prototype = new ModelChart();
LineChart.prototype.constructor = LineChart;
LineChart.prototype.renderChart = function (_this) {
    if (!_this.isRunning) return;
    //update date, axis X
    _this.chartlabels.shift();
    //_this.chartlabels.push(new Date().toLocaleTimeString());
    _this.chartlabels.push(moment().format('HH:mm:ss'));
    

    //update values which is based on the new data store, axis Y
    for (var pointName in _this.receivedDate) {
        _this.dataTable[pointName].shift();
        _this.dataTable[pointName].push(_this.receivedDate[pointName]);

        for (var i = 0; i < _this.chartData.length; i++) {
            if (_this.chartData[i].pointName == pointName) {
                _this.chartData[i].data = _this.dataTable[pointName];
                break;
            }
        }
    }

   if (!_this.chart) {
        //draw chart 
        _this.canvasOffline.width = this.width;
        _this.canvasOffline.height = this.height;
        _this.ctxOffline.clearRect(0, 0, _this.canvasOffline.width, _this.canvasOffline.height);

        _this.chart = new Chart(_this.ctxOffline,{
            type: 'line',
            data: {
                labels: _this.chartlabels,
                datasets: _this.chartData
            },
            options:  _this.chartOptions
        });
    }else {
        //若已有chart，则只更新数据，不重绘chart
        _this.chart.update();
    }

    //draw legend
    this.drawLegend();

    setTimeout(function () { _this.renderChart(_this) }, _this.interval);
}
LineChart.prototype.init = function () {
    this.canvasOffline = document.createElement("canvas");
    this.ctxOffline = this.canvasOffline.getContext("2d");
    this.canvasOffline.width = this.width;
    this.canvasOffline.height = this.height;

    //init chart
    var unit, sbColor, obj, responslabel = [], pointsArr;
    console.log(this.units);
    //取出点名数组
    pointsArr = this.units.map((row) =>{
        return row.pointName
    })
    console.log(pointsArr);
    http.post('/api/get_history_data_padded_reduce', {
        pointList : pointsArr,
        timeStart:  moment().add(-4,'hour').format('YYYY-MM-DD HH:mm:00'),
        timeEnd: moment().format('YYYY-MM-DD HH:mm:00'),
        timeFormat:"m1",
        projectId: appConfig.project.id
    }).then(
        data =>{
            if (data && data.timeStamp.length >= 0) {
                obj = data.data;
                //将从后台请求到的YYYY-MM-DD HH:mm:00转成HH:mm:ss
                data.timeStamp.forEach(row =>{
                    responslabel.push(moment(row).format('HH:mm:ss'))
                });
                console.log(responslabel,obj);
                this.chartlabels = new Array();
                //添加x轴的时间数组
                if (responslabel.length > 0) {
                    if (responslabel.length === this.maxPointCount) {
                        this.chartlabels = responslabel;
                    }else {
                        for (var i = 0; i < this.maxPointCount-responslabel.length; i++) this.chartlabels.push('');
                        for (var i = 0; i < responslabel.length; i++) this.chartlabels.push(responslabel[i]);
                    }
                } else{
                    for (var i = 0; i < this.maxPointCount; i++) this.chartlabels.push('');
                }
                console.log(responslabel)
                //添加y轴的数据data
                for (var i = 0; i < this.units.length; i++) {
                    unit = this.units[i];
                    var unitPointName = unit.pointName;
                    let dataArr=[];
                    // arr = [];
                    // for (var j = 0; j < this.maxPointCount; j++) arr.push(null);
                    console.log(responslabel,obj)
                    //在请求返回的所有点的对象里取出当前遍历的点的点值数组
                    if (obj[unitPointName]) {   
                        //若该点没有请求到历史数据，放一个空数组
                        if (obj[unitPointName].length === 0) {
                            for (var j = 0; j < this.maxPointCount; j++) dataArr.push(null);
                        }else 
                        //若请求到的数组长度不够规定的241个，用空填满，以便刷新时替换
                        if (obj[unitPointName].length < this.maxPointCount){
                            for (var j = 0; j < this.maxPointCount-obj[unitPointName].length; j++) dataArr.push(null);
                            for (var j = 0; j < obj[unitPointName].length; j++) dataArr.push(obj[unitPointName][i]);                                  
                        }else
                        //若请求到的数组为241，全部拿到时,直接赋值
                        if (obj[unitPointName].length === this.maxPointCount) {
                            dataArr = obj[unitPointName] 
                        }
                    }
                   
                    console.log(dataArr)
                    this.dataTable[unit.pointName] = dataArr;
                    this.receivedDate[unit.pointName] = null;
                    sbColor = `rgba(${unit.color.b}, ${unit.color.g}, ${unit.color.r}`;
                    this.units[i].color = sbColor.replace("rgba", "rgb") + ")";
                    this.chartData.push({
                        backgroudColor: sbColor + ", 0.5)",
                        borderColor: sbColor + ", 1)",
                        pointBorderColor: sbColor + ", 1)",
                        pointBackgroundColor: "#fff",
                        data: this.dataTable[unit.pointName],
                        label: unit.title, //图上面图标的点名显示为中文
                    });
                    console.log(this.chartData);

                }
            }else
            //若没有请求到历史数据为空，则传长度为241的空数组
            {
                for (var i = 0; i < this.units.length; i++) {
                    unit = this.units[i];   
                    arr = [];
                    for (var j = 0; j < this.maxPointCount; j++) arr.push(null);
                    console.log(responslabel,arr)
                
                    this.dataTable[unit.pointName] = arr;
                    this.receivedDate[unit.pointName] = null;
                    sbColor = `rgba(${unit.color.b}, ${unit.color.g}, ${unit.color.r}`;
                    this.units[i].color = sbColor.replace("rgba", "rgb") + ")";
                    this.chartData.push({
                        backgroudColor: sbColor + ", 0.5)",
                        borderColor: sbColor + ", 1)",
                        pointBorderColor: sbColor + ", 1)",
                        pointBackgroundColor: "#fff",
                        data: this.dataTable[unit.pointName],
                        label: unit.title, //图上面图标的点名显示为中文
                    });
            
                }
                this.chartlabels = new Array();
                for (var i = 0; i < this.maxPointCount; i++) this.chartlabels.push('');
            }
        }
    ).catch(
        err => {
            for (var i = 0; i < this.units.length; i++) {
                unit = this.units[i];   
                let arr = [];
                for (var j = 0; j < this.maxPointCount; j++) arr.push(null);
                console.log(responslabel,arr)
            
                this.dataTable[unit.pointName] = arr;
                this.receivedDate[unit.pointName] = null;
                sbColor = `rgba(${unit.color.b}, ${unit.color.g}, ${unit.color.r}`;
                this.units[i].color = sbColor.replace("rgba", "rgb") + ")";
                this.chartData.push({
                    backgroudColor: sbColor + ", 0.5)",
                    borderColor: sbColor + ", 1)",
                    pointBorderColor: sbColor + ", 1)",
                    pointBackgroundColor: "#fff",
                    data: this.dataTable[unit.pointName],
                    label: unit.title, //图上面图标的点名显示为中文
                });
        
            }
            this.chartlabels = new Array();
            for (var i = 0; i < this.maxPointCount; i++) this.chartlabels.push('');
        }        
    )
}

//////////////////////////////////////////////////////////////////////////
export function BarChart(id, painter, behaviors) {
    ModelChart.call(this, id, painter, behaviors);
}
BarChart.prototype = new ModelChart();
BarChart.prototype.constructor = BarChart;
BarChart.prototype.renderChart = function (_this) {
    if (!_this.isRunning) return;

    for (var i = 0; i < _this.units.length; i++) {

        var unit = _this.units[i], pointName = unit.pointName;
        !_this.chartlabels[i] && (_this.chartlabels[i] = unit.title);
        for (var j = 0; j < _this.chartData.length; j++) {
            if (_this.chartData[j].pointName === pointName) {
                _this.chartData[j].data[0] = Number(_this.receivedDate[pointName]);
            }
        }
    }

    //draw chart
    _this.canvasOffline.width = this.width;
    _this.canvasOffline.height = this.height;
    _this.ctxOffline.clearRect(0, 0, _this.canvasOffline.width, _this.canvasOffline.height);
    _this.chart = new Chart(_this.ctxOffline,{
            type: 'bar',
            data: {
                labels: [''],
                datasets: _this.chartData
            },
            options:  _this.chartOptions
        }  
    );

    //draw legend
    this.drawLegend();

    setTimeout(function () { _this.renderChart(_this) }, _this.interval);
}
BarChart.prototype.init = function () {
    this.canvasOffline = document.createElement("canvas");
    this.ctxOffline = this.canvasOffline.getContext("2d");
    this.canvasOffline.width = this.width;
    this.canvasOffline.height = this.height;
    this.chartlabels = [];
    //init chart

    var unit, sbColor;
    for (var i = 0; i < this.units.length; i++) {
        unit = this.units[i];
        this.dataTable[unit.pointName] = [];
        this.receivedDate[unit.pointName] = null;
        sbColor = `rgba(${unit.color.b}, ${unit.color.g}, ${unit.color.r}`;
        this.units[i].color = sbColor.replace("rgba", "rgb") + ")";
        this.chartData.push({
            backgroudColor: sbColor + ", 0.5)",
            borderColor: sbColor + ", 1)",
            data: this.dataTable[unit.pointName],
            label: unit.pointName,
        });
    }
}

////////////////////////////////////////////////////////////////////////////
export function PieChart(id, painter, behaviors) {
    ModelChart.call(this, id, painter, behaviors);
    this.painter = { paint: this.paint };
}
PieChart.prototype = new ModelChart();
PieChart.prototype.constructor = PieChart;

PieChart.prototype.paint = function (ctx) {
    ctx.drawImage(this.canvasOffline, this.x + this.width * 0.1, this.y + this.height * 0.2);

    //draw legend
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    var legendItemBeginX = 0, legendItemHeight = 14, legendItemLine = 0;
    for (var i = 0; i < this.units.length; i++) {
        if (legendItemBeginX > (this.width * 0.8)) {
            legendItemBeginX = 0;
            legendItemLine += 1;
        }

        var text = this.units[i].title, itemHeight = legendItemHeight * legendItemLine;
        ctx.fillStyle = this.units[i].color;
        ctx.fillRect(legendItemBeginX + 50 + this.x, 8 + itemHeight + this.y, 10, 4);
        ctx.fillStyle = "#333333";
        ctx.font = "bold 14px 微软雅黑";
        ctx.fillText(text, legendItemBeginX + 70 + this.x, 10 + itemHeight + this.y);
        legendItemBeginX += ctx.measureText(text).width + 50;
    }
    ctx.restore();
},

PieChart.prototype.renderChart = function (_this) {
    if (!_this.isRunning) return;

    for (var i = 0; i < _this.units.length; i++) {
        var unit = _this.units[i], pointName = unit.pointName;
        for (var j = 0; j < _this.chartData.length; j++) {
            if (_this.chartData[j].pointName === pointName) {
                _this.chartData[j].value = Number(_this.receivedDate[pointName]);
                _this.chartData[j].label = unit.title;
            }
        }
    }

    //draw chart
    _this.canvasOffline.width = this.width * 0.8;
    _this.canvasOffline.height = this.height * 0.8;
    _this.ctxOffline.clearRect(0, 0, _this.canvasOffline.width, _this.canvasOffline.height);
    _this.chart = new Chart(_this.ctxOffline,{
        type: 'pie',
        data: {
            labels: _this.chartlabels,
            datasets: _this.chartData
        },
        options: _this.chartOptions
    });

    setTimeout(function () { _this.renderChart(_this) }, _this.interval);
}

PieChart.prototype.init = function () {
    this.canvasOffline = document.createElement("canvas");
    this.ctxOffline = this.canvasOffline.getContext("2d");
    this.canvasOffline.width = this.width * 0.8;
    this.canvasOffline.height = this.height * 0.8;
    this.chartlabels = [];
    //init chart
    var unit, sbColor;
    for (var i = 0; i < this.units.length; i++) {
        unit = this.units[i];
        this.dataTable[unit.pointName] = [];
        this.receivedDate[unit.pointName] = null;
        sbColor = `rgba(${unit.color.b}, ${unit.color.g}, ${unit.color.r}`;
        this.units[i].color = sbColor.replace("rgba", "rgb") + ")";
        this.chartData.push({
            borderColor: sbColor + ", 1)",
            value: 0,
            //label: '',
            label: unit.pointName,
        });
    }
}
