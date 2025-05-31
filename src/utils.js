import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { createObjectCsvWriter } from 'csv-writer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_FILE_PATH = path.join(__dirname, '../data/users.csv');

export const getTokensFromFile = () => {
    const filePath = path.join(__dirname, '../data/accounts.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(token => token.trim().length > 0);
};

export const getProxiesFromFile = () => {
    const filePath = path.join(__dirname, '../data/proxies.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(proxy => proxy.trim().length > 0);
};

export const getSettingsFromFile = () => {
    const filePath = path.join(__dirname, '../data/settings.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
};

export const getTotalTokensFromCsv = () => {
    if (fs.existsSync(CSV_FILE_PATH)) {
        const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
        const records = content
            .split('\n')
            .slice(1)
            .filter(row => row.trim())
            .map(row => {
                const [username, token, points] = row.split(';');
                return { username, token, points: parseInt(points) || 0 };
            });

        const totalTokens = records.reduce((sum, record) => sum + record.points, 0);

        return totalTokens ?? 0;
    } else {
        return 0;
    }
};

export const updateCsvFile = async (username, token, points) => {
    const csvWriter = createObjectCsvWriter({
        path: CSV_FILE_PATH,
        header: [
            { id: 'username', title: 'User name' },
            { id: 'token', title: 'Token' },
            { id: 'points', title: 'Points' },
        ],
        fieldDelimiter: ';',
        append: false,
    });

    let records = [];
    if (fs.existsSync(CSV_FILE_PATH)) {
        const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
        records = content
            .split('\n')
            .slice(1)
            .filter(row => row.trim())
            .map(row => {
                const [username, token, points] = row.split(';');
                return { username, token, points };
            });
    }

    const existingIndex = records.findIndex(record => record.token === token);
    if (existingIndex !== -1) {
        records[existingIndex] = { username, token, points };
    } else {
        records.push({ username, token, points });
    }

    try {
        await csvWriter.writeRecords(records);
    } catch (error) {
        console.error('Error writing CSV file:', error);
        throw error;
    }
};
