import express from 'express';
import {SocialColyseusApp} from '../../../app';
import {RegisterModel, RegisterValidator} from '../models/register.model';
import {validationResult} from 'express-validator';
import bcrypt from 'bcrypt';
import {LoginModel, LoginValidator} from '../models/login.model';

const AuthModule = (app: SocialColyseusApp) => {
    const router = express.Router();

    router.post<any, any, RegisterModel>('/register', RegisterValidator(app),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            const {email, userName, password} = req.body;
            const user = await app.userService.createUser({email, password, userName});
            return res.status(200).json({data: {...user.toObject(), password: undefined}});
        },
    );

    router.post<any, any, LoginModel>('/login', LoginValidator(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            const user = await app.userService.findByCredentials(req.body.userName);
            if (user === null) {
                return res.status(400).json({error: 'Invalid credentials'});
            }
            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            if (isValidPassword) {
                const now = new Date();
                const session = await app.authService.createAuth({
                    userId: user._id,
                    expiresAt: new Date().setFullYear(now.getFullYear() + 1),
                });
                const token = app.authService.createToken(session);
                return res.status(200).json({data: {token, user: {...user.toObject(), password: undefined}}});
            } else {
                return res.status(400).json({error: 'Invalid credentials'});
            }
        },
    );

    return router;
};

export default AuthModule;
