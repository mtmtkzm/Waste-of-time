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
// 色定義
var black = '#555';
var white = '#eee';
var shadow = '#444';
var accent = '#EF6B09';

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
	loader.addEventListener('complete', startGameView);
	loader.loadManifest(manifest, true, '../assets/');
}

/* tickの処理（ステージを常に更新する）
------------------------------ */
createjs.Ticker.addEventListener('tick', tick);

function tick(event) {
	stage.update();
}

// ボタンモジュール
function createBtn (text) {
	// ボタンになるコンテナ
	var btn = new createjs.Container();
	btn.x = (w-300)/2; // 中央配置
	btn.y = h - 80;
	// ボタン本体
	var btnBase = new createjs.Shape();
	btnBase.graphics.beginFill(black);
	btnBase.graphics.drawRoundRect(0, 0, 300, 48, 5);
	btnBase.shadow = new createjs.Shadow(shadow, 0, 6, 0);
	// ボタンテキスト
	var btnText = new createjs.Text(text, '32px VT323', white);
	btnText.x = btnBase.x + 150;
	btnText.y = btnBase.y + 6;
	btnText.lineHeight = 18;
	btnText.textAlign = 'center';
	btn.addChild(btnBase, btnText);
	return btn;
}

function createTtl (text) {
	// タイトルになるコンテナ
	var ttl = new createjs.Container();
	ttl.x = w/2;
	ttl.y = 40;
	// タイトルラベルを生成
	var ttlLabel = new createjs.Text(text, "48px 'VT323'", black);	
	ttlLabel.textAlign = 'center';
	ttl.addChild(ttlLabel);
	return ttl;
}

/* ゲーム画面
------------------------------ */
function startGameView() {
	var container = new createjs.Container();
	stage.addChild(container);

	// タイトルラベル
	var ttlLabel = createTtl('Goofing Around');
	container.addChild(ttlLabel);
	// 説明のラベル
	var descriptionLabel = new createjs.Text('', "12px 'VT323'", black);
	descriptionLabel.text = '等間隔で無数に出現する敵を\nタップするだけの単純なゲーム。\n\nランダムな場所に現れるオブジェクトを、\n次のオブジェクトが出現するまでにタップしよう。';
	descriptionLabel.x = w/2;
	descriptionLabel.y = 160;
	descriptionLabel.lineHeight = 18;
	descriptionLabel.textAlign = 'center';
	container.addChild(descriptionLabel);
	// プレイスタートボタン
	var playBtn = createBtn('Play');
	playBtn.addEventListener('click', function () {
		createjs.Tween.get(container).to({ alpha:0 }, 250).wait(100).call(function () {
			stage.removeChild(container);
			// countDownView();
			playGameView();
		});
	});
	container.addChild(playBtn);
}

function countDownView () {
	var container = new createjs.Container();
	stage.addChild(container);

	var count = 3;
	var countArea = new createjs.Text(count, "100px 'VT323'", black);
	countArea.x = w/2;
	countArea.y = h/2 - 50;
	countArea.textAlign = 'center';
	container.addChild(countArea);
	function countDown () {
		count--;
		countArea.text = String(count);
		if (count == 0) {
			stage.removeChild(container);
			playGameView();
			return;
		}
	}
	setInterval(countDown, 1000);
}

function playGameView() {
	var interval = 1500;
	var score = 0;
	var enemylife = false;
	var gameover = false;
	var enemy;

	var container = new createjs.Container();
	stage.addChild(container);

	// 敵生成（ゲームスタート）
	createEnemy();
	createjs.Ticker.addEventListener('tick', judgeGame);

	// 上部に現在のスコア表示
	nowScore = String(score);
	var scoreArea = new createjs.Text(nowScore, "48px 'VT323'", black);
	scoreArea.x = w / 2;
	scoreArea.y = 40;
	scoreArea.textAlign = 'center';
	container.addChild(scoreArea);

	// 定期的に敵を生成する
	function createEnemy() {
		if (enemylife) { // 前回生成した敵の命がまだあったらgameover.
			gameover = true;
			return;
		}
		var rx = Math.random() * ww - 50;
		var ry = Math.random() * wh - 50;

		enemy = new createjs.Shape();
		enemy.graphics.beginFill(black);
		enemy.graphics.drawPolyStar(rx, ry, 40, 7, 0, -90);
		container.addChild(enemy);

		enemylife = true;
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
		endGameView(score);
	}
}

function endGameView(userscore) {
	var container = new createjs.Container();
	stage.addChild(container);
	// 最終スコア
	var username = userscore;

	// スコアラベル
	var scoreAreaLabel = createTtl('Your Score:');
	container.addChild(scoreAreaLabel);
	// スコア表示
	var scoreArea = new createjs.Text(userscore, "100px 'VT323'", black);
	scoreArea.y = scoreAreaLabel.y + 50;
	scoreArea.x = w/2;
	scoreArea.textAlign = 'center';
	container.addChild(scoreArea);

	// 名前ラベル
	var nameAreaLabel = createTtl('Your Name ?');
	nameAreaLabel.y = h - 250;
	container.addChild(nameAreaLabel);

	// 仮想入力フォーム
	var nameArea = new createjs.Shape();
	nameArea.graphics.beginFill(white);
	nameArea.graphics.beginStroke(black);
	nameArea.graphics.setStrokeStyle(2);
	nameArea.graphics.drawRoundRect(0, 0, 300, 48, 5);
	nameArea.x = (w-300)/2;
	nameArea.y = h - 150;

	// 仮想フォームクリックで、DOMのformにフォーカスする
	nameArea.addEventListener('click', function () {
		nameArea.graphics.beginStroke(accent);
		document.getElementById('name').focus();
	});
	container.addChild(nameArea);

	// 登録ボタン
	var registerBtn = createBtn('Send');
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
	var tempNameArea = new createjs.Text('', '24px sans-serif', black);
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
		ds.push({name: username, score: userscore}, rankingView(userscore));
	}
}

function rankingView (userscore) {
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
			console.log(i+1 + '位：' + ranking[i].value.name + '　' + ranking[i].value.score);
		}
		if (ranking[4].value.score < userscore) {
			alert(userscore+'Pです。You WIN!');
		} else {
			alert(userscore+'Pです。You LOSE..');
		}
	}
}