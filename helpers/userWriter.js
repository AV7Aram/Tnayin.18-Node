const fs = require('fs');
const path = './db/users.json';

function writeUsers(users) {
    fs.writeFileSync(path, JSON.stringify(users, null, 2));
}

module.exports = { writeUsers };
