(function (window) {
	//1.创建闭包：使得函数内的值不受全局污染
	//2.传递window参数：使得Player成为全局变量，这是我们想要暴露给外界的值
	//3.init对象的原型改为了Player对象的原型，init创建出来的对象可以直接使用Player里面的方法
	function Player($audio) {
		return new Player.prototype.init($audio);
	}
	Player.prototype = {
		constructor: Player,
		musiclist: [],
		init: function ($audio) {
			this.$audio = $audio;
			//原生的js本身元素而非dom
			this.audio = $audio.get(0);
		},
		currentIndex: -1,
		playMusic: function (index, item) {
			//判断是否是同一首歌
			if (this.currentIndex == index) {
				//是同一首歌，是否暂停
				if (this.audio.paused) {
					this.audio.play();
				} else {
					this.audio.pause();
				}
			} else {
				//不是同一首歌
				this.$audio.attr("src", item.link_url);
				this.audio.play();
				this.currentIndex = index;
			}
		},
		deleteMusic: function (index, ele) {
			this.musiclist.splice(index,1);
		}
	}
	
	Player.prototype.init.prototype = Player.prototype;
	window.Player = Player;
})(window)