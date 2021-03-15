AHC001 Visualizer
=====

[![Build and Deploy](https://github.com/iilj/ahc001_visualizer/actions/workflows/main.yml/badge.svg)](https://github.com/iilj/ahc001_visualizer/actions/workflows/main.yml)

## これは何？

[AtCoder Heuristic Contest 001 \- AtCoder](https://atcoder.jp/contests/ahc001) のビジュアライザです．

TypeScript 製です．公式のものとは別に自分用に作りました．せっかくなので公開してみます．

## 使ったもの

- [pixijs/pixi\.js: The HTML5 Creation Engine: Create beautiful digital content with the fastest, most flexible 2D WebGL renderer\.](https://github.com/pixijs/pixi.js)
- [chartjs/Chart\.js: Simple HTML5 Charts using the <canvas> tag](https://github.com/chartjs/Chart.js)

## 開発するときの諸々

### セットアップ

```sh
$ npm install
```

### ビルド

```sh
$ npm run copy
$ npm run webpack
```

#### lint/prettier

```sh
$ npm run prettier
$ npm run lint
$ npm run lint:fix
```

### コードを書き換えながら動きをすぐに確認したいとき

```sh
$ npm run watch
```

適当に Local Server を起動（なんでもよいですが，たとえば以下）

```sh
$ cd dist
$ python -m http.server 8080
```
