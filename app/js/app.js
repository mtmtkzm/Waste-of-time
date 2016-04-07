/* mlkccaの準備
------------------------------ */
var milkcocoa = new MilkCocoa('uniimfysaf2.mlkcca.com');
// データストア（scores）を準備
var ds = milkcocoa.dataStore('scores');

var ww = $(window).width();
var wh = $(window).height();

/* canvasを全画面表示する
------------------------------ */
$('#stage').get(0).width = ww;
$('#stage').get(0).height = wh;

/* グローバル変数
------------------------------ */
var stage; // canvas
var w, h; // canvasの幅と高
// 色定義
var white = '#eee';
var black = '#555';
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
		{ src: 'enemy/enemy.png', id: 'enemy' },
		{ src: 'hand.png', id: 'hand' }
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

/* グローバル関数（？）
------------------------------ */
// ボタンモジュール
function createBtn (text) {
	// ボタンになるコンテナ
	var btn = new createjs.Container();
	btn.x = (w-300) / 2; // 中央配置
	btn.y = h/2 + 160;
	// ボタン本体
	var btnBase = new createjs.Shape();
	btnBase.graphics.beginFill(black);
	btnBase.graphics.drawRoundRect(0, 0, 300, 48, 5);
	btnBase.shadow = new createjs.Shadow(shadow, 0, 6, 0);
	// ボタンテキスト
	var btnText = new createjs.Text(text, '32px VT323', white);
	btnText.x = btnBase.x + 150;
	btnText.y = btnBase.y + 8;
	btnText.lineHeight = 18;
	btnText.textAlign = 'center';
	btn.addChild(btnBase, btnText);
	btn.addEventListener('click', function() {
		btn.children[0].shadow.offsetY = 0;
		btn.y = btn.y + 6;
	});
	return btn;
}
// タイトルモジュール
function createTtl (text) {
	// タイトルになるコンテナ
	var ttl = new createjs.Container();
	ttl.x = w/2;
	ttl.y = h/2 - 240;
	// タイトルラベルを生成
	var ttlLabel = new createjs.Text(text, "48px 'VT323'", black);
	ttlLabel.textAlign = 'center';
	ttl.addChild(ttlLabel);
	return ttl;
}

/* スタート画面
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
	descriptionLabel.y = h/2;
	descriptionLabel.regY = 130;
	descriptionLabel.lineHeight = 18;
	descriptionLabel.textAlign = 'center';
	container.addChild(descriptionLabel);


	// サンプル動作するチュートリアル表示
	// チュートリアルの表示領域を取得
	function tutorial() {
		var tutorialEnemy;
		var hand = new createjs.Bitmap(loader.getResult('hand'));
		hand.regX = 5;
		hand.regY = -5;
		hand.x = w + hand.regX;
		hand.y = h/2;

		// チュートリアル開始
		createTutorialEnemy();
		function createTutorialEnemy () {
			var topLimit = (descriptionLabel.y) - 10; // ラベル下
			var bottomLimit = playBtn.y - 70; // ボタン上
			var rx = Math.random() * (ww-100) + 10; // 0 から (ww-50) まで
			var ry = Math.random() * (topLimit - bottomLimit) + bottomLimit; // 説明ラベル下+30 から ボタン上-30 まで
			// enemy生成
			tutorialEnemy = new createjs.Shape();
			tutorialEnemy.graphics.beginFill(black);
			tutorialEnemy.graphics.drawPolyStar(rx, ry, 30 , 7, 0, -90);
			// 手生成
			container.addChild(tutorialEnemy, hand);
			moveHand(rx, ry);
		}

		function moveHand (rx, ry) {
			createjs.Tween.get(hand).wait(500).to({ x: rx, y: ry }, 200).call(function () {
				createjs.Tween.get(tutorialEnemy).to({ alpha: 0 }, 200).wait(200).call(function () {
					container.removeChild(tutorialEnemy);
					setTimeout(createTutorialEnemy, 1000);
				});
			});
		}
	}
	// プレイスタートボタン
	var playBtn = createBtn('Play');
	playBtn.addEventListener('click', function () {
		createjs.Tween.get(container).wait(100).to({ alpha:0 }, 200).wait(100).call(function () {
			stage.removeChild(container);
			countDownView();
		});
	});
	container.addChild(playBtn);

	tutorial();
}

/* スタートまでのカウントダウン画面
------------------------------ */
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

