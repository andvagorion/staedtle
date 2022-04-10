module.exports = {
    env: {
        browser: true,
        es2015: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: "latest"
    },
    rules: {
        "no-unused-vars": [
            error, {
                vars: "local",
                args: "all",
                argsIgnorePattern: '^_',
            }
        ],
    }
};
