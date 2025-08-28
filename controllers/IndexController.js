class IndexController {
    getHome(req, res) {
        const message = req.session?.loginMessage || null;

        if (req.session) {
            req.session.loginMessage = null;
        }

        res.render('index', {
            users: req.users,
            message
        });
    }
}

module.exports = IndexController