/* プレイ画面
------------------------------ */
function playGameView() {
	var interval = 1000;
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
		var rx = Math.random() * (ww-100); // 0 ~ ww-100
		var ry = Math.random() * (wh-200) + 100; // 100 ~ wh-100
		enemy = new createjs.Shape();
		enemy.graphics.beginFill(black);
		enemy.graphics.drawPolyStar(rx, ry, 70*Math.random() + 30 , 7, 0, -90);
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
		scoreView(score);
	}
}

/* スコア表示画面
------------------------------ */
function scoreView(userscore) {
	var container = new createjs.Container();
	stage.addChild(container);

	// スコアラベル
	var scoreAreaLabel = createTtl('Your Score:');
	scoreAreaLabel.y = h/2 - 70;
	container.addChild(scoreAreaLabel);
	// スコア表示
	var scoreArea = new createjs.Text(userscore, "100px 'VT323'", black);
	scoreArea.y = scoreAreaLabel.y + 50;
	scoreArea.x = w/2;
	scoreArea.textAlign = 'center';
	container.addChild(scoreArea);
	setTimeout(function() {
		createjs.Tween.get(container).wait(100).to({ alpha:0 }, 200).wait(100).call(function () {
			stage.removeChild(container);
			resultView(userscore);
		});
	}, 2000);
}

/* 名前入力画面
------------------------------ */
function resultView(userscore) {
	var container = new createjs.Container();
	stage.addChild(container);

	// 名前
	var username;

	// 名前ラベル
	var nameAreaLabel = createTtl('Your Name ?');
	container.addChild(nameAreaLabel);

	// 仮想フォーム
	var nameArea = new createjs.Shape();
	nameArea.graphics.beginFill(white);
	nameArea.graphics.beginStroke(black);
	nameArea.graphics.setStrokeStyle(2);
	nameArea.graphics.drawRoundRect(0, 0, 300, 48, 5);
	nameArea.x = (w-300) / 2;
	nameArea.y = h/2 - 90;

	// 仮想フォームクリックで、DOMのformにフォーカスする
	nameArea.addEventListener('click', function () {
		nameArea.graphics._stroke.style = accent; // 仮想フォームの枠をオレンジに
		document.getElementById('name').focus();
	});

	// リアルタイム名前描画する場所
	var tempNameArea = new createjs.Text('', '24px sans-serif', black);
	tempNameArea.x = nameArea.x + 10;
	tempNameArea.y = nameArea.y + 12;
	container.addChild(nameArea, tempNameArea);

	// 登録ボタン
	var registerBtn = createBtn('Send');
	registerBtn.y = h/2 - 30;

	// 登録クリックイベントで、名前を決定する
	registerBtn.addEventListener('click', function () {
		nameArea.graphics._stroke.style = black; // 仮想フォームの枠を黒に戻す
		document.getElementById('name').blur(); // フォーカスをはずす
		createjs.Ticker.removeEventListener('tick', changeForm);
		username = document.forms.registerRank.name.value;
		// 空欄の場合はNoNameに
		if (username == '') {
			username = 'No Name';
		}
		// username確定後は、フォーム内をリセット
		document.forms.registerRank.name.value = '';
		register();
	});
	container.addChild(registerBtn);

	// changeFormをtickでまわす
	createjs.Ticker.addEventListener('tick', changeForm);

	// DOMのフォームからCanvas内の仮想フォームに入力させる（tickで監視）
	function changeForm () {
		var tempName = document.forms.registerRank.name.value;
		tempNameArea.text = String(tempName);
	}

	// Milkcocoaに送信
	function register () {
		ds.push({name: username, score: userscore}, function() {
			createjs.Tween.get(container).wait(100).to({ alpha:0 }, 200).wait(100).call(function () {
				stage.removeChild(container);
				rankingView(userscore);
			});
		});
	}
}

