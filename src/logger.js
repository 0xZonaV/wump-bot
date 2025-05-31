import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../logs');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
};

class Logger {
    constructor() {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }

        this.logFile = path.join(LOG_DIR, `log_${this.getFormattedDate()}.txt`);
        this.errorFile = path.join(LOG_DIR, `error_${this.getFormattedDate()}.txt`);

        this.writeToFile(
            this.logFile,
            `=== ZVTech Bot Log - Started at ${new Date().toISOString()} ===\n\n`,
        );
        this.writeToFile(
            this.errorFile,
            `=== ZVTech Bot Error Log - Started at ${new Date().toISOString()} ===\n\n`,
        );
    }

    getFormattedDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    writeToFile(filePath, message) {
        fs.appendFileSync(filePath, message + '\n');
    }

    displayLogo() {
        const logo = `
${colors.cyan}${colors.bright}███████╗██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗${colors.reset}
${colors.cyan}${colors.bright}╚══███╔╝██║   ██║╚══██╔══╝██╔════╝██╔════╝██║  ██║${colors.reset}
${colors.cyan}${colors.bright}  ███╔╝ ██║   ██║   ██║   █████╗  ██║     ███████║${colors.reset}
${colors.cyan}${colors.bright} ███╔╝  ╚██╗ ██╔╝   ██║   ██╔══╝  ██║     ██╔══██║${colors.reset}
${colors.cyan}${colors.bright}███████╗ ╚████╔╝    ██║   ███████╗╚██████╗██║  ██║${colors.reset}
${colors.cyan}${colors.bright}╚══════╝  ╚═══╝     ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝${colors.reset}
                                                        
${colors.yellow}Join our Telegram channel: ${colors.blue}${colors.underscore}https://t.me/zonavtech${colors.reset}
`;
        console.log(logo);
        this.writeToFile(
            this.logFile,
            'ZVTech Bot Started\nTelegram channel: https://t.me/zonavtech\n',
        );
    }

    info(message, accountNumber = null, proxy = null, task = null) {
        const timestamp = this.getTimestamp();
        let formattedMessage = `[${timestamp}] [INFO] ${message}`;

        if (accountNumber !== null) {
            formattedMessage += ` | Account: ${accountNumber}`;
        }

        if (proxy !== null) {
            formattedMessage += ` | Proxy: ${proxy}`;
        }

        if (task !== null) {
            formattedMessage += ` | Task: ${task}`;
        }

        console.log(`${colors.green}${formattedMessage}${colors.reset}`);
        this.writeToFile(this.logFile, formattedMessage);
    }

    success(message, accountNumber = null, proxy = null, task = null) {
        const timestamp = this.getTimestamp();
        let formattedMessage = `[${timestamp}] [SUCCESS] ${message}`;

        if (accountNumber !== null) {
            formattedMessage += ` | Account: ${accountNumber}`;
        }

        if (proxy !== null) {
            formattedMessage += ` | Proxy: ${proxy}`;
        }

        if (task !== null) {
            formattedMessage += ` | Task: ${task}`;
        }

        console.log(`${colors.cyan}${formattedMessage}${colors.reset}`);
        this.writeToFile(this.logFile, formattedMessage);
    }

    warning(message, accountNumber = null, proxy = null, task = null) {
        const timestamp = this.getTimestamp();
        let formattedMessage = `[${timestamp}] [WARNING] ${message}`;

        if (accountNumber !== null) {
            formattedMessage += ` | Account: ${accountNumber}`;
        }

        if (proxy !== null) {
            formattedMessage += ` | Proxy: ${proxy}`;
        }

        if (task !== null) {
            formattedMessage += ` | Task: ${task}`;
        }

        console.log(`${colors.yellow}${formattedMessage}${colors.reset}`);
        this.writeToFile(this.logFile, formattedMessage);
    }

    error(message, error = null, accountNumber = null, proxy = null, task = null) {
        const timestamp = this.getTimestamp();
        let formattedMessage = `[${timestamp}] [ERROR] ${message}`;

        if (error) {
            formattedMessage += `\nError details: ${error.toString()}`;
            if (error.stack) {
                formattedMessage += `\nStack trace: ${error.stack}`;
            }
        }

        if (accountNumber !== null) {
            formattedMessage += ` | Account: ${accountNumber}`;
        }

        if (proxy !== null) {
            formattedMessage += ` | Proxy: ${proxy}`;
        }

        if (task !== null) {
            formattedMessage += ` | Task: ${task}`;
        }

        console.error(`${colors.red}${formattedMessage}${colors.reset}`);
        this.writeToFile(this.logFile, formattedMessage);
        this.writeToFile(this.errorFile, formattedMessage);
    }

    startupInfo(tokensCount, proxiesCount) {
        this.info(`Bot started with ${tokensCount} tokens and ${proxiesCount} proxies`);
        console.log(
            `${colors.green}${colors.bright}=== Loaded ${tokensCount} tokens and ${proxiesCount} proxies ====${colors.reset}`,
        );
    }

    completionStats(totalTokens) {
        this.info(`Bot finished. Total tokens obtained: ${totalTokens}`);
        console.log(
            `${colors.green}${colors.bright}=== Total tokens obtained: ${totalTokens} ====${colors.reset}`,
        );
    }
}

const logger = new Logger();
export default logger;
