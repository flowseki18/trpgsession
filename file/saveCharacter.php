<?php
    $data = $_POST;
	$json = json_encode($data);
    $userId = $_COOKIE['userId'];

	$filename = "/var/file/room/profile_".$userId.".json";
    $file = fopen ($filename,"w");       //書き込み用モードでデータを開く
    flock ($file, LOCK_EX);      //ファイルロック開始
    fputs ($file,$json);       //書き込み処理
    flock ($file, LOCK_UN);        //ファイルロック解除
    fclose ($file);          //ファイルを閉じる

    header("HTTP/1.1 200 OK");
    header("Status: 200");
    header("Content-Type: application/json");
    echo "OK";
?>
