$(function() {
  var socket = io.connect("http://13.115.118.158:49152");
  var userId = "";
  var userName = "";
  var createFlag = "";
  var MAP_IMAGE_PATH = "";
  var DICE_FLAG = 0;
  var USER_IMAGE_PATH = "./character/image/unknown.jpg";
  /**
  * 初回ログイン
  */
  if (document.cookie.indexOf("userId") == -1) {
    window.location.href = "./login.html";
  }

  /**
   * cookieからuserId取得
   */
  $(document).ready(function() {
    var cookieData = document.cookie.split(';');
    cookieData.forEach(function(value) {
      if (value.indexOf("userId") != -1) {
        var content = value.split('=');
        userId = content[1];
        $("#cookie-userId").val(userId);
      }
      if (value.indexOf("userName") != -1) {
        var content = value.split('=');
        userName = content[1];
        $("#cookie-userName").val(userName);
      }
      if (value.indexOf("createFlag") != -1) {
        var content = value.split('=');
        createFlag = content[1];
      }
    });

    if (createFlag == "1") {
      $(".menu-area img").attr("src", "/dodontoHe/file/image/room/img_" + userId + ".jpg" + "?" + new Date().getTime());
      USER_IMAGE_PATH = "/dodontoHe/file/image/room/img_" + userId + ".jpg" + "?" + new Date().getTime();
      socket.emit('emit_user_info'  , userId, userName);
    } else {
      socket.emit('emit_prepare_user_image_req', userId);
    }

     socket.emit('emit_user_enter_req', userName);
  });

  /**
   * 入手時処理
   */

  /**
   * ユーザー追加
   */
  socket.on('emit_user_add', function(userid, username) {
    createUser(userid, username);

    // 自分？
    if (userid == userId) {
      $(".menu-area img").attr("src", "/dodontoHe/file/image/room/img_" + userId + ".jpg" + "?" + new Date().getTime());
      USER_IMAGE_PATH = "/dodontoHe/file/image/room/img_" + userId + ".jpg" + "?" + new Date().getTime();
      userName = username;
    }
  });

  /**
   * ログイン中ユーザー取得
   */
  socket.emit('emit_current_user_req');
  socket.on('emit_current_user_res', function(user) {
    $('#user-name ul').empty();
    user.forEach(function(target) {
      createUser(target.userId, target.userName);
    });
  });

  /**
   * ユーザー更新
   */
  socket.on('emit_user_update', function(userid, username) {
    // 自分？
    if (userid == userId) {
      $(".menu-area img").attr("src", "/dodontoHe/file/image/room/img_" + userId + ".jpg" + "?" + new Date().getTime());
      USER_IMAGE_PATH = "/dodontoHe/file/image/room/img_" + userId + ".jpg"  + "?" + new Date().getTime();
      userName = username;
    }
    // User一覧更新
    let userList = $('#user-name li , #user-name input');
    for (let i = 1; i < userList.length; i++) {
        if (userList[i].value == userid) {
            userList[i - 1].textContent = username;
        }
    }
  });

  /**
   * 入室通知
   */
  socket.on('emit_user_enter_res', function(username) {
    createEnterTxt(username);
    $("#chat-area").animate({scrollTop:$("#chat-area")[0].scrollHeight});
  });

  /**
   * 退室通知
   */
  socket.on('emit_user_exit_res', function(username) {
    createExitTxt(username);
    $("#chat-area").animate({scrollTop:$("#chat-area")[0].scrollHeight});
  });

  /**
   * マップ変更
   */
  socket.on('emit_change_map_res', function(imagePath) {
    $("#map-content img").attr("src", "/dodontoHe/file/image/room/map/map_image.jpg" + "?" + new Date().getTime());
  });

  /**
   * チャット送信
   */
  $("#myform").submit(function(e) {
    e.preventDefault();
    if ($('#msg').val() == "") {
      return;
    }
    if ($('#msg').is(':focus')) {
      return;
    }
    socket.emit('emit_from_client', userId, userName, $('#msg').val(), USER_IMAGE_PATH, DICE_FLAG);
    $('#msg').val("");
  });

  /**
   * チャット受信
   */
  socket.on('emit_from_server', function(user, username, data, imgPath, diceFlag) {
    if (user == userId) {
      createMyChatTxt(data);
    } else {
      createOtherChatTxt(data, username, imgPath);
    }
    $("#chat-area").animate({scrollTop:$("#chat-area")[0].scrollHeight});
  });

  /**
   * マップ拡大縮小
   */
  $("#map").tinyDraggable();
  $("#dice-area").tinyDraggable();

  var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
  var scale = 1;
  $("#map-content").on(mousewheelevent,function(e){
    e.preventDefault();
    var delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
    if (delta < 0){
      scale -= 0.2;
    } else {
      scale += 0.2;
    }
    $("#map").css("transform","scale(" + scale +")");
  });

  //個別ファンクション
  function createMyChatTxt(data) {
    var chat = '<div class="kaiwa">';
    chat += '<figure class="kaiwa-img-right">';
    chat += '<img src="';
    chat += USER_IMAGE_PATH;
    chat += '">';
    chat += '</figure>';
    chat += '<div class="kaiwa-img-description-right">';
    chat += userName;
    chat += '</div>';
    chat += '<div class="kaiwa-text-left">';
    chat += '<p class="kaiwa-text">';
    chat += data;
    chat += '</p></div></div>';
    $('#chat-area').append(chat);
  }
  function createOtherChatTxt(data, username, imgpath) {
    var chat = '<div class="kaiwa">';
    chat += '<figure class="kaiwa-img-left">';
    chat += '<img src="';
    chat += imgpath;
    chat += '">';
    chat += '</figure>';
    chat += '<div class="kaiwa-img-description-left">';
    chat += username;
    chat += '</div>';
    chat += '<div class="kaiwa-text-right">';
    chat += '<p class="kaiwa-text">';
    chat += data;
    chat += '</p></div></div>';
    $('#chat-area').append(chat);
  }
  function createUser(userid, dispUserName) {
    var user =  "<li>" + dispUserName + "</li>"
    var hidden = "<input type=hidden value=" + userid + ">";
    $('#user-name ul').append(user);
    $('#user-name ul').append(hidden);
  }
  function createMemo() {
    var memo =  "<li>" + 新規メモ + "</li>"
    $('#memo-select-area ul').append(memo);
  }
  function createEnterTxt(username) {
    var chat = '<div class="chat-notification">' + username + 'が入室しました。</div>';
    $('#chat-area').append(chat);
  }
  function createExitTxt(username) {
    var chat = '<div class="chat-notification">' + username + 'が退室しました。</div>';
    $('#chat-area').append(chat);
  }
  function createShareMemoTxt(title) {
    var chat = '<div class="memo-notification">共有メモ：' + title + 'が追加されました。</div>';
    $('#chat-area').append(chat);
  }

  /**
   * キャラ情報取得
   */
  $(document).on("click", ".user-name li", function() {
    $(".user-info-status-load").css("display", "inline-block");
    //$(".user-name li").css("border-left", "solid 6px gray");
    $(".user-name li").css("border-left", "solid 6px transparent");
    $(".user-name li").css("background-color", "transparent");
    $(".user-info-status-main, .user-info-status-detail").hide();
    $(".user-info-status-skill tr").remove();
    $(".user-info-status-item tr").remove();
    $.ajax({
      url:"http://13.115.118.158/dodontoHe/file/image/room/profile_" + $(this).next("input").val() +".json",
      type:"GET",
      dataType:"json",
      cache: false
    }).fail(function(XMLHttpRequest, textStatus, errorThrown){
      console.log(XMLHttpRequest.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).done(function(data) {
      for (var param in data) {
        /* 技能ポイント */
        if (param.indexOf("SP") != -1) {
          if ($(".user-info-status-skill tr").length == 0) {
            for (var j = 0; j < data[param].length; j++) {
              var row = "<tr><td class='skill-name dice-judge'></td><td class='skill-point'></td><td>"
              $(".user-info-status-skill tbody").append(row);
            }
          }
          if (param.indexOf("SPNAME") != -1) {
            for (var i in data[param]) {
              $(".user-info-status-skill .skill-name")[i].textContent = data[param][i];
            }
          }
          if (param.indexOf("SPTOTAL") != -1) {
            for (var i in data[param]) {
              $(".user-info-status-skill .skill-point")[i].textContent = data[param][i];
            }
          }
        }
        /* 所持品 */
        if (param.indexOf("ITEM") != -1) {
          if ($(".user-info-status-item tr").length == 0) {
            for (var j = 0; j < data[param].length; j++) {
              var row = "<tr><td class='item-name'></td></tr>";
              $(".user-info-status-item tbody").append(row);
            }
          }
          if (param.indexOf("ITEMNAME") != -1) {
            for (var i in data[param]) {
              $(".user-info-status-item .item-name")[i].textContent = data[param][i];
            }
          }
        }
        if (param.indexOf("imgpath") != -1) {
          $(".user-info-status-main img").attr("src", data[param]);
        }
        $(".user-info-status ." + param).text(data[param]);
      }
      $(".user-info-status-load").css("display", "none");
    });
    $(".user-info-status-main, .user-info-status-detail").each(function(i) {
      $(this).delay(200 * i).fadeIn(500);
    });
    $(this).css("border-left", "solid 6px #1fa67a");
    //$(this).css("background-color", "gray");
  });

  /**
   * マップ画像差し替え
   */
  $("#change-map").on('click', function(){
    $(".file-upload").click();
  });
  $('#map-form').on('submit', function (e) {
    e.preventDefault();
    var imagePath = "/dodontoHe/file/image/room/map/map_image.jpg"
    $(this).ajaxSubmit({
      success:function() {
        socket.emit('emit_change_map_req', imagePath);
      }
    });
  });

  /**
   * スキル判定
   */
  $(document).on('click', ".dice-judge", function() {
    $("#100-dice-select").click();
    let tr = $(this).closest("tr");
    /*
    let skillName = $(tr).find(".skill-name").text();
    let skillPoint = $(tr).find(".skill-point").text();
    */
    let key = $(tr).find("td").eq(0).text();
    let value = $(tr).find("td").eq(1).text();
    window.dice.diceThrow(key, value);
  });

  /**
   *  メモ追加
   */
  $(".add-memo").on("click", function() {
    var memo = "<li>新規メモ</li>";
    memo += '<input type="hidden" class="tmp-memo-title" value="新規メモ">';
    memo += '<input type="hidden" class="tmp-memo-text" value="">';
    $(".memo-select-area ul").append(memo);
  });

  /**
   *  メモ選択
   */
  $(document).on("click", ".memo-select-area li", function() {
    $(".memo-title, .btn-memo-shared, .memo-text").hide();
    if ($(".memo-title").val() != "") {
      $(".memo-selected").text($(".memo-title").val());
    } else {
      $(".memo-selected").text("新規メモ");
    }
    $(".memo-selected").nextAll(".tmp-memo-title:first").val($(".memo-title").val());
    $(".memo-selected").nextAll(".tmp-memo-text:first").val($(".memo-text").val());
    $(".memo-title").val($(this).nextAll(".tmp-memo-title:first").val());
    $(".memo-text").val($(this).nextAll(".tmp-memo-text:first").val());
    $(".memo-selected").removeClass("memo-selected");
    $(this).addClass("memo-selected");

    $(".memo-title, .btn-memo-shared").delay(100).fadeIn(200);
    $(".memo-text").delay(200).fadeIn(200);
  });

  /**
   *  メモタイトル変更
   */
  $(document).on("blur", ".memo-title", function() {
    if ($(".memo-title").val() != "") {
      $(".memo-selected").text($(".memo-title").val());
    } else {
      $(".memo-selected").text("新規メモ");
    }
  });

  /**
   *  メモ共有
   */
  $(document).on("click", ".btn-memo-shared", function() {
    if (confirm("ログイン中のユーザーにメモを共有します。よろしいですか？")) {
      var title = $(".memo-title").val();
      var text = $(".memo-text").val();
      socket.emit('emit_memo_share_req', title, text);
      alert("メモを共有しました。");
    }
  });

  socket.on('emit_memo_share_res', function(title, text) {
    var memo = "<li>" + title + "</li>";
    memo += '<input type="hidden" class="tmp-memo-title" value="' + title + '">';
    memo += '<input type="hidden" class="tmp-memo-text" value="' + text + '">';
    $(".memo-select-area ul").append(memo);
  });
  
  socket.on('emit_memo_share_notification_res', function(title) {
    createShareMemoTxt(title);
  });

  /**
   * 退出時処理
   */
  $(window).on('beforeunload', function() {
    socket.emit('emit_delete_user_req', userId);
    socket.emit('emit_user_exit_req', userName);
    socket.emit('emit_current_user_req');
  });

});
