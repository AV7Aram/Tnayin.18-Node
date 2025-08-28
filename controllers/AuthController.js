const { registerSchema, loginSchema } = require('../schema/userValidation');
const AuthService = require('../services/AuthService');
const authService = new AuthService();

class AuthController {
    getRegister(req, res) {
        res.render('register', { error: null });
    }

    getLogin(req, res) {
        res.render('login', { error: null });
    }

    async postRegister(req, res) {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).render('register', { error: error.message });

        try {
            await authService.register(req.users, value);
            res.render('register', { error: null });
        } catch (err) {
            res.status(400).render('register', { error: err.message });
        }
    }

    async postLogin(req, res) {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).render('login', { error: error.message });

        try {
            const user = await authService.login(req.users, value);
            req.session.loginMessage = `Login successful! Welcome, ${user.name}.`;
            res.redirect('/');
        } catch (err) {
            res.status(401).render('login', { error: err.message });
        }
    }
}

module.exports = AuthController;
