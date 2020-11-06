# Virtual Kintore

[![バーチャル筋トレ カード画像](https://virtual-kintore.web.app/assets/img/virtual-kinotre.png)](https://www.youtube.com/watch?v=G5rULR53uMk)

## 製品概要
### 背景(製品開発のきっかけ、課題等）
～あるアイデアだしにて～  
* 外出自粛で筋トレしたいけど正しい方法がわからない！  
-> RFT（ビジュアル・音声支援）やYoutubeによる筋トレ講座（トレーナが実演するような感覚）が存在  
* 手軽に家の中で運動したい！  
-> ハードを持っていない（スマホのみ）、自分の動きを見られない（一方的な情報）  
* 高専オタクは基本的に運動しない！（運動しなきゃという気持ちはある）  
-> 自分のやる気がなかなか沸かない  

### 実現方法（ゴール）
* 手軽に用意できるスマホのカメラで自分の運動動作を認識し画面に表示  
-> 自分の動きを見ることができ、フィードバックが得られる
* 自分の動作とともに過去の動作、他人の動作を表示（ゴースト機能）  
-> 過去の自分や他人と競える、トレーナの動作との違いを知り正しい筋トレに近づく
* 画面表示時に3Dモデルに受肉し変身  
-> 自分を変えることでモチベーション向上（無様な姿は見せられない、頑張っている姿が見たい）
* 音声支援（回数読み上げ、声援）  
-> 周りを変えることでモチベーション向上（友達、キャラクター、etc.）


### 製品説明（具体的な製品の説明）
コロナ禍により出不精になった筋トレに興味がある人を支援するサービスです。
必要なものはスマホ１台のみ、自分の筋トレ動作と連動して動く3Dモデルを見ながら運動できます。
ゴースト機能を使うことで初心者・上級者問わずレベルにあった筋トレができます。


注目ポイント！（括弧内は実装が間に合わなかったもの）
* 変身、音声支援：トレーニング中のモチベーション向上、数読み上げによりトレーニングに集中
* （*ゴースト機能*：  
上級者ゴーストによる筋トレ講座、友達ゴーストによる連帯・共有、自分ゴーストによる成長認識）  


### 特長

#### 0. スマホを用意
#### 1. （使用者が好きな）3Dモデルの受肉→筋トレスタート！
#### 2. （別モデルの同時表示）
#### 3. （姿勢のふらつきや首の角度を計測：疲れ具合を検知し助言、応援）
#### 4. 動作回数の読み上げ、計測
#### 5. 保存した回数記録の表示
#### 6. （動作記録、回数記録の共有）


### 解決出来ること
* 外出自粛で筋トレしたいけど正しい方法がわからない！  
-> 3人称視点によるトレーニングで悪い箇所を修正できる  
* 手軽に家の中で運動したい！  
-> スマホ１台で実施可能、1人でリアルタイムで筋トレ動作を修正可能    
* 高専オタクは基本的に運動しない！（運動しなきゃという気持ちはある）  
-> 変身、音声支援によりモチベーションを支援  

### 今後の展望
* ゴースト機能の実装  
（保存した動作をリアルタイムで出力）
* 筋トレの種類を増やす
* より精度の高い姿勢推定、フォームの改善につながる助言
### 注力したこと（こだわり等）
* vrmモデルのリアルタイムの動作(ゆくゆくは過去のログも同時に動かしたい)
* こちらのページから[公開](http://virtual-kintore)しています

## 開発技術
### 活用した技術
#### API・データ
- [Miraikomachi vrmモデル](https://github.com/Miraikomachi/MiraikomachiVRM)
- [効果音ラボ](https://soundeffect-lab.info/sound/voice/)

#### フレームワーク・ライブラリ・モジュール
- [BULUMA](https://bulma.io/)
- [posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet)
- [three-vrm](https://github.com/pixiv/three-vrm)

#### デバイス
*　
*

### 独自技術
#### ハッカソンで開発した独自機能・技術
- PoseNetでは肩や膝、鼻の位置などをカメラの画像に基づいた2次元の点で取得できますが、3次元での推定はされていません。今回、スクワットに限り(足が移動しない、カメラがほぼ真正面にある)擬似的に3次元の推定に挑戦し、(ゴーストの表示に役立てようとしました。)
- カメラ画像からのチューニングによってスクワットをした際の自動回数計測を行えるようにしました。



#### 製品に取り入れた研究内容（データ・ソフトウェアなど）（※アカデミック部門の場合のみ提出必須）
*
*
