(async () => {
    const chalk = await import('chalk')

    const originalInfo = console.info
    const originalWarn = console.warn
    const originalError = console.error

    console.info = function(...args) {
        originalInfo(chalk.default.green(...args))
    }

    console.warn = function(...args) {
        originalWarn(chalk.default.yellow(...args))
    }

    console.error = function(...args) {
        originalError(chalk.default.red(...args))
    }
})()