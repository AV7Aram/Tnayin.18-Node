const bcrypt = require('bcryptjs');
const { writeUsers } = require('../helpers/userWriter');

class UserService {
    filterUsers(users, query) {
        const { name, age } = query;
        let filteredUsers = [...users];
        const messages = [];

        if (name) {
            filteredUsers = filteredUsers.filter(u =>
                u.name.toLowerCase().includes(name.toLowerCase())
            );
            if (filteredUsers.length === 0) {
                messages.push('No user with that name was found.');
            }
        }

        if (age) {
            if (age === 'min') {
                filteredUsers.sort((a, b) => a.age - b.age);
            } else if (age === 'max') {
                filteredUsers.sort((a, b) => b.age - a.age);
            } else {
                messages.push('Invalid sort value. Use "min" or "max".');
            }
        }

        return { users: filteredUsers, messages };
    }

    async updateUser(users, id, updateData) {
        const userIndex = users.findIndex(u => u.id == id);
        if (userIndex === -1) {
            throw { status: 404, message: 'User not found' };
        }

        const user = users[userIndex];
        const { name, age, email, password, new_password } = updateData;
        const updatedFields = [];

        if (name) {
            user.name = name;
            updatedFields.push('name');
        }

        if (typeof age !== 'undefined') {
            user.age = age;
            updatedFields.push('age');
        }

        if (email) {
            const emailExists = users.some((u, i) => u.email === email && i !== userIndex);
            if (emailExists) {
                throw { status: 400, message: 'Email is already in use' };
            }
            user.email = email;
            updatedFields.push('email');
        }

        if (password || new_password) {
            if (!password || !new_password) {
                throw { status: 400, message: 'Both password and new_password must be provided' };
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw { status: 401, message: 'Incorrect current password' };
            }

            const hashed = await bcrypt.hash(new_password, 10);
            user.password = hashed;
            updatedFields.push('password');
        }

        if (updatedFields.length === 0) {
            throw { status: 400, message: 'No valid fields provided for update' };
        }

        writeUsers(users);

        return updatedFields;
    }

    deleteUser(users, id) {
        const initialLength = users.length;
        const newUsers = users.filter(u => u.id != id);

        if (newUsers.length === initialLength) {
            throw { status: 404, message: 'User not found' };
        }

        writeUsers(newUsers);
        return;
    }
}

module.exports = UserService
