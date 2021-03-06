import {SocialColyseusApp} from '../../app';

const getUserMiddleware = (app: SocialColyseusApp) => async (req, res, next) => {
    req.user = await app.userService.findUserById(req.user.userId);
    next();
};

export default getUserMiddleware;
