(function (window) {
	function Progress($songs_progress,$songs_line,$songs_linedot) {
		return new Progress.prototype.init($songs_progress,$songs_line,$songs_linedot);
	}
	Progress.prototype = {
		constructor: Progress,
		musiclist: [],
		init: function ($songs_progress,$songs_line,$songs_linedot) {
			this.progress = $songs_progress;
			this.line = $songs_line;
			this.dot = $songs_linedot;
		},
		progressClick: function (event) {
			var _this = this;
			this.progress.click(function (event) {
				//获取背景相对于窗口的默认距离
				var $distance = $(this).offset().left;
				//获取点击地点相对于窗口的距离
				var $gap = event.pageX;
				//更新前景线的位置
				var $newGap = $gap - $distance;
				$(_this.line).css("width", $newGap);
				$(_this.dot).css("left", $newGap);
			});
		},
		progressMove: function() {
			var _this = this;
			this.progress.mousedown(function (event) {
				//获取背景相对于窗口的默认距离
				var $distance = $(this).offset().left;
				$(document).mousemove(function (event) {
					//获取点击地点相对于窗口的距离
					var $gap = event.pageX;
					//更新前景线的位置
					var $newGap = $gap - $distance;
					$(_this.line).css("width", $newGap);
					$(_this.dot).css("left", $newGap);
				});					
			});	
			$(document).mouseup(function (event) {
				$(document).off("mousemove");
			});			
		}
	}
	
	Progress.prototype.init.prototype = Progress.prototype;
	window.Progress = Progress;
})(window)