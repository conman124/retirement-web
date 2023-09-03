const util = require("util");
const { access, symlink } = require("fs").promises;
const { join } = require("path");

function addWasmDeployHack(config, { isServer }) {
    config.plugins.push(
        new (class {
            apply(compiler) {
                compiler.hooks.afterEmit.tapPromise(
                    "SymlinkWebpackPlugin",
                    async (compiler) => {
                        if (isServer) {
                            const from = join(
                                compiler.options.output.path,
                                "../static"
                            );
                            const to = join(
                                compiler.options.output.path,
                                "static"
                            );

                            try {
                                await access(from);
                                console.log(`${from} already exists`);
                                return;
                            } catch (error) {
                                if (error.code === "ENOENT") {
                                    // No link exists
                                } else {
                                    throw error;
                                }
                            }

                            await symlink(to, from, "junction");
                            console.log(
                                `HACK: created symlink ${from} -> ${to}`
                            );
                        }
                    }
                );
            }
        })()
    );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    runtime: "experimental-edge",
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        esmExternals: "loose",
    },

    webpack: (config, ctx) => {
        config.experiments.asyncWebAssembly = true;
        config.module.rules.push({
            test: [/\.csv$/],
            type: "asset/source",
        });
        config.resolve.extensionAlias = {
            ".js": [".ts", ".tsx", ".js", ".jsx"],
            ".mjs": [".mts", ".mjs"],
            ".cjs": [".cts", ".cjs"],
        };

        // This seems to no longer be required, but leaving just in case
        //addWasmDeployHack(config, ctx);

        // Important: return the modified config
        return config;
    },
};

module.exports = nextConfig;
