import {User} from '../user/schema/user.schema';
import jsonwebtoken from 'jsonwebtoken';
import {Auth} from './schema/auth.schema';
import {SocialColyseusApp} from '../../../index';

const authenticate = async (app?: SocialColyseusApp, options?: { token: string }): Promise<User> => {
    if (!app) {
        throw new Error('no_app');
    }
    if (!options) {
        throw new Error('no_options');
    }
    const token = options.token;
    if (!token || !token.length) {
        throw new Error('no_token');
    }
    const userMeta = jsonwebtoken.decode(token) as Auth;
    if (userMeta === null) {
        throw new Error('invalid_token');
    }
    const user = await app.userService.findUserById(userMeta.userId);
    if (user === null) {
        throw new Error('invalid_token');
    }

    return user;
};

export default authenticate;
