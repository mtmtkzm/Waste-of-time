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

function initialize() {
	stage = new createjs.Stage('stage');
	w = stage.canvas.width;
	h = stage.canvas.height;
	manifest = [
		{ src: 'enemy/enemy.png', id: 'enemy' }
	];
	loader = new createjs.LoadQueue(false);
	loader.addEventListener('complete', handleComplete);
	loader.loadManifest(manifest, true, '../assets/');
}

function handleComplete() {
	startGame();
}

/* tickの処理（ステージを常に更新する）
------------------------------ */
createjs.Ticker.addEventListener('tick', tick);

function tick(event) {
	stage.update();
}

/* ゲーム画面
------------------------------ */
function startGame() {
	playGame();
}

function playGame() {
	var interval = 1500;
	var score = 0;
	var enemy;
	var enemylife = false;
	var gameover = false;

	var container = new createjs.Container();
	stage.addChild(container);

	// 敵生成（ゲームスタート）
	createEnemy();
	// ゲームオーバーにならない限り常に監視しておく
	createjs.Ticker.addEventListener('tick', judgeGame);

	// 上部に現在のスコア表示
	nowScore = String(score);
	var scoreArea = new createjs.Text(nowScore, '24px sans-serif', '#ddd');
	scoreArea.x = w / 2;
	scoreArea.y = 30;
	scoreArea.textAlign = 'center';
	container.addChild(scoreArea);

	// 定期的に敵を生成する
	function createEnemy() {
		if (enemylife) { // 前回生成した敵の命がまだあったらgameover.
			gameover = true;
			return;
		}
		enemy = new createjs.Bitmap(loader.getResult('enemy'));
		enemy.x = Math.random() * ww - 50;
		enemy.y = Math.random() * wh - 50;
		container.addChild(enemy);
		enemylife = true;
		birthday = new Date(); // 余命を設定する（誕生した時刻）
		enemy.addEventListener('click', removeEnemy);
		setTimeout(createEnemy, interval);
	}

	// 敵をタップで削除する
	function removeEnemy() {
		container.removeChild(enemy);
		enemylife = false;
		score++;
		scoreArea.text = String(score);
	}

	// ゲームオーバー判定
	function judgeGame(event) {
		if (!gameover) {
			return;
		}
		createjs.Ticker.removeEventListener('tick', judgeGame);
		stage.removeChild(container);
		endGame(score);
	}
}

function endGame(score) {
	var container = new createjs.Container();
	stage.addChild(container);
	var name;

	var registerButton = document.getElementById('registerButton');
	registerButton.addEventListener('click', function () {
		// フォームバリューをリアルタイムに表示させるのを停止する
		createjs.Ticker.removeEventListener('tick', changeForm);

		// 名前を決定（空欄の場合はNo Name表示に）
		if (name == '') {
			name = 'No Name';
		} else {
			name = document.forms.registerRank.name.value;
		}
		register();
	});

	createjs.Ticker.addEventListener('tick', changeForm);

	// DOMのフォームからCanvas内の仮想フォームに入力させる
	function changeForm () {
		var tempName = document.forms.registerRank.name.value;
		var tempNameArea = new createjs.Text(tempName, '24px sans-serif', '#ddd');
		tempNameArea.x = w / 2;
		tempNameArea.y = 30;
		tempNameArea.textAlign = 'center';
		container.removeChild(tempNameArea);
		container.addChild(tempNameArea);
	}

	// Milkcocoaに送信
	function register () {
		ds.push({name: name, score: score}, showRanking);
	}
}

function showRanking () {
	var container = new createjs.Container();
	stage.addChild(container);

	// データを送信・保存のコールバック
	var all = [];
	var ranking = [];
	ds.stream().next(function(err, rank) {
		for (var i=0; i<rank.length; i++) {
			all.push(rank[i].value.score); // 全データを格納
		}
		sortDesc(all); // 降順に並び替え
		ranking = all.slice(0,5); // TOP5をranking[]へ
	});

	// 引数で渡した配列を降順で並び変える
	function sortDesc (array) {
		array.sort(function(a, b) {
			return (parseInt(a) < parseInt(b)) ? 1 : -1;
		});
	}
}