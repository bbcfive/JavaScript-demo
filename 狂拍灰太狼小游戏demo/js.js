$(function () {
	//监听开始游戏
	$(".start").click(function () {
		//点击开始按钮后开始游戏
		startGame();
		//执行灰太狼小灰灰动画
		wolf_animation();		
	});

	//点击重新开始后重启游戏
	$(".restart").click(function () {
		//将分数归零
		$(".score").text(0);
		//重启游戏后重新开始页面消失
		$(".over").fadeOut(100);
		startGame();
		wolf_animation();
	});	

	//监听游戏规则
	$(".rules").click(function () {
		//点击游戏规则后弹出规则页面
		$(".rule").css({display:"block"});
		//点击关闭后关闭游戏规则
		$(".rule>.close").click(function () {
			$(".rule").css({display:"none"});
		});
	});

	var animation;
	var wolfStart, wolfEnd;
	//制作灰太狼与小灰灰动画
	function wolf_animation() {
		//创建一张小照片，在洞里插入灰太狼小灰灰
		var $img = $("<img src = '' class = 'image'></img>");		
		$(".main").append($img);
        // 1.定义两个数组保存所有灰太狼和小灰灰的图片
        var wolf_1=['./images/h0.png','./images/h1.png','./images/h2.png','./images/h3.png','./images/h4.png','./images/h5.png','./images/h6.png','./images/h7.png','./images/h8.png','./images/h9.png'];
        var wolf_2=['./images/x0.png','./images/x1.png','./images/x2.png','./images/x3.png','./images/x4.png','./images/x5.png','./images/x6.png','./images/x7.png','./images/x8.png','./images/x9.png'];
        var wolf = [wolf_1, wolf_2];
        // 2.定义一个数组保存所有可能出现的位置
        var arrPos = [
            {left:"100px",top:"115px"},
            {left:"20px",top:"160px"},
            {left:"190px",top:"142px"},
            {left:"105px",top:"193px"},
            {left:"19px",top:"221px"},
            {left:"202px",top:"212px"},
            {left:"120px",top:"275px"},
            {left:"30px",top:"295px"},
            {left:"209px",top:"297px"}
        ];	

        //随机定位
        var indexPos = Math.round(Math.random()*8)//返回0~8的数值
        //随机选小灰灰or灰太狼
        var indexRole = Math.round(Math.random())//返回0~1的数值   

        //设置初始图片值
        wolfStart = 0, wolfEnd = 6;
        //主体动画
        animation = setInterval(function () {
        	//判断出现的是第几张图
        	if (wolfStart < wolfEnd) {
	         	$(".image").attr("src",wolf[indexRole][wolfStart]);
	        	wolfStart++;       		
        	} 
        	else {
         		$(".image").remove();
        		clearInterval(animation);
        		wolf_animation();       		
        	}
        },50); 
        
        //随机设置出现位置
        $(".image").css({
        	position: "absolute",
        	top: arrPos[indexPos].top,
        	left: arrPos[indexPos].left
        });	        
 
 		//监听点选事件
		$(".image").one("click", function () {
			//改图片6-9
			wolfStart = 6;
			wolfEnd = 9;
			console.log($(".image").attr("src"));
			//判断是灰太狼还是小灰灰
			var mark = $(".image").attr("src");
			if (mark.indexOf('h') >=0 ) {
				//是灰太狼，加10分
				$(".score").text(parseInt($(".score").text())+10);
			} else {
				//是小灰灰，减10分
				$(".score").text(parseInt($(".score").text())-10);
			}
		});       
	}

	//结束动画
	function stopAnimation() {
		$(".image").remove();
		clearInterval(animation);
	}


	//开始游戏
	function startGame() {
		$(".start").fadeOut(100);
		//设置进度条初始长度
		var progressLength = 180;	
		//设置一个定时器	
		var timer = setInterval(function () {
			//开始游戏后进度条逐渐消失
			progressLength -= 0.5;
			$(".progress").css({
				width: progressLength
			});
			//如果进度条走到尽头
			if (progressLength <= 0) {
				clearInterval(timer);
				$(".over").fadeIn(100);
				//结束动画
				stopAnimation();
			}			
		}, 50);
	}

});