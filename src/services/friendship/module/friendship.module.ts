import {SocialColyseusApp} from '../../../../index';
import express from 'express';
import {User} from '../../user/schema/user.schema';
import UpsertFriendshipModel, {
    friendshipExistsValidator,
    friendshipExistsQueryValidator, friendshipApproveValidator,
} from '../models/upsert.friendship.model';
import {validationResult} from 'express-validator';

const FriendModule = (app: SocialColyseusApp) => {
    const router = express.Router();
    const getFriends = async (user: User, isApproved: boolean) => {
        const idList = isApproved ? await app.friendshipService.getFriendsIdListOfUser(user._id.toString()) : await app.friendshipService.getFriendsRequestsIdListOfUser(user._id.toString());

        return app.userService.findUsersByIdList(idList);
    };
    router.get('/', async (req, res) => {
        const user: User = req.user as User;

        res.json({
            data: await getFriends(user, true),
        });
    });

    router.get('/request', async (req, res) => {
        const user: User = req.user as User;

        res.json({
            data: await getFriends(user, false),
        });
    });
    router.post<any, any, UpsertFriendshipModel>('/request', friendshipExistsValidator(app), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const user: User = req.user as User;
        const request = await app.friendshipService.createFriendship({
            receiver: req.body.friend_id,
            sender: user._id.toString(),
        });

        return res.json({data: request});
    });
    router.post<any, any, UpsertFriendshipModel>('/request/approve', friendshipApproveValidator(app), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const user: User = req.user as User;
        await app.friendshipService.approveFriendship({
            sender: req.body.friend_id,
            receiver: user._id,
        });

        return res.json({data: {success: true}});
    });
    router.delete('/request', friendshipExistsQueryValidator, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const user: User = req.user as User;
        await app.friendshipService.deleteFriendship({receiver: req.query.friend_id, sender: user._id.toString()});

        return res.json({data: {success: true}});
    });
    return router;
};

export default FriendModule;
