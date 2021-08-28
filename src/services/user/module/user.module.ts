import {SocialColyseusApp} from '../../../app';
import express from 'express';
import getUserMiddleware from '../../../http/middleware/get.user.middleware';
import FriendModule from '../../friendship/module/friendship.module';

const UserModule = (app: SocialColyseusApp) => {
    const router = express.Router();
    router.use(getUserMiddleware(app));

    router.get('/me', async (req, res) => {
        return res.json({user: {user: {...req.user, password: undefined}}});
    });

    router.use('/friend', FriendModule(app));

    return router;
};

export default UserModule;
