const router = require('express').Router();

const {userSignup, userLogin}=require('../controllers/authController');
router.post('/user-signup', userSignup);
router.post('/user-login', userLogin);


module.exports = router;