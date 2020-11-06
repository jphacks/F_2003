# Virtual Kintore

[![バーチャル筋トレ カード画像](https://virtual-kintore.web.app/assets/img/virtual-kinotre.png)](https://www.youtube.com/watch?v=G5rULR53uMk)

## 製品概要
### 背景(製品開発のきっかけ、課題等）
コロナ禍での継続した筋トレを~~~

### 製品説明（具体的な製品の説明）

### 特長

#### 1. (姿勢のふらつきや首の角度を計測し、)
#### 2. スクワットの回数計測や応援を受けながら楽しく筋トレできます
#### 3. 誰でもいつでもできるように必要なデバイスはスマホやWEBカメラのついたPC1台のみです!
#### 4. 記録はいつでも振り返ることができます


### 解決出来ること
### 今後の展望
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
