const { updateUserSchema } = require('../schema/userValidation');
const UserService = require('../services/UserService');
const userService = new UserService()


class UsersController {
    getUsers(req, res) {
        const { users } = req;
        const { users: filtered, messages } = userService.filterUsers(users, req.query);

        if (messages.length > 0) {
            return res.status(400).json({ messages });
        }

        res.json(filtered);
    }

    async updateUser(req, res) {
        const { error, value } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const updatedFields = await userService.updateUser(req.users, req.params.id, value);
            res.json({
                message: 'User updated successfully',
                updated: updatedFields
            });
        } catch (err) {
            res.status(err.status || 500).json({ error: err.message || 'Internal error' });
        }
    }

    deleteUser(req, res) {
        try {
            userService.deleteUser(req.users, req.params.id);
            res.json({ message: 'User deleted successfully' });
        } catch (err) {
            res.status(err.status || 500).json({ error: err.message || 'Internal error' });
        }
    }
}

module.exports = UsersController
