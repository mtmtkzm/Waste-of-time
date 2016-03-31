/* mlkccaの準備
------------------------------ */
var milkcocoa = new MilkCocoa('uniimfysaf2.mlkcca.com');
// データストア（scores）を準備
var ds = milkcocoa.dataStore('scores');

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
initialize();
function initialize () {
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

/* tickの処理（ステージを常に更新する）
------------------------------ */
createjs.Ticker.addEventListener('tick', tick);
function tick (event) {
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

    // 変数を宣言
	var interval = 1500; // 敵生成の間隔
	var score = 0; // スコア
	var enemy;
	var enemylife = false; // 敵の命有無
	var gameover = false; // ゲームオーバーじゃない

	// 敵生成（ゲームスタート）
	createEnemy();
	// ゲームオーバーにならない限り常に監視しておく
	createjs.Ticker.addEventListener('tick', judgeGame);

	// スコア表示
	nowScore = String(score);
	var scoreArea = new createjs.Text(nowScore, '24px sans-serif', '#ddd');
	scoreArea.x = w/2;
	scoreArea.y = 30;
	scoreArea.textAlign = 'center';
	container.addChild(scoreArea);

	// 定期的に敵を生成する
	function createEnemy () {
		if (enemylife) { // 前回生成した敵の命がまだあったらgameover.
			gameover = true;
			return; // これ以降createEnemyしない
		}
		enemy = new createjs.Bitmap(loader.getResult('enemy'));
		enemy.x = Math.random() * ww - 50;
		enemy.y = Math.random() * wh - 50;
		container.addChild(enemy);
		enemylife = true; // 敵に命あり
		birthday = new Date(); // 余命を設定する（誕生した時刻）
		enemy.addEventListener('click', removeEnemy);
		setTimeout(createEnemy, interval);
	}

	// 敵をタップで削除する
	function removeEnemy () {
		container.removeChild(enemy);
		enemylife = false; // 敵に命なし
		score++;
		scoreArea.text = String(score);
	}

	// ゲームオーバー判定
 	function judgeGame (event) {
 		if (!gameover) { return; }
		// ゲーム終了処理
		createjs.Ticker.removeEventListener('tick', judgeGame);
		stage.removeChild(container);
		endGame(score);
	}
}

function endGame (score) {
	var name = 'rider';
	ds.push({name:name, score:score});
	endScore = new createjs.Text('Your Score\n'+score, 'bold 42px Arial', '#ddd');
	endScore.x = w/2;
	endScore.y = h/2;
	endScore.textAlign = 'center';
	stage.addChild(endScore); // スコアを描画
	ds.stream().size(5).sort('desc').next(function(err, rank){
		for (var i=4; i>=0; i--) {
			console.log(rank[i].value.name+':'+rank[i].value.score);
		}
	});
}
