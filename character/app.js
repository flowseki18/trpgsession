$(function(){

  var socket = io.connect("http://13.115.118.158:49152");
  var userId = "";
  var skillRow = {};
  /**
  * cookieからuserId取得
  */
  $(document).ready(function() {
    if (document.cookie.indexOf("userId") == -1) {
      return;
    }

    var cookieData = document.cookie.split(';');
    cookieData.forEach(function(value) {
      if (value.indexOf("userId") != -1) {
        var content = value.split('=');
        userId = content[1];
      }
    });

    // データをJSON形式で取得
    $.ajax({
      url:"http://13.115.118.158/dodontoHe/file/image/room/profile_" + userId + ".json",
      type:"GET",
      dataType:"json",
      cache: false
    })
    .done(function(data) {
      for (let param in data) { 
       /* スキルポイント */
       if (param.indexOf("SP") != -1) {
          if ($(".custom-skill-area tr").length - 1 < data[param].length) {
            for (let j = 1; j < data[param].length; j++) {
              $(".custom-skill-area .add-skill-btn").click();
            }
          }
          if (param.indexOf("SPNAME") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .skill-name")[i].value = data[param][i];
            }
          }
          if (param.indexOf("SPINIT") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .init-point-disp")[i].value = data[param][i];
              $(".custom-skill-area .init-point")[i].value = data[param][i];
            }
          }
          if (param.indexOf("SPJOB") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .job-point")[i].value = data[param][i];
            }
            $(".custom-skill-area .job-point").trigger("input");
          }
          if (param.indexOf("SPINTE") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .interest-point")[i].value = data[param][i];
            }
            $(".custom-skill-area .interest-point").trigger("input");
          }
          if (param.indexOf("SPGROW") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .grow-point")[i].value = data[param][i];
            }
          }
          if (param.indexOf("SPOTHER") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .other-point")[i].value = data[param][i];
            }
          }
          if (param.indexOf("SPTOTAL") != -1) {
            for (var i in data[param]) {
              $(".custom-skill-area .total-point-disp")[i].value = data[param][i];
              $(".custom-skill-area .total-point")[i].value = data[param][i];
            }
          }
          continue;
        }

        /* 所持品 */
       if (param.indexOf("ITEM") != -1) {
          if ($(".item-area tr").length - 1 < data[param].length) {
            for (let j = 1; j < data[param].length; j++) {
              $(".item-area .add-skill-btn").click();
            }
          }
          if (param.indexOf("ITEMNAME") != -1) {
            for (var i in data[param]) {
              $(".item-area .item-name")[i].value = data[param][i];
            }
          }
          if (param.indexOf("ITEMDETAIL") != -1) {
            for (var i in data[param]) {
              $(".item-area .item-detail")[i].value = data[param][i];
            }
          }
          continue;
        }
        /* 画像 */
        if (param.indexOf("imgpath") != -1) {
          $(".basic-profile-area img").attr("src", data[param]);
        } 
        /* その他 */
        $("input[name='" + param + "']").val(data[param]);
        $("input[name='" + param + "']").trigger("input");
      }
    });

  });

  /**
  * 送信
  */
  $(".send-btn").on('click', function() {
    var obj = $("form").serializeArray();
    var json = {};
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].name.indexOf('[]') != -1) {
        obj[i].name = obj[i].name.slice(0, -2);
        if (obj[i].name in json) {
          json[obj[i].name].push(obj[i].value);
        } else {
          json[obj[i].name] = [];
          json[obj[i].name].push(obj[i].value);
        }
      } else {
        json[obj[i].name] = obj[i].value;
      }
    }

    socket.emit('emit_user_info'  , userId, json.name);

    // データをJSON形式で保存
    $.ajax({
      url:"http://13.115.118.158/dodontoHe/file/saveCharacter.php",
      type:"POST",
      dataType:"json",
      data:json
    });
    var now = new Date();
    now.setDate(now.getDate() + 1);
    document.cookie = "createFlag=1;path=/dodontoHe;" + "expires=" + now.toUTCString(); 
    document.cookie = "userName=" + json.name + "; path=/dodontoHe;" + "expires=" + now.toUTCString(); 
    alert("送信しました。");
    window.close();
  });
  /**
  * プロフィール画像差し替え
  */
  $(".char-img").on('click', function(){
    $(".file-upload").click();
  });
  $('#form').on('submit', function (e) {
    e.preventDefault();
    var imagePath = "/dodontoHe/file/image/room/" + "img_" + userId + ".jpg" + "?" + new Date().getTime();
    $(this).ajaxSubmit({
      success:function() {
        $(".char-img img").attr("src", imagePath);
        $(".img-path").val(imagePath);
      }
    });
  });
  /**
  * 能力値のプラスマイナスボタン
  */
  $(".basic-status-up").on('click', function() {
    var target = $(this).closest('tr').find('input')[0];
    if(isNaN(target.value)) {
      target.value = 0;
    }
    target.value = Number(target.value) + 1;
    $(target).trigger("input");
  });
  $(".basic-status-down").on('click', function() {
    var target = $(this).closest('tr').find('input')[0];
    if(isNaN(target.value) || Number(target.value) == 0) {
      return;
    }
    target.value = Number(target.value) - 1;
    $(target).trigger("input");
  });
  /**
  * ポイントのプラスマイナスボタン
  */
  $(".basic-points-up").on('click', function() {
    let target = $(this).closest('tr').find('input')[1];
    if(isNaN(target.value)) {
      target.value = 0;
    }
    var newVal = Number(target.value) + 1;
    $(this).closest('tr').find('input')[0].value = newVal;
    $(this).closest('tr').find('input')[1].value = newVal;
  });
  $(".basic-points-down").on('click', function() {
    let target = $(this).closest('tr').find('input')[1];
    if(isNaN(target.value) || Number(target.value) == 0) {
      return;
    }
    var newVal = Number(target.value) - 1;
    $(this).closest('tr').find('input')[0].value = newVal;;
    $(this).closest('tr').find('input')[1].value = newVal;;
  });
  /**
  * ステータスダイス
  */
  $(".basic-status-dice").on("click", function(e) {
    var target = $(this).closest('tr').find('input')[0];
    var diceArray = $(this).text().replace(/[^0-9]/g, '');
    var result = 0;

    for(var i = 0; i < Number(diceArray[0]); i++) {
      result += Math.floor(Math.random() * Math.floor(parseInt(diceArray[1], 10)));
      result += 1;
    }
    if(diceArray.length > 2) {
      result += Number(diceArray[2]);
    }
    target.value = result;
    $(target).trigger("input");
  })
  /**
  * ステータス入力時に能力ポイントを設定する
  */
  $(".basic-status input").on({
    "input" : function(e) {
      var target = e.currentTarget.name;
      var val = e.currentTarget.value;

      if(target == "pow") {
        $("#san input").val(val * 5);
        $("#luck input").val(val * 5);
        $("#mp input").val(val);
      }
      if(target == "dex") {
        $("#avoidance input").val(val * 2);
      }
      if(target == "int") {
        $("#idea input").val(val * 5);
        $("#interest-p input[name='total-interestP']").val(val * 10);
      }
      if(target == "edu") {
        $("#education input").val(val * 5);
        $("#job-p input[name='total-jobP']").val(val * 20);
      }
      if(target == "con" || target == "size") {
        val = Number($("input[name='con']")[0].value) + Number($("input[name='size']")[0].value);
        $("#hp input").val(Math.floor(val / 2));
      }
    }
  } );

  /**
  * 職業ポイント加算時
  */
  $(document).on("input", ".job-point", function(e) {
    var total = 0;
    $(".job-point").each(function() {
      if (isNaN(this.value)) {
        this.value = "";
        return;
      }
      total += (+this.value || 0);
    });
    $("#job-p input[name='current-jobP']").val(total);
  });
  /**
  * 興味ポイント加算時
  */
  $(document).on("input", ".interest-point", function(e) {
    var total = 0;
    $(".interest-point").each(function() {
      if (isNaN(this.value)) {
        this.value = "";
        return;
      }
      total += (+this.value || 0);
    });
    $("#interest-p input[name='current-interestP']").val(total);
  });

  /**
  * スキル合計ポイント算出
  */
  $(document).on("input", ".skill-point-area .table-cell input", function(e) {
    var total = 0;
    var data = $(this).closest('tr').find('input');
    $(data).not(".no-calc-point").each(function(){
      total += (+this.value || 0);
    })
    $(this).closest('tr').find('.total-point-disp').val(total);
    $(this).closest('tr').find('.total-point').val(total);
  });

  /**
  * アコーディオン開閉
  */
  $(".title").on("click", function() {
    var target = $(this).next("div");
    var title = $(this)
    $(target).slideToggle(30, function() {
      if ($(target).css("display") != "none") {
        $(title).css("background-color", "#24292e");
      } else {
        $(title).css("background-color", "gray");
      }
    });
  });

  /**
  * 行追加
  */
  $(".add-skill-btn").on("click", function(e) {
    var target = $(this).parent().find("table");
    var row = target.find("tr")[1];
    var addRow = $(row).clone();
    var text = addRow.find("input");
    for (var i in text) {
      text[i].value = "";
    }
    $(target).find("tbody")[0].append(addRow[0]);
  });
  /**
  *　行削除
  */
  $(".delete-skill-btn").on("click", function(e) {
    var target = $(this).parent().find("table");
    if ($(target).find("tr").length < 3) {
      return;
    }
    $(target).find("tr:last").remove();
  });

  /**
  * スキルウィンドウ
  */
  $(document).on("click", ".skill-select-btn", function() {
    $("#skill-select-window").css("display","block");
    $("body").css("overflow","hidden");
    skillRow = $(this).closest("tr");
  });
  $("#another-window-close").on("click", function() {
    $("#skill-select-window").css("display","none");
    $("body").css("overflow","auto");
  });
  $("#skill-select-window .skill-name").on("click", function() {
    var skillName = $(this).text();
    var initVal = $(this).find("input").val();
    skillRow.find(".skill-name").val(skillName);
    skillRow.find(".init-point-disp").val(initVal);
    skillRow.find(".init-point").val(initVal);
    skillRow.find(".init-point-disp").trigger("input");
    $("#skill-select-window").css("display","none");
    $("body").css("overflow","auto");
  });
});
