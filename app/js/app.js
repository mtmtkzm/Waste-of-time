/* canvasを全画面表示する
------------------------------ */
var ww = $(window).width();
var wh = $(window).height();
$('#stage').get(0).width = ww;
$('#stage').get(0).height = wh;

/* グローバル変数
------------------------------ */
var stage; // canvas
var w, h; // canvasの幅と高

/* initialize
------------------------------ */
init();
function init () {
	stage = new createjs.Stage('stage');
	w = stage.canvas.width;
	h = stage.canvas.height;
	manifest = [
		{src: 'enemy/enemy.png', id: 'enemy'}
	];
	loader = new createjs.LoadQueue(false);
	loader.addEventListener('complete', handleComplete);
	loader.loadManifest(manifest, true, '../assets/');
	createjs.Ticker.setFPS(30);
}

function handleComplete () {
	startGame();
}

/* tickの処理（ステージを常に更新する）
------------------------------ */
createjs.Ticker.addEventListener('tick', stage);
function stage (event) {
	stage.update();
}

/* ゲーム画面
------------------------------ */
function startGame () {
	playGame();
}

function playGame () {
    var container = new createjs.Container();
    stage.addChild(container);
	var score = 0;
	var interval = 1500;
	var enemy;
	var baseDate;
	var gameover = false;

	// 敵生成
	createEnemy();
	// スコア表示
	countScore();



	// 定期的に敵を生成する
	function createEnemy () {
		if (gameover) { return; } // ゲーム終了してたら弾く
		console.log('-----------------');
		enemy = new createjs.Bitmap(loader.getResult('enemy'));
		enemy.x = Math.random() * ww - 50;
		enemy.y = Math.random() * wh - 50;
		container.addChild(enemy);
		// その都度、敵にクリックイベントを追加する
		enemy.addEventListener('click', removeEnemy);
		if (!gameover) {
			baseDate = new Date(); // 余命を設定する（誕生した時刻）
			gameover = true; // ゲームオーバーにする
		}

		setTimeout(createEnemy, interval); // 等間隔で繰り返し
	}

	// 敵をタップで削除する
	function removeEnemy () {
		console.info('Click!');
		container.removeChild(enemy);
		score++; // スコアを加算
		gameover = false;
		countScore();
	}

	// スコアをカウントする
	function countScore () {
		scoreArea = new createjs.Text('', 'bold 42px Arial', '#ddd');
		scoreArea.x = w / 2;
		scoreArea.y = 10;
		scoreArea.textAlign = 'center';
		scoreArea.text = score;
		container.addChild(scoreArea); // スコアを描画
	}

	// 余命を返す
	function remainingTime () {
		var nowDate = new Date();
		var lefttime = nowDate - baseDate;
		return lefttime;
	}

	// ゲームオーバー判定
	function judgeGameover (event) {
		console.log(interval-remainingTime());
		if (interval - remainingTime() <= 0) {
			gameover = true;
			endGame(score);
			stage.removeChild(container);
			// ゲームオーバー判定のtickリスナーを削除
			createjs.Ticker.removeEventListener('tick', judgeGameover);
		}
	}
	// ゲームオーバーにならない限り常に監視しておく
	createjs.Ticker.addEventListener('tick', judgeGameover);
}

function endGame (score) {
	endScore = new createjs.Text('Your Score\n'+score, 'bold 42px Arial', '#ddd');
	endScore.x = w/2;
	endScore.y = h/2;
	endScore.textAlign = 'center';
	stage.addChild(endScore); // スコアを描画
	stage.update();
}
