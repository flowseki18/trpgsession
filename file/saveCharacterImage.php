<?php 
  //userId取得
  $userId = $_COOKIE['userId'];
  //ファイルの保存先
  $upload = '/var/file/room/img_'.$userId.'.jpg'; 
  //アップロードが正しく完了したかチェック
  if(move_uploaded_file($_FILES['file_upload']['tmp_name'], $upload)){
    echo 'アップロード完了';
  }else{
    echo $_FILES['file_upload']['tmp_name'];
    echo 'アップロード失敗'; 
  }
?>
