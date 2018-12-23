$(function () {
	//0.初始化滚动条
	$(".music_list").mCustomScrollbar({
		mouseWheelPixels: 500,
		scrollButtons:{
            scrollType:'pixels',
            enable:true,
            scrollAmount:30
        },
	});

	var $audio = $("audio");
	var player = new Player($audio);

	//1.加载音乐列表
	getTheMusicList();
	function getTheMusicList() {
		$.ajax({
			url: "./source/musiclist.json",
			dataType: "json",
			success: function (data) {
				player.musiclist = data;
				var $ul = $(".music_list ul");
				//遍历data，创建音乐列表
				$.each(data, function (index, item) {
					var $item = creatMusicItem(index, item);
					$ul.append($item);
				});
				//初始化歌曲信息
				initMusicInfo(data[0]);

			},
			error: function(e) {
				console.log(e);
			}
		}); 
	}

	//初始化歌曲信息
	function initMusicInfo(music){
		$(".album_pic").attr("src", music.cover);
		$(".bg_pic").css("background", "url('" + music.cover + "')" );
		$(".song_name").text(music.name);
		$(".song_name").attr("title",music.name);
		$(".singer_name").text(music.singer);
		$(".singer_name").attr("title",music.singer);
		$(".album_name").text(music.album);
		$(".album_name").attr("title",music.album);	
	}

	//初始化所有事件监听
	initEvents();
	function initEvents() {
		//监听鼠标移入时歌曲行图标的出现
		$(".music_list").delegate(".list_music", "mouseenter", function () {
			//显示图片
			$(this).find(".list_menu").addClass("show_list");
			//隐藏时长showList
			$(this).find(".list_time").addClass("show");
		});
		//监听鼠标移出时
		$(".music_list").delegate(".list_music", "mouseleave", function() {
			//隐藏图片
			$(this).find(".list_menu").removeClass("show_list");
			//显示时长
			$(this).find(".list_time").removeClass("show");
		});

		//点击checkbox时会出现选中现象
		$(".music_list").delegate(".list_check i", "click", function () {
			$(this).toggleClass("list_checked");
		});

		//按播放键时
		$(".music_list").delegate(".play", "click", function () {
			var $musicItem = $(this).parents(".list_music");
			//点击时切换状态
			$(this).toggleClass("play2");
			//其他元素去除播放状态
			$musicItem.siblings().find(".play").removeClass("play2");
			//同步底部按钮播放
			//当前按钮正在播放
			if ($(this).attr('class').indexOf('play2') >= 0) {
				//底部按钮也播放
				$(".begin").addClass("begin2");
				//当前文字高亮
				$musicItem.find("div").css({"color": "#fff"});
				//其他文字不高亮
				$musicItem.siblings().find("div").css({"color": "rgba(255,255,255,0.7)"});
				//当前图标一直出现
				$musicItem.find(".list_menu").addClass("show_list2");
				//其他图标一直不出现
				$musicItem.siblings().find(".list_menu").removeClass("show_list2");
			} else {
				//否则底部按钮不播放
				$(".begin").removeClass("begin2");
			}

			//监听音乐序号键的切换状态
			//播放时切换成wave按钮，隐藏数字;停止播放时恢复原状
			$musicItem.find(".list_number").toggleClass("list_number2");
			$musicItem.siblings().find(".list_number").removeClass("list_number2");

			//播放音乐
			player.playMusic($musicItem.get(0).index, $musicItem.get(0).item);	
		});

			//监听底部播放按钮
			//播放键
			$(".begin").click(function () {
				//如果是第一次播放音乐，则自动播放第一首
				if (player.currentIndex == -1) {
					$(".music_list").find(".play").eq(0).trigger("click");
				} else {
					//已播放过音乐，接着播放
					$(".music_list").find(".play").eq(player.currentIndex).trigger("click");
				}	
			});		
			//前一首
			$(".forward").click(function () {
				//如果当前音乐是第一首
				if (player.currentIndex == 0) {
					$(".music_list").find(".play").eq(player.musiclist.length - 1).trigger("click");
				} else {
					//如果当前音乐是最后一首
					$(".music_list").find(".play").eq(player.currentIndex - 1).trigger("click");
				}	
			});	

			//后一首
			$(".back").click(function () {
				//如果当前音乐是最后一首
				if (player.currentIndex == player.musiclist.length - 1) {
					$(".music_list").find(".play").eq(0).trigger("click");
				} else {
					//如果当前音乐是第一首
					$(".music_list").find(".play").eq(player.currentIndex + 1).trigger("click");
				}	
			});	

			//删除
			$(".music_list").delegate(".deleteList", "click", function () {
				var $musicItem = $(this).parents(".list_music");
				//删除这行元素
				$musicItem.remove();
				//后台json里删除这首歌信息
				player.deleteMusic($musicItem.get(0).index);
				//遍历后台新序号，更新前台序号和每首歌的索引
				$.each($(".music_list").find(".list_music"),function (index, ele) {
					$(this).children(".list_number").text(index + 1);
					$(this).get(0).index = index;
					$(this).get(0).ele = ele;
				});	
				//如果当前删除的歌曲在播放歌曲之前，要更新currentIndex
				if ($musicItem.get(0).index < player.currentIndex) {
					player.currentIndex--;
				}
			});

			//更新页面相应信息
			$(".music_list").click(function () {
				//找出当前正在播放的歌曲索引
				if (player.currentIndex != -1) {
					var $cover = player.musiclist[player.currentIndex].cover;
					var $name = player.musiclist[player.currentIndex].name;
					var $singer = player.musiclist[player.currentIndex].singer;
					var $album = player.musiclist[player.currentIndex].album;
					//换专辑图
					$(".album_pic").attr("src", $cover);
					//换背景图
					$(".bg_pic").css("background", "url('" + $cover + "')" );
					//换歌曲信息
					$(".song_name").text($name);
					$(".song_name").attr("title",$name);
					$(".singer_name").text($singer);
					$(".singer_name").attr("title",$singer);
					$(".album_name").text($album);
					$(".album_name").attr("title",$album);
				}				
			});

			//进度条事件
			var $songs_progress = $(".songs_progress");
			var $songs_line = $(".songs_progress .line_in");
			var $songs_linedot = $(".songs_progress .circle");
			var progress = new Progress($songs_progress, $songs_line, $songs_linedot);
			progress.progressClick();
			progress.progressMove();
	}

	function creatMusicItem(index, item) {
		var $item = $("	<li class=\"list_music\"> \n" + 
	                    "     <div class=\"list_check\"><i></i></div> \n" + 
	                    "     <div class=\"list_number\">" + (index + 1) + "</div> \n" + 
	                    "     <div class=\"list_name\">" + item.name +" \n" + 
						" 		<div class=\"list_menu\"> \n" + 
						" 			<a href=\"javascript:\" title=\"播放\" class=\"play\"></a> \n" + 
						" 			<a href=\"javascript:\" title=\"添加\"></a> \n" + 
						" 			<a href=\"javascript:\" title=\"下载\"></a> \n" + 
						" 			<a href=\"javascript:\" title=\"分享\"></a> \n" + 
						" 		</div> \n" + 
	                    "     </div> \n" + 
	                    "     <div class=\"list_singer\">" + item.singer +"</div> \n" + 
	                    "     <div class=\"list_time\"> \n" + 
	                    "     	<span>" + item.time +"</span> \n" + 
	                    "    	<a href=\"javascript:\" title=\"删除\" class=\"deleteList\"></a> \n" + 
	                    "    </div> \n" + 
	                    " </li>	     ");
		$item.get(0).index = index;
		$item.get(0).item = item;
		return $item;
	}
});