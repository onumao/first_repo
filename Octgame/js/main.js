const gameboad = document.getElementById('gameboad'); // ゲームボードのテーブル取得
const MPcell = document.getElementById('MPcell'); // MPのテーブル取得
var I_cells = { // イカについて
    cells: [], // 移動するセル
    x: [],
    y: []
};
var T_cells = { // タコについて
    cells: [], // 移動するセル
    x: 1 // タコのいるセル
};
var mp_array; // mpゲージ
var MP = 4; // 残りmp

loadgameboad(); // ゲームボードを読み込む
setgameboad(); // ゲームボードに画像を貼る

// 残り時間カウント
var timecount = 0;
var end = 0;
var timer = setInterval(function () {
    timecount++;
    document.getElementById("time-value").textContent = 60 - timecount;

    // mpを1回復させる
    if (MP !== 4) { // mpが満タンではないならば
        MP += 1;
        mp_array[MP - 1].className = "blue";
    }

    // 終了条件
    if (timecount == 60) {
        clearInterval(timer);
        end = 1;

        // 効果音再生
        document.getElementById("gameset").currentTime = 0;
        document.getElementById("gameset").play();

        // スコア表示
        var result = document.getElementById("score-value").textContent; // スコア取得
        document.getElementById("result_text").textContent = lastmessage(result); // 点数によって最後のメッセージが変わる
        document.getElementById("totalscore").textContent = "SCORE : " + result; // 点数表記

        var dialog = document.querySelector('dialog'); // ダイアログ
        dialog.show();


    }
}, 1000);


/* 何かしらキーボードが押された時 */
document.onkeydown = function (e) {

    /* スペースキー */
    if (end === 0) { // 制限時間内の時

        var ika = 0; // イカを倒した数をカウント

        if (e.keyCode === 32) { // スペースキー
            //console.log("スペースキーが押された");
            // 必殺技(ワイド)

            if (MP >= 3) { // mpが足りていれば実行
                mpmainasu(3); // mpを3減らす

                // 横一列を一瞬白くする
                var row = 2;
                for (var col = 0; col < 3; col++) {
                    ika += white(col, row); // 一瞬白くする イカを倒す
                }

                // 効果音再生
                document.getElementById("space_atack").currentTime = 0;
                document.getElementById("space_atack").play();

                // スコアを増やす
                score(ika * ika * 10);

            } else {
                return; // mpが足りないと何も起こらない
            }

        } else if (e.keyCode === 90) { // zキー
            //console.log("zが押された");
            // 必殺技（ストライク)

            if (MP >= 2) { // mpが足りていれば実行
                mpmainasu(2); // mpを2減らす

                // 直線上を一瞬白くする
                var col = T_cells.x; // タコのいる列
                for (var row = 0; row < 3; row++) {
                    ika += white(col, row); // 一瞬白くする イカを倒す
                }

                // 効果音再生
                document.getElementById("z_atack").currentTime = 0;
                document.getElementById("z_atack").play();

                // スコアを増やす
                score(ika * ika * 10);

            } else {
                return; // mpが足りないと何も起こらない
            }

        } else if (e.keyCode === 39) { // 右矢印キー
            //console.log("右が押された");
            if (T_cells.x !== 2) {// 右にタコが移動できるか調べる 
                // 現在地のタコを非表示に
                T_cells.cells[T_cells.x].classList.remove("T_visible_img");
                T_cells.cells[T_cells.x].classList.add("T_hidden_img");

                // 右隣のタコを表示
                T_cells.cells[T_cells.x + 1].classList.remove("T_hidden_img");
                T_cells.cells[T_cells.x + 1].classList.add("T_visible_img");

                T_cells.x += 1; // 右隣に座標移動
            }
            // 正面にイカがいたら倒す
            if (I_cells.cells[2][T_cells.x].classList.contains("I_visible_img")) {
                ika += white(T_cells.x, 2); // イカを倒す

                // 効果音再生
                document.getElementById("T_atack").currentTime = 0;
                document.getElementById("T_atack").play();

                // スコアを増やす
                score(10);

            }
        } else if (e.keyCode === 37) { // 左矢印キー
            //console.log("左が押された");
            if (T_cells.x !== 0) {// 左にタコが移動できるか調べる 
                // 現在地のタコを非表示に
                T_cells.cells[T_cells.x].classList.remove("T_visible_img");
                T_cells.cells[T_cells.x].classList.add("T_hidden_img");

                // 右隣のタコを表示
                T_cells.cells[T_cells.x - 1].classList.remove("T_hidden_img");
                T_cells.cells[T_cells.x - 1].classList.add("T_visible_img");

                T_cells.x -= 1; // 右隣に座標移動
            }
            // 正面にタコがいたら倒す
            if (I_cells.cells[2][T_cells.x].classList.contains("I_visible_img")) {
                ika += white(T_cells.x, 2); // イカを倒す

                // 効果音再生
                document.getElementById("T_atack").currentTime = 0;
                document.getElementById("T_atack").play();

                // スコアを増やす
                score(10);

            }
        } else if (e.keyCode === 38 || e.keyCode === 40) { // 上下矢印キー
            //console.log("上か下が押された");
            // 移動しない
            // 正面にタコがいたら倒す
            if (I_cells.cells[2][T_cells.x].classList.contains("I_visible_img")) {
                ika += white(T_cells.x, 2); // イカを倒す

                // 効果音再生
                document.getElementById("T_atack").currentTime = 0;
                document.getElementById("T_atack").play();

                // スコアを増やす
                score(10);

            }
        } else { // それ以外のキー
            return; // 何も起こらない
        }

        // イカを動かす //
        go_ika();
        // 一行目にイカを新しく出現させる //
        add_ika();

    }
};


