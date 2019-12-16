$(function() {
    //ログイン画面のユーザー情報取得
    var userId = "";
    var userName = "";
    var createFlag = "";
    var imgPath = "./character/image/unknown.jpg";
    var diceFlag = 1;
    var socket = io.connect("http://13.115.118.158:49152");
    
    window.dice = window.dice || {};
    window.dice.diceThrow = diceThrow;
    
    /*****************************************************
     cookieからuserId取得
    *****************************************************/
    $(document).ready(function() {
      var cookieData = document.cookie.split(';');
      cookieData.forEach(function(value) {
        if (value.indexOf("userId") != -1) {
          var content = value.split('=');
          userId = content[1];
        }
        if (value.indexOf("userName") != -1) {
          var content = value.split('=');
          userName = content[1];
        }
        if (value.indexOf("createFlag") != -1) {
          var content = value.split('=');
          createFlag = content[1];
        }
      });
      if (createFlag == "1") {
        imgPath = "/dodontoHe/file/image/room/img_" + userId + ".jpg";
      }
    });

    /*****************************************************
     ユーザー追加 
    *****************************************************/
    socket.on('emit_user_add', function(userid, username) {
       // 自分？
       if (userid == userId) {
         userName = username;
         imgPath = "/dodontoHe/file/image/room/img_" + userId + ".jpg";
       }
    });

    /*****************************************************
     ユーザー更新
    *****************************************************/
    socket.on('emit_user_update', function(userid, username) {
      // 自分？
      if (userid == userId) {
        imgPath = "/dodontoHe/file/image/room/img_" + userId + ".jpg"  + "?" + new Date().getTime();
        userName = username;
      }
    });

    /*****************************************************
     ダイスのTHROW
    *****************************************************/
    $("#dice-throw").on('click', function(){
        diceThrow("", "");
    });

    function diceThrow(skillName, skillPoint) {
        if ($(".dice-throw-area img").length == 0) {
          return;
        }
        var height = $(".tab-content").height();
        height = height * 0.93;
        anime({
            targets: ".dice-throw-gif",
            keyframes: [
                {translateY: height},
                {translateY: height - 100},
                {translateY: height - 100},
                {translateY: height},
            ],
            rotate: "10turn",
            easing: 'linear',
            duration: 2000,
        })
        setTimeout(function() {
            var diceList = $(".dice-throw-area").children();
            var diceUrl = "";
            var onesDice = "9";
            var total = 0;
            for(i = 0; i < diceList.length; i++) {
                var type = $(diceList[i]).attr("val");
                var result = Math.floor(Math.random() * Math.floor(parseInt(type, 10)));
                result = result + 1;
                total += result;
                //100ダイスの場合個別処理
                if(type == "100") {
                    tens = Math.floor(result / 10) * 10;
                    ones = String(result).slice(-1);
                    if(result == 100) {
                        tens = 0;
                        ones = 0;
                    }
                    diceUrl = "./image/" + type + "_dice/" + type + "_dice[" + tens + "].png";
                    $(diceList[i]).attr("src", diceUrl);
                    diceUrl = "./image/" + onesDice + "_dice/" + onesDice + "_dice[" + ones + "].png";
                    $(diceList[i + 1]).attr("src", diceUrl);
                    i++;
                    continue;
                }
                diceUrl = "./image/" + type + "_dice/" + type + "_dice[" + result + "].png";
                $(diceList[i]).attr("src", diceUrl);
            }
            if (skillPoint != "") {
                // スキル判定
                var judge = "";
                if (total > skillPoint) {
                    judge = "失敗";
                    if (total > 95) {
                        judge = "致命的失敗";
                    }
                } else {
                    judge = "成功";
                    if (total < 6) {
                        judge = "クリティカル";
                    }
                }
                total = skillName + " " + total + "/" + skillPoint + " " + judge;
            }
            socket.emit('emit_from_client', userId, userName, total, imgPath, diceFlag);
        },1950);
        setTimeout(function() {
                $(".dice-throw-gif").remove();
        },5000);
    }

    /*****************************************************
     ダイスの追加
    *****************************************************/
    $(".dice-select-img").on('click', function(e){
        var type = $(e.target).attr("val");
        addDiceGif(type);
        if(type == "100") {
            addDiceGif("9");
        }
    });

    /*****************************************************
     ダイスの削除
    *****************************************************/
    $("#dice-delete").on('click', function(e) {
        var diceList = $(".dice-throw-area").children();
        var target = diceList[diceList.length - 1];
        if($(target).attr("val") == 9) {
            diceList[diceList.length - 2].remove();
        }
        $(target).remove();
    })

    function addDiceGif(type) {
        var imgUrl = "./image/dice_roll/" + type + "_dice.gif";
        var img = document.createElement("img");
        img.setAttribute("src", imgUrl);
        img.setAttribute("class", "dice-throw-gif");
        img.setAttribute("id", type + "-dice-select");
        img.setAttribute("val", type);
        $(".dice-throw-area").append(img);
    }
});
