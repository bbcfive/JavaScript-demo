export const Stopwatch = function () {
};

Stopwatch.prototype = {
    startTime: 0,
    running: false,
    elapsedTime: 0,

    start: function () {
        this.startTime = +new Date();
        this.elapsedTime = 0;
        this.running = true;
    },

    stop: function () {
        this.elapsedTime = +new Date() - this.startTime;
        this.running = false;
    },

    getElapsedTime: function () {
        if (this.running) return +new Date() - this.startTime;
        else return this.elapsedTime;
    },

    reset: function () {
        this.elapsedTime = 0;
        this.startTime = 0;
        this.running = false;
    }
};

export function TimerAnimation(duration, timeWarp) {
    this.timeWarp = timeWarp;

    if (duration !== undefined) this.duration = duration;
    else this.duration = 1000;

    this.stopwatch = new Stopwatch(); //将TimerAnimation的this指向Stopwatch构造函数
};


TimerAnimation.prototype = {
    start: function () {
        this.stopwatch.start();
    },

    stop: function () {
        this.stopwatch.stop();
    },

    getRealElapsedTime: function () {
        return this.stopwatch.getElapsedTime();
    },

    getElapsedTime: function () {
        var elapsedTime = this.stopwatch.getElapsedTime(),
            percentComplete = elapsedTime / this.duration;

        if (!this.stopwatch.running) return undefined;
        if (this.timeWarp == undefined) return elapsedTime;

        return elapsedTime * (this.timeWarp(percentComplete) / percentComplete);
    },

    isRunning: function () {
        return this.stopwatch.running;
    },

    isOver: function () {
        return this.stopwatch.getElapsedTime() > this.duration;
    },

    reset: function () {
        this.stopwatch.reset();
    }
}

TimerAnimation.makeEaseOut = function (strength) {
    return function (percentComplete) {
        return 1 - Math.pow(1 - percentComplete, strength * 2);
    };
};

TimerAnimation.makeEaseIn = function (strength) {
    return function (percentComplete) {
        return Math.pow(percentComplete, strength * 2);
    };
};

TimerAnimation.makeEaseInOut = function () {
    return function (percentComplete) {
        return percentComplete - Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI);
    };
};

TimerAnimation.makeElastic = function (passes) {
    passes = passes || 3;
    return function (percentComplete) {
        return ((1 - Math.cos(percentComplete * Math.PI * passes)) *
                (1 - percentComplete)) + percentComplete;
    };
};

TimerAnimation.makeBounce = function (bounces) {
    var fn = AnimationTimer.makeElastic(bounces);
    return function (percentComplete) {
        percentComplete = fn(percentComplete);
        return percentComplete <= 1 ? percentComplete : 2 - percentComplete;
    };
};

TimerAnimation.makeLinear = function () {
    return function (percentComplete) {
        return percentComplete;
    };
};
