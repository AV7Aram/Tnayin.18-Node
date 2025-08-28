const fs = require('fs').promises;
const path = './db/users.json';

async function userReader(req, res, next) {
    try {
        const data = await fs.readFile(path, 'utf8');
        let users = [];
        if (data) {
            users = JSON.parse(data);
            if (!Array.isArray(users)) users = [];
        }
        req.users = users;
        next();
    } catch (err) {
        req.users = [];
        next();
    }
}

module.exports = { userReader };