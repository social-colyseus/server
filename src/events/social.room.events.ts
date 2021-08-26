import {EventEmitter} from 'events';
import {Client} from 'colyseus';
import {SocialColyseusApp} from '../../index';
import {User} from '../services/user/schema/user.schema';

export class SocialRoomEvents {
    public getClients: () => Client[] = () => [];
    public readonly emitter = new EventEmitter();

    constructor(protected app: SocialColyseusApp) {
        this.emitter.addListener('getMe', this.getMe);

        this.emitter.addListener('onPlayerJoin', this.onPlayerJoin);
        this.emitter.addListener('onPlayerLeave', this.onPlayerLeave);

        this.emitter.addListener('listOnlineFriends', this.listOnlineFriends);

        this.emitter.addListener('addFriend', this.addFriend);

        this.emitter.addListener('approveFriendship', this.approveFriendship);
        this.emitter.addListener('rejectFriendship', this.rejectFriendship);

        this.emitter.addListener('removeFriend', this.removeFriend);

        this.emitter.addListener('listFriends', this.listFriends);
        this.emitter.addListener('listFriendshipRequests', this.listFriendshipRequests);

        this.emitter.addListener('inviteFriendToRoom', this.inviteFriendToRoom);
        this.emitter.addListener('acceptInvitation', this.invitationAccepted);
        this.emitter.addListener('rejectInvitation', this.invitationRejected);
    }

    protected async getMe(client: Client) {
        client.send('me', {...client.userData.toObject(), password: undefined});
    }

    protected async onPlayerJoin(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const onlineFriends = this.getClients().filter(t => friendsIdList.includes(t.userData._id.toString()));

            for (const friend of onlineFriends) {
                friend.send('onFriendJoined', {id: client.userData._id});
            }
        } catch (_) {

        }
    }

    protected async onPlayerLeave(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const onlineFriends = this.getClients().filter(t => friendsIdList.includes(t.userData._id.toString()));

            for (const friend of onlineFriends) {
                friend.send('onFriendLeave', {id: client.userData._id.toString()});
            }
        } catch (_) {

        }
    }

    protected async listOnlineFriends(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const onlineFriends: User[] = this.getClients().filter(t => friendsIdList.includes(t.userData._id.toString())).map(client => ({
                ...client.userData, password: undefined,
            }));
            client.send('onOnlineFriends', {friends: onlineFriends});
        } catch (_) {
            client.send('failure', {eventType: 'listOnlineFriends'});
        }
    }

    protected async addFriend(client: Client, friend_id: string) {
        try {
            await this.app.friendshipService.createFriendship({
                sender: client.userData._id.toString(),
                receiver: friend_id,
            });
            client.send('onFriendshipRequestSent', {receiver: friend_id});
        } catch (_) {
            client.send('failure', {eventType: 'addFriend'});
        }
    }

    protected async approveFriendship(client: Client, friend_id: string) {
        try {
            await this.app.friendshipService.approveFriendship({
                receiver: client.userData._id.toString(),
                sender: friend_id,
            });
            const friend = this.getClients().find(t => t.userData._id.toString() === friend_id);
            if (friend) {
                friend.send('onFriendshipRequestAccepted', {friend_id});
            }
        } catch (_) {
            client.send('failure', {eventType: 'approveFriendship'});
        }
    }

    protected async rejectFriendship(client: Client, friend_id: string) {
        try {
            await this.app.friendshipService.deleteFriendship({
                receiver: client.userData._id.toString(),
                sender: friend_id,
            });
            const friend = this.getClients().find(t => t.userData._id.toString() === friend_id);
            if (friend) {
                friend.send('onFriendshipRequestRejected', {friend_id});
            }
        } catch (_) {
            client.send('failure', {eventType: 'rejectFriendship'});
        }
    }

    protected async removeFriend(client: Client, friend_id: string) {
        try {
            await this.app.friendshipService.deleteFriendship({
                receiver: client.userData._id.toString(),
                sender: friend_id,
            });
            client.send('onFriendshipRemoved', {friend_id});
        } catch (_) {
            client.send('failure', {eventType: 'removeFriend'});
        }
    }

    protected async listFriends(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const userList = await this.app.userService.findUsersByIdList(friendsIdList);
            client.send('onListFriends', {friends: userList});
        } catch (_) {
            client.send('failure', {eventType: 'listFriends'});
        }
    }

    protected async listFriendshipRequests(client: Client) {
        try {
            const requestsIdList = await this.app.friendshipService.getFriendsRequestsIdListOfUser(client.userData._id.toString());
            const userList = await this.app.userService.findUsersByIdList(requestsIdList);
            client.send('onListFriendshipRequests', {requests: userList});
        } catch (_) {
            client.send('failure', {eventType: 'listFriends'});
        }
    }

    protected async inviteFriendToRoom(client: Client, friend_id: string, roomId: string) {
    }

    protected async invitationAccepted(client: Client, creator_id: string) {
    }

    protected async invitationRejected(client: Client, creator_id: string) {
    }
}
