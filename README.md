# Wump Bot

### Описание
Wump Bot — бот для автоматизации регистрации и заданий [wump.xyz](https://wump.xyz/join?ref=414946325776564244).

### Telegram канал
Присоединяйтесь к нашему [Telegram каналу](https://t.me/zonavtech) для получения обновлений и поддержки!

### Установка и настройка

#### Требования
- [Node.js](https://nodejs.org/) (версия 14 или выше)

#### Шаги установки
1. Скачайте или клонируйте репозиторий
2. Настройте файлы конфигурации в папке `data`:
   - `accounts.txt` - добавьте токены Discord аккаунтов (по одному на строку)
   - `proxies.txt` - добавьте прокси в формате `http://host:pass@ip:port` (по одному на строку)
   - `settings.json` - настройте параметры работы бота
     - `wait_between_accs` - в секундах
     - `ref_tokens` - список ваших реф кодов, можно взять из ссылки, пример: https://wump.xyz/join?ref=414946325776564244

#### Запуск
Запустите бот командой:
```
npm start
```

---

## English

### Description
Wump Bot - is a tool for automating registration and task completing in [wump.xyz](https://wump.xyz/join?ref=414946325776564244) .

### Telegram channel
Join our [Telegram channel](https://t.me/zonavtech) for updates and support!

### Installation and Setup

#### Requirements
- [Node.js](https://nodejs.org/) (version 14 or higher)

#### Installation Steps
1. Download or clone the repository
2. Configure the files in the `data` folder:
   - `accounts.txt` - add Discord account tokens (one per line)
   - `proxies.txt` - add proxies in the format `http://host:pass@ip:port` (one per line)
   - `settings.json` - configure bot settings
      - `wait_between_accs` - in seconds
     - `ref_tokens` - list of your referral codes that can be taken from the link, example: https://wump.xyz/join?ref=414946325776564244

#### Launch
Start the bot with the command:
```
npm start
```