/* ゲームの盤面を取得する */
function loadgameboad() {
    var i = 0;
    var td_array = gameboad.getElementsByTagName("td"); // gameboadの全てのセルを取得

    /* イカのセルは二次配列で取得 */
    for (var row = 0; row < 3; row++) {
        I_cells.cells[row] = []; // 二次配列に
        for (var col = 0; col < 3; col++) {
            I_cells.cells[row][col] = td_array[i];
            i++;
        }
    }
    /* タコのセルは一次配列で取得 */
    for (var col = 0; col < 3; col++) {
        T_cells.cells[col] = td_array[i];
        i++;
    }

    /* MPのセルを一次配列で取得 */
    mp_array = MPcell.getElementsByTagName("td"); // 一次配列
    for (var n = 0; n < 4; n++) {
        mp_array[n].className = "blue";
    }
}

/* 画像を貼る */
function setgameboad() {


    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var I_img = document.createElement('img'); // イカの画像のimgタグを生成
            I_img.src = 'image/ika.png'; // 画像パス
            I_cells.cells[row][col].appendChild(I_img);
            I_cells.cells[row][col].className = "I_hidden_img"; // 画像を非表示に
        }
    }

    add_ika(); // 一行目にイカを配置

    // テスト
    // I_cells.cells[0][0].className = "I_visible_img"; // 一匹試しに表示

    for (var row = 0; row < 3; row++) {
        var T_img = document.createElement('img'); // タコの画像のimgタグを生成
        T_img.src = 'image/tako.png'; // 画像パス
        T_cells.cells[row].appendChild(T_img);
        T_cells.cells[row].className = "T_hidden_img"; // 画像を非表示に
    }

    T_cells.cells[1].className = "T_visible_img"; // 初期位置として真ん中のセルを表示
    T_cells.x = 1; // タコの現在の座標
}

/* 一瞬セルを白くする */
function white(x, y) {
    var ika = 0; // イカを実際に倒したか否か
    I_cells.cells[y][x].className = "I_hidden_img white";
    var l = I_cells.x.length;
    var i = 0;
    for (var n = 0; n < l; n++) {
        if (I_cells.x[i] == x) {
            if (I_cells.y[i] == y) {
                // イカの座標を消す
                I_cells.x.splice(i, 1);
                I_cells.y.splice(i, 1);
                i--;
                ika = 1; // イカを倒したということ
            }
        }
        i++;
    }
    setTimeout(function () { I_cells.cells[y][x].classList.remove("white"); }, 100); // 100ms後に白い背景を取り除く

    return ika; // イカを倒したかどうかを返す

}

