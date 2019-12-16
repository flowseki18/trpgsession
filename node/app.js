var app = require('http').createServer();
var io = require('socket.io').listen(app);
var fs = require('fs');
var user = [];
app.listen('49152');

io.sockets.on('connection', function(socket) {
        // 新規ユーザー追加
        socket.on('emit_user_info', function(userId, userName) {
            var newUser = {};
            newUser.userName = userName;
            newUser.userId = userId;
            let newData = user.filter(function(item, index) {
                if (item.userId == userId) {
                    io.sockets.emit('emit_user_update', userId, userName);
                    item.userName = userName;
                    return true;
                }
            });
            if (newData.length == 0) {
	            user.push(newUser);
	            io.sockets.emit('emit_user_add', userId, userName);
            }
        });

        // チャット送信
        socket.on('emit_from_client', function(user, username, data, imgPath, diceFlag) {
            io.sockets.emit('emit_from_server', user, username, data, imgPath, diceFlag);
        });
        
        // 入室通知送信
        socket.on('emit_user_enter_req', function(username) {
            io.sockets.emit('emit_user_enter_res', username);
        });

        // 退室通知送信
        socket.on('emit_user_exit_req', function(username) {
            io.sockets.emit('emit_user_exit_res', username);
        });

        // ログイン中ユーザー情報取得
        socket.on('emit_current_user_req', function() {
            io.sockets.emit('emit_current_user_res', user);
        });

        // 退出時ユーザー情報削除
        socket.on('emit_delete_user_req', function(userId) {
            let newData = user.filter(function(item, index) {
                if (item.userId != userId) return true;
            });

            user = newData;
        });

        // マップ変更
        socket.on('emit_change_map_req', function(imgPath) {
            io.sockets.emit('emit_change_map_res', imgPath);
        });

        // 初期ユーザー画像設置
        socket.on('emit_prepare_user_image_req', function(userId) {
            var srcFile = "/var/www/html/dodontoHe/character/image/unknown.jpg";
            var targetFile = "/var/file/room/img_" + userId + ".jpg";

            fs.copyFileSync(srcFile, targetFile);
        });

        // メモ共有
        socket.on('emit_memo_share_req', function(title, text) {
          io.sockets.emit('emit_memo_share_res', title, text);
          io.sockets.emit('emit_memo_share_notification_res', title);
        });
});

