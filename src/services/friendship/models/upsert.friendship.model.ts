import {SocialColyseusApp} from '../../../index';
import {body, query} from 'express-validator';
import {User} from '../../user/schema/user.schema';

type UpsertFriendshipModel = {
    friend_id: string;
}

const findRequest = (app: SocialColyseusApp) => async (input, {req}) => {
    const user: User = req.user as User;
    if (user._id.toString() === input) {
        return Promise.reject();
    }
    const request = await app.friendshipService.findBySenderOrReceiver(input, input);
    if (request !== null) {
        return Promise.reject();
    }
};

export const friendshipExistsValidator = (app: SocialColyseusApp) => [
    body('friend_id')
        .exists().bail()
        .isString().bail()
        .custom(findRequest(app)),
];

export const friendshipExistsQueryValidator = [
    query('friend_id')
        .exists().bail()
        .isString().bail(),
];

export const friendshipApproveValidator = (app: SocialColyseusApp) => [
    body('friend_id')
        .exists().bail()
        .isString().bail()
        .custom(async (input, {req}) => {
            const user: User = req.user as User;
            if (user._id.toString() === input) {
                return Promise.reject();
            }
            const request = await app.friendshipService.findBySenderOrReceiver(input, user._id.toString());
            if (request === null) {
                return Promise.reject();
            }
        }),
];

export default UpsertFriendshipModel;
