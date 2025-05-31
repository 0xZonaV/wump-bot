import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import _ from 'lodash';
import randomUseragent from 'random-useragent';

import WumpApiClient from './api.js';
import { discordAuth } from './discord.js';
import logger from './logger.js';
import {
    getProxiesFromFile,
    getSettingsFromFile,
    getTokensFromFile,
    getTotalTokensFromCsv,
    updateCsvFile,
} from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const savePath = path.join(__dirname, '../data/save.json');

const main = async () => {
    logger.displayLogo();

    const tokens = getTokensFromFile();
    const proxies = getProxiesFromFile();
    const config = getSettingsFromFile();

    logger.startupInfo(tokens.length, proxies.length);

    let proxyIndex = 0;
    let accountIndex = 0;

    let savedData = {};
    if (fs.existsSync(savePath)) {
        savedData = JSON.parse(fs.readFileSync(savePath, 'utf-8'));
    }

    for (const token of tokens) {
        accountIndex++;

        let userAgent = savedData[token]?.userAgent;
        if (!userAgent) {
            userAgent = randomUseragent.getRandom();
            if (!savedData[token]) {
                savedData[token] = {};
            }

            savedData[token].userAgent = userAgent;
        }

        if (proxyIndex >= proxies.length) {
            proxyIndex = 0;
        }
        const proxy = proxies[proxyIndex];
        proxyIndex++;

        logger.info(`Processing token`, accountIndex, proxy);

        let result;
        if (
            savedData[token] &&
            savedData[token]?.user?.expires_at > Math.round(Date.now() / 1000)
        ) {
            logger.info('Token is saved, skipping Discord auth', accountIndex, proxy);
            result = savedData[token];
        } else {
            logger.info('Token is not saved, starting Discord auth', accountIndex, proxy);
            result = await discordAuth(userAgent, token, proxy, config.ref_tokens, accountIndex);
            savedData[token] = result;
            fs.writeFileSync(savePath, JSON.stringify(savedData, null, 2));
        }

        if (result.skip) {
            logger.warning(`Authentication failed: ${result.msg}`, accountIndex, proxy);
            continue;
        }

        const accessToken = result.user.access_token;
        const userId = result.user.user.id;

        const wumpApi = new WumpApiClient(proxy, { userAgent });

        try {
            const userTokens = await wumpApi.getTokens(accessToken, userId);

            if (userTokens && userTokens.length > 0) {
                const username = userTokens[0].username;
                const points = userTokens[0].total_points;

                logger.info(`User: ${username}, Points: ${points}`, accountIndex, proxy);
                await updateCsvFile(username, token, points);
            } else {
                logger.warning('No user tokens found', accountIndex, proxy);
                continue;
            }

            const allTasks = await wumpApi.getAllTasks(accessToken);
            const completedTasks = await wumpApi.getCompletedTasks(accessToken, userId);

            const uncompletedTasks = wumpApi.getUncompletedTasks(allTasks, completedTasks);

            logger.info(`Found ${uncompletedTasks.length} uncompleted tasks`, accountIndex, proxy);

            for (const task of uncompletedTasks) {
                try {
                    logger.info(
                        `Attempting to complete task: ${task.task_type}`,
                        accountIndex,
                        proxy,
                        task.task_type,
                    );
                    const result = await wumpApi.completeTask(accessToken, task.id, task.task_type);

                    if (result?.result?.success) {
                        logger.success(
                            `Completed task: ${task.task_type}`,
                            accountIndex,
                            proxy,
                            task.task_type,
                        );
                    } else {
                        logger.warning(
                            `Failed to complete task: ${task.task_type}`,
                            accountIndex,
                            proxy,
                            task.task_type,
                        );
                    }
                } catch (e) {
                    logger.error(
                        `Error completing task: ${task.task_type}`,
                        e,
                        accountIndex,
                        proxy,
                        task.task_type,
                    );
                }
            }

            const waitSec = _.random(
                false,
                config.wait_between_accs.min,
                config.wait_between_accs.max,
            );

            logger.info(`Waiting ${waitSec} seconds before next account`, accountIndex, proxy);

            await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
        } catch (e) {
            logger.error('Error processing account', e, accountIndex, proxy);
        }
    }

    logger.completionStats(getTotalTokensFromCsv());
};

main();