/* ランキング表示画面
------------------------------ */
function rankingView (userscore) {
	var container = new createjs.Container();
	stage.addChild(container);

	var ranking = [];
	var winner;

	ds.stream().next(function(err, all) {
		// ランキングを取得する
		getRanking(all);
		// ランクインしたかを判定 winner:T/F
		if (userscore > ranking[4].value.score || ranking[4].value.score == undefined) {
			winner = true;
		} else {
			winner = false;
		}
	}).next(function(){
		// ランキング取得後表示
		showRanking();
		// 3秒後に勝敗の結果をアニメーション
		setTimeout(showDecision, 2000);
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

	// ランキング表示
	function showRanking () {
		var ttlLabel = createTtl('Score Ranking:');
		container.addChild(ttlLabel);

		// ランキングの区切り線を描画
		for (var i=0; i<4; i++) {
			var line = new createjs.Shape();
			line.graphics.beginFill(black);
			line.graphics.drawRoundRect(0, 0, 300, 2, 2);
			line.regX = 150;
			line.x = w/2;
			line.y = h/2 + (i-2)*50;
			// container.addChild(line);
		}
		// ランキング、スコア、名前を描画
		for (var i=0; i<5; i++) {
			// 順位
			var rankOrder = new createjs.Text(String(i+1), "36px 'VT323'", black);
			rankOrder.x = w/2 - 140;
			rankOrder.y = h/2 + 11 + (i-3)*50;
			// 名前
			var rankName = new createjs.Text('', "20px 'Noto Sans Japanese'", black);
			rankName.text = ranking[i].value.name;
			rankName.x = w/2 - 110;
			rankName.y = h/2 + 17 + (i-3)*50;
			// スコア
			var rankScore = new createjs.Text('', "28px 'VT323'", black);
			rankScore.text = ranking[i].value.score + 'p';
			rankScore.x = w/2 + 140;
			rankScore.y = h/2 + 18 + (i-3)*50;
			rankScore.textAlign = 'right';
			container.addChild(rankOrder, rankName, rankScore);
		}
	}

	// 勝敗を祝う
	function showDecision() {
		if (winner) { // ランクインのとき
			console.log('you win');
		} else { // ランク外のとき
			var num = 0;
			for (var i=0; i<container.children.length; i++) {
				num++;
				createjs.Tween.get(container.children[i]).wait(i*100+100).to({ y:h }, 700);
			}
			setTimeout(comfirmRetry, 2000);
		}
		function comfirmRetry() {
			var confirmBox = new createjs.Container();
			container.addChild(confirmBox);

			var retryTtl =  createTtl('Do you retry?\n\nor finish?');
			var retryBtn = createBtn('Retry');
			retryBtn.y = h/2-33;
			retryBtn.addEventListener('click', function() {
				createjs.Tween.get(container).wait(100).to({ alpha:0 }, 200).wait(100).call(function () {
					stage.removeChild(container);
					countDownView();
				});
			});
			var FinishBtn = createBtn('Finish');
			FinishBtn.y = h/2+37;
			FinishBtn.addEventListener('click', function() {
				createjs.Tween.get(container).wait(100).to({ alpha:0 }, 200).wait(100).call(function () {
					stage.removeChild(container);
					startGameView();
				});
			});

			confirmBox.addChild(retryTtl, FinishBtn, retryBtn);
			confirmBox.alpha = 0;

			createjs.Tween.get(confirmBox).wait(100).to({ alpha:1 }, 200);
		}
	}

}
