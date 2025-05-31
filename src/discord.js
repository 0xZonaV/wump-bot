import axios from 'axios';
import cookie from 'cookie-parse';
import { HttpsProxyAgent } from 'https-proxy-agent';

import WumpApiClient from './api.js';
import logger from './logger.js';
import { getCodeChallenge } from './supabase.js';

export const discordAuth = async (userAgent, token, proxy, array, accountNumber = null) => {
    try {
        logger.info('Starting Discord authentication', accountNumber, proxy);
        const { code_verifier, code_challenge } = getCodeChallenge();

        const wumpApi = new WumpApiClient(proxy, { userAgent });

        try {
            logger.info('Validating Discord token', accountNumber, proxy);
            await axios.get('https://discord.com/api/v9/users/@me/library', {
                headers: {
                    authorization: token,
                    'User-Agent': userAgent,
                },
                httpsAgent: new HttpsProxyAgent(
                    proxy.startsWith('http') ? proxy : `http://${proxy}`,
                ),
                httpAgent: new HttpsProxyAgent(
                    proxy.startsWith('http') ? proxy : `http://${proxy}`,
                ),
            });
        } catch (err) {
            logger.warning('Discord token validation failed', accountNumber, proxy);
            return {
                skip: true,
                msg: 'Token is invalid or expired',
            };
        }

        logger.info('Getting Discord authorization link', accountNumber, proxy);
        const link = await wumpApi.getDiscordLink(code_challenge, array);

        const urlObj = new URL(link);
        const paramsParsed = Object.fromEntries(urlObj.searchParams.entries());

        const params = {
            client_id: paramsParsed.client_id,
            response_type: 'code',
            redirect_uri: paramsParsed.redirect_uri,
            redirect_to: paramsParsed.redirect_to,
            scope: paramsParsed.scope,
            state: paramsParsed.state,
        };

        const discordAuthHeaders = {
            authority: 'discord.com',
            accept: '*/*',
            'accept-language': 'lt',
            authorization: token,
            referer: 'https://discord.com/',
            'user-agent': userAgent,
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
        };

        logger.info('Authorizing with Discord OAuth', accountNumber, proxy);
        const response1 = await axios.post(
            `https://discord.com/api/v9/oauth2/authorize`,
            {
                permissions: '0',
                authorize: true,
                integration_type: 0,
                location_context: {
                    guild_id: '10000',
                    channel_id: '10000',
                    channel_type: 10000,
                },
            },
            {
                headers: discordAuthHeaders,
                httpsAgent: new HttpsProxyAgent(proxy),
                httpAgent: new HttpsProxyAgent(proxy),
                params,
            },
        );

        logger.info('Following OAuth redirect', accountNumber, proxy);
        const respConnected = await wumpApi.get(response1.data.location, {}, false);

        logger.info('Completing authentication flow', accountNumber, proxy);
        const respConnected2 = await wumpApi.get(
            wumpApi.extractHref(respConnected),
            {
                headers: {
                    Host: 'wump.xyz',
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Sec-Fetch-Site': 'cross-site',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-User': '?1',
                    'Sec-Fetch-Dest': 'document',
                    'sec-ch-ua':
                        '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    Referer: 'https://discord.com/',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,pt;q=0.6',
                    Cookie: `sb-api-auth-token-code-verifier=base64-${code_verifier}`,
                },
            },
            true,
        );

        await wumpApi.get(
            wumpApi.extractHref(respConnected),
            {
                maxRedirects: 10,
                headers: {
                    Host: 'wump.xyz',
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Sec-Fetch-Site': 'cross-site',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-User': '?1',
                    'Sec-Fetch-Dest': 'document',
                    'sec-ch-ua':
                        '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    Referer: 'https://discord.com/',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,pt;q=0.6',
                    Cookie: `sb-api-auth-token-code-verifier=base64-${code_verifier}`,
                },
            },
            true,
        );

        logger.info('Extracting authentication tokens', accountNumber, proxy);
        const cookieWithAuth = cookie.parse(respConnected2.headers['set-cookie'][1]);
        const base64AuthToken = cookieWithAuth['sb-api-auth-token.0'].match(/base64-([^;]+)/)[1];

        const cookieWithAuth1 = cookie.parse(respConnected2.headers['set-cookie'][2]);
        const base64AuthToken1 = cookieWithAuth1['sb-api-auth-token.1'];

        const user = JSON.parse(
            Buffer.from(base64AuthToken + base64AuthToken1, 'base64').toString('utf-8'),
        );

        logger.success('Discord authentication successful', accountNumber, proxy);
        return {
            skip: false,
            msg: 'Success',
            user,
        };
    } catch (e) {
        logger.error('Discord authentication failed', e, accountNumber, proxy);
        return {
            skip: true,
            msg: e.toString(),
        };
    }
};