/* mpゲージを減らす */
function mpmainasu(a) {
    MP -= a;
    for (var i = MP; i < 4; i++) {
        mp_array[i].className = "black"; // mpゲージを減らす
    }
}

/* イカを出現させる */
function add_ika() {
    var random;
    for (var i = 0; i < 3; i++) {
        if (timecount > 30) { // 30秒たつとイカの量が増える
            random = Math.floor(Math.random() * 3); // 33%の確率で各セルに出現
        } else {
            random = Math.floor(Math.random() * 4); // 25%の確率で各セルに出現
        }
        if (random == 0) {
            I_cells.cells[0][i].classList.remove("I_hidden_img");
            I_cells.cells[0][i].classList.add("I_visible_img"); // イカを出現
            I_cells.x.push(i); // イカのx座標を保存
            I_cells.y.push(0); // イカのy座標を保存
        }
    }
}


/* イカを1マス進める */
function go_ika() {
    var l = I_cells.y.length;
    var i = 0;
    var flag = 0;
    for (var n = 0; n < l; n++) { // 手前にいるイカから動かす
        I_cells.cells[I_cells.y[i]][I_cells.x[i]].classList.remove("I_visible_img");
        I_cells.cells[I_cells.y[i]][I_cells.x[i]].classList.add("I_hidden_img"); // 今のセルのイカを消す
        if (I_cells.y[i] != 2) { // イカが3行目じゃないならば
            I_cells.y[i] += 1; // イカを手前に一マス進める
            if (I_cells.cells[I_cells.y[i]][I_cells.x[i]].classList.contains("I_hidden_img")) {
                I_cells.cells[I_cells.y[i]][I_cells.x[i]].classList.remove("I_hidden_img");
                I_cells.cells[I_cells.y[i]][I_cells.x[i]].classList.add("I_visible_img"); // 新しくイカをだす
            }
            i++;
        } else { // イカが3行目にいるならば
            I_cells.x.splice(i, 1); // いらなくなったx座標を消す 
            I_cells.y.splice(i, 1); // いらなくなったy座標を消す

            //イカがタコにダメージ
            if (flag == 0) {
                damage_tako(); // タコのセルが赤くなる
            }

            // 効果音再生
            document.getElementById("T_damaged").currentTime = 0;
            document.getElementById("T_damaged").play();

            // スコアが減る
            score(-20);

            flag = 1; // 赤くなる処理が済んでいる証拠

        }
    }
}

/* タコがダメージを受けセルが赤くなる */
function damage_tako() {
    for (var j = 0; j < 3; j++) {
        T_cells.cells[j].classList.add("red"); // セルが赤くなる

    }

    setTimeout(function () { T_cells.cells[0].classList.remove("red"); }, 100); //100ms後に元に戻る
    setTimeout(function () { T_cells.cells[1].classList.remove("red"); }, 100); //100ms後に元に戻る
    setTimeout(function () { T_cells.cells[2].classList.remove("red"); }, 100); //100ms後に元に戻る
    /***なぜかfor文でiを回してsetTimeoutは使えない***/
}

/* スコア表示を変更 */
function score(p) {
    var point = Number(document.getElementById("score-value").textContent);
    document.getElementById("score-value").textContent = point + p; // スコアを更新
}

/* スコアに応じた結末 */
function lastmessage(p){
    var text;
    if(p<=0){
        text = "え...もしかして君イカ派？";
    } else if(p<=300){
        text = "タコの民は皆たこ焼きとなった。。。"
    } else if(p<=800){
        text = "勇者ならもうちょい頑張れよ。"
    } else if(p<1100){
        text = "世界は救われた。めでたし。"
    } else if(p<1500){
        text = "今日はイカ焼きパーティだ！！"
    } else {
        text = "そして世界はタコによって支配された。"
    }
    return text;
}