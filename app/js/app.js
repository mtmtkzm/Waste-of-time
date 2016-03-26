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
	// stageをよみこむ
	stage = new createjs.Stage('stage');

	w = stage.canvas.width;
	h = stage.canvas.height;

	manifest = [
		{src: 'enemy/enemy.png', id: 'enemy'}
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener('complete', handleComplete);
	loader.loadManifest(manifest, true, '../assets/');
}

function handleComplete () {
	startGame();
}

/* ゲーム画面
------------------------------ */
function startGame () {
	playGame();
}

function playGame () {
	var score = 0; // スコア初期値
	var enemy; // 敵の画像情報

	createEnemy();
	countScore();

	//　クリックイベントを追加する
	stage.addEventListener('click', removeEnemy);


	// 等間隔で敵を生成する
	function createEnemy () {
		enemy = new createjs.Bitmap(loader.getResult('enemy'));
		enemy.x = Math.random() * ww;
		enemy.y = Math.random() * wh;
		stage.addChild(enemy);
		setTimeout(createEnemy, 1500); // 等間隔で繰り返し
	}

	// 敵をタップで削除する
	function removeEnemy () {
		stage.removeChild(enemy);
		score ++; // スコアを加算
		countScore();
	}

	// スコアをカウントする
	function countScore() {
		scoreArea = new createjs.Text(score, 'bold 42px Arial', '#ddd');
		scoreArea.x = w / 2;
		scoreArea.y = 10;
		scoreArea.textAlign = 'center';
		scoreArea.text = score;
		stage.addChild(scoreArea);
	}

	function judgeGameover () {
		console.log('judge!');
		endGame(score);
	}
}

function endGame (score) {
	console.log('your score:', score);

}

/* tickの処理（ステージを常に更新する）
------------------------------ */
createjs.Ticker.addEventListener('tick', tick);
function tick (event) {
	stage.update();
}