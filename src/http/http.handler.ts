import express from 'express';
import AuthModule from '../services/auth/module/auth.module';
import {SocialColyseusApp} from '../app';
import jwt from 'express-jwt';
import UserModule from '../services/user/module/user.module';
import bodyParser from 'body-parser';

export const HttpHandler = (app: SocialColyseusApp) => {
    const routes = express.Router();
    routes.use(bodyParser.json());
    routes.use(
        jwt({
            secret: process.env.APP_SECRET,
            algorithms: ['HS256'],
            getToken: req => {
                let bearerToken = req.header('Authorization')?.replace('Bearer ', '');
                return req.query.token || bearerToken;
            },
        }).unless({path: ['/auth/login', '/auth/register']}),
    );
    routes.use('/auth', AuthModule(app));
    routes.use('/user', UserModule(app));

    return routes;
};
