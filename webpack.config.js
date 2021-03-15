module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "development", // production
    optimization: {
        //minimize: true,
    },
    entry: "./typescript/script",
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};
