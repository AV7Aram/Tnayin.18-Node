const bcrypt = require('bcryptjs');
const { writeUsers } = require('../helpers/userWriter');

class AuthService {
    async register(users, userData) {
        const { name, email, password, age } = userData;

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            age
        };

        users.push(newUser);
        writeUsers(users);

        return newUser;
    }

    async login(users, loginData) {
        const { email, password } = loginData;
        const user = users.find(u => u.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        return user;
    }
}

module.exports = AuthService
