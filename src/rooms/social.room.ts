import {Room, Client, matchMaker} from 'colyseus';
import {SocialColyseusApp} from '../index';
import {User} from '../services/user/schema/user.schema';
import authenticate from '../services/auth/authenticate';
import {Invitation} from '../services/invitation/schema/invitation.schema';
import {Document} from 'mongoose';

export class SocialRoom extends Room {
    protected app: SocialColyseusApp;
    autoDispose = false;

    onCreate(options: any): void | Promise<any> {
        if (!options.secret || (options.secret && options.secret !== process.env.APP_SECRET)) {
            return Promise.reject();
        }
        if (!options.app) {
            return Promise.reject();
        }
        this.app = options.app;
        this.onMessage('getFriends', async (client) => {
            const user: User = client.userData;
            client.send('friends', await this.getFriendsOfUser(user._id.toString()));
        });
        this.onMessage('inviteFriend', async (client, message) => await this.inviteUser(client, message));
    }

    protected async inviteUser(inviter: Client, message: { roomId: string, invitedId: string }) {
        const invitee: Client = this.clients.find(t => t.userData._id.toString() === message.invitedId);
        if (await this.app.friendshipService.isUserFriendWith(inviter.userData._id.toString(), message.invitedId)) {
            const room = matchMaker.getRoomById(message.roomId);
            if (!room) {
                inviter.send('errorMessage', {type: 'room_not_found', roomId: message.roomId});
                return;
            }

            const invitation = await this.app.invitationService.invite({
                invitedId: message.invitedId,
                roomId: message.roomId,
                inviterId: inviter.userData._id.toString(),
            });
            this.alertInvitee(invitee, invitation);
            inviter.send('infoMessage', {type: 'user_invite', roomId: message.roomId, invitedId: message.invitedId});
            return;
        }

        inviter.send('errorMessage', {type: 'not_your_friend', invitedId: message.invitedId});
    }

    protected alertInvitee(invitee: Client, invitation: Document<any, any, Invitation>) {
        invitee.send('invited', {...invitation.toObject(), roomId: undefined});
    }

    protected async getFriendsOfUser(id: string) {
        const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(id);
        return await this.app.userService.findUsersByIdList(friendsIdList);
    }

    async onAuth(client: Client, options: { token: string }): Promise<User> {
        const user = await authenticate(this.app, options);
        client.userData = user;
        const friends = await this.getFriendsOfUser(user._id.toString());
        const me = await this.app.userService.findUserById(user._id.toString());
        client.send('friends', friends);
        client.send('me', me);
        return user;
    }
}
