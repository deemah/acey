const path = require("path");
const webpack = require("webpack");
const CleanPlugin = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const getBuildConfig = require("./build-config");
const pkg = require("./package.json");

module.exports = function ({ buildMode }) {
    console.log(`build mode: ${buildMode}`);

    const buildConfig = getBuildConfig(buildMode);
    const config = getConfig(buildConfig);

    return config;
}

function getConfig(buildConfig) {
    const buildPath = `./build/${buildConfig.buildDir}`;

    return {
        mode: "none",
        target: "node",
        externals: nodeExternals(),
        devtool: buildConfig.bundle.sourceMap,
        node: {
            __dirname: false,
        },
        entry: {
            index: "./src/index.ts",
        },
        output: {
            path: path.resolve(buildPath),
            filename: "[name].js",
        },
        resolve: {
            extensions: [".js", ".ts", ".tsx"],
            alias: {},
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    ["@babel/env", {
                                        loose: true,
                                        modules: false,
                                        targets: {
                                            node: buildConfig.compile.node,
                                        },
                                    }],
                                ],
                                plugins: [
                                    ["@babel/transform-runtime"],
                                ],
                            },
                        },
                        {
                            loader: "ts-loader",
                        },
                    ],
                },
            ],
        },
        plugins: defineList([
            new CleanPlugin(
                [buildPath],
                { verbose: false }
            ),
            new webpack.DefinePlugin({
                "process.env.appPackage": JSON.stringify(pkg),
            }),
        ]),
    };
}

function defineList(list) {
    return list.filter(x => !!x);
}
