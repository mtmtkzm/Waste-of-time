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

function endGame(userscore) {
	var container = new createjs.Container();
	stage.addChild(container);
	var username;

	// 仮想の名前入力フォーム
	var nameArea = new createjs.Shape();
	nameArea.graphics.beginFill('#999');
	nameArea.graphics.drawRect(0, 0, 120, 50);
	nameArea.y = h/2;
	// 仮想フォームクリックで、DOMのformにフォーカスする
	nameArea.addEventListener('click', function () {
		document.getElementById('name').focus();
	});
	container.addChild(nameArea);

	// 登録ボタン
	var registerBtn = new createjs.Shape();
	registerBtn.graphics.beginFill('#333');
	registerBtn.graphics.drawRect(0, 0, 120, 50);
	registerBtn.x = 150;
	registerBtn.y = h/2;
	// 登録クリックイベントで名前を決定（空欄の場合はNo Name表示に）
	registerBtn.addEventListener('click', function () {
		createjs.Ticker.removeEventListener('tick', changeForm);
		if (username == '') {
			username = 'No Name';
		} else {
			username = document.forms.registerRank.name.value;
		}
		register();
	});
	container.addChild(registerBtn);

	// リアルタイム名前描画する場所
	var tempNameArea = new createjs.Text('', '24px sans-serif', '#ddd');
	tempNameArea.y = h/2;
	container.addChild(tempNameArea);

	// changeFormをtickでまわす
	createjs.Ticker.addEventListener('tick', changeForm);

	// DOMのフォームからCanvas内の仮想フォームに入力させる（tickで監視）
	function changeForm () {
		var tempName = document.forms.registerRank.name.value;
		tempNameArea.text = String(tempName);
	}

	// Milkcocoaに送信
	function register () {
		ds.push({name: username, score: userscore}, showRanking(userscore));
	}
}

function showRanking (userscore) {
	var container = new createjs.Container();
	stage.addChild(container);

	var ranking = [];
	ds.stream().next(function(err, all) {
		// ランキングを取得する
		getRanking(all);
	}).next(function(){
		// ランキング取得後表示
		judgeRankIn();
	});

	// データを取得してきて、並び替え。上位5件だけを表示。
	function getRanking (all) {
		all.sort(function(a,b) {
			if(a.value.score < b.value.score) { return 1; }
			if(a.value.score > b.value.score) { return -1; }
			return 0;
		});
		all.length = 5;
		ranking = all;
	}

	// ランクインしているか判定・ランキング表示
	function judgeRankIn () {
		for (var i=0; i<5; i++) {
			console.log(ranking[i].value.name + '：' + ranking[i].value.score);
		}
		if (ranking[4].value.score < userscore) {
			console.info(userscore+'P: you WIN!');
		} else {
			console.info(userscore+'P: you LOSE..');
		}
	}
}