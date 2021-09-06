import {EventEmitter} from 'events';
import {Client} from 'colyseus';
import {SocialColyseusApp} from '../app';

export class SocialRoomEvents {
    public getClients: () => Client[] = () => [];
    public readonly emitter = new EventEmitter();
    protected readonly app: SocialColyseusApp;

    constructor(app: SocialColyseusApp) {
        this.app = app;
        this.emitter.addListener('getMe', (client: Client) => this.getMe(client));

        this.emitter.addListener('onPlayerJoin', (client: Client) => this.onPlayerJoin(client));
        this.emitter.addListener('onPlayerLeave', (client: Client) => this.onPlayerLeave(client));

        this.emitter.addListener('listOnlineFriends', (client: Client) => this.listOnlineFriends(client));

        this.emitter.addListener('addFriend', (client: Client, userName: string) => this.addFriend(client, userName));

        this.emitter.addListener('approveFriendship', (client: Client, userName: string) => this.approveFriendship(client, userName));
        this.emitter.addListener('rejectFriendship', (client: Client, userName: string) => this.rejectFriendship(client, userName));

        this.emitter.addListener('removeFriend', (client: Client, userName: string) => this.removeFriend(client, userName));

        this.emitter.addListener('listFriends', (client: Client) => this.listFriends(client));
        this.emitter.addListener('listFriendshipRequests', (client: Client) => this.listFriendshipRequests(client));

        this.emitter.addListener('listInvitations', (client: Client) => this.listInvitations(client));
        this.emitter.addListener('inviteFriendToRoom', (client: Client, userName: string, room_id: string) => this.inviteFriendToRoom(client, userName, room_id));
        this.emitter.addListener('acceptInvitation', (client: Client, invitation_id: string) => this.acceptInvitation(client, invitation_id));
        this.emitter.addListener('rejectInvitation', (client: Client, invitation_id: string) => this.rejectInvitation(client, invitation_id));

        this.emitter.addListener('listChatRooms', (client: Client) => this.listChatRooms(client));
        this.emitter.addListener('createChatRoom', (client: Client, target: string) => this.createChatRoom(client, target));
    }

    protected async getMe(client: Client) {
        client.send('me', {...client.userData, password: undefined});
    }

    protected async onPlayerJoin(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const onlineFriends = this.getClients().filter(t => friendsIdList.includes(t.userData._id.toString()));

            for (const friend of onlineFriends) {
                friend.send('onFriendOnline', {userName: client.userData.userName});
            }
        } catch (_) {
        }
    }

    protected async onPlayerLeave(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const onlineFriends = this.getClients().filter(t => friendsIdList.includes(t.userData._id.toString()));

            for (const friend of onlineFriends) {
                friend.send('onFriendOffline', {userName: client.userData.userName});
            }
        } catch (_) {

        }
    }

    protected async listOnlineFriends(client: Client) {
        try {
            const friendsIdList = await this.app.friendshipService.getFriendsIdListOfUser(client.userData._id.toString());
            const onlineClientsList = this.getClients().filter(client => friendsIdList.includes(client.userData._id.toString()));
            client.send('onOnlineFriends', {friends: onlineClientsList.map(client => client.userData)});
        } catch (_) {
            client.send('failure', {eventType: 'listOnlineFriends'});
        }
    }

    protected async addFriend(client: Client, userName: string) {
        try {
            const user = await this.app.userService.findByUserName(userName);
            if (!user) {
                throw new Error('no_user');
            }
            await this.app.friendshipService.createFriendship({
                sender: client.userData._id.toString(),
                receiver: user._id.toString(),
            });
            const friendClient = this.getClients().find(t => t.userData._id.toString() === user._id.toString());
            this.emitter.emit('listFriendshipRequests', friendClient);
            client.send('onFriendshipRequestSent', {receiver: userName});
        } catch (_) {
            client.send('failure', {eventType: 'addFriend'});
        }
    }

    protected async approveFriendship(client: Client, userName: string) {
        try {
            const user = await this.app.userService.findByUserName(userName);
            if (!user) {
                throw new Error('no_user');
            }
            await this.app.friendshipService.approveFriendship({
                sender: user._id.toString(),
                receiver: client.userData._id.toString(),
            });
            const friend = this.getClients().find(t => t.userData._id.toString() === user._id.toString());
            if (friend) {
                this.emitter.emit('listFriends', friend);
                this.emitter.emit('listOnlineFriends', friend);
            }
            this.emitter.emit('listFriends', client);
            this.emitter.emit('listFriendshipRequests', client);
            this.emitter.emit('listOnlineFriends', client);
        } catch (_) {
            client.send('failure', {eventType: 'approveFriendship'});
        }
    }

    protected async rejectFriendship(client: Client, userName: string) {
        try {
            const user = await this.app.userService.findByUserName(userName);
            if (!user) {
                throw new Error('no_user');
            }
            await this.app.friendshipService.deleteFriendship({
                receiver: client.userData._id.toString(),
                sender: user._id.toString(),
            });
            this.emitter.emit('listFriendshipRequests', client);
        } catch (_) {
            client.send('failure', {eventType: 'rejectFriendship'});
        }
    }

    protected async removeFriend(client: Client, userName: string) {
        try {
            const user = await this.app.userService.findByUserName(userName);
            if (!user) {
                throw new Error('no_user');
            }
            await this.app.friendshipService.deleteFriendship({
                receiver: client.userData._id.toString(),
                sender: user._id.toString(),
            });
            const friend = this.getClients().find(t => t.userData.userName === userName);
            if (friend) {
                this.emitter.emit('listFriends', friend);
            }
            this.emitter.emit('listFriends', client);
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
            console.log({_});
            client.send('failure', {eventType: 'listFriends'});
        }
    }

    protected async listFriendshipRequests(client: Client) {
        try {
            const requestsIdList = await this.app.friendshipService.getFriendsRequestsIdListOfUser(client.userData._id.toString());
            const userList = await this.app.userService.findUsersByIdList(requestsIdList);
            client.send('onListFriendshipRequests', {userNames: userList.map(user => user.userName)});
        } catch (_) {
            client.send('failure', {eventType: 'listFriendshipRequests'});
        }
    }

    protected async listInvitations(client: Client) {
        try {
            const invitations = await this.app.invitationService.getInvitationsByInvitedId(client.userData._id.toString());
            client.send('onListInvitations', {invitations});
        } catch (_) {
            client.send('failure', {eventType: 'listInvitations'});
        }
    }

    protected async inviteFriendToRoom(client: Client, userName: string, room_id: string) {
        try {
            const user = await this.app.userService.findByUserName(userName);
            if (!user) {
                throw new Error('no_user');
            }
            const friend = this.getClients().find(t => t.userData.userName === userName);
            if (friend === null) {
                throw new Error('not_online');
            }
            const invitation = await this.app.invitationService.invite({
                inviterId: client.userData._id.toString(),
                invitedId: friend.userData._id.toString(),
                roomId: room_id,
            });
            if (!invitation) {
                throw new Error('invitation_not_created');
            }
            client.send('onInvitationSent', {userName, room_id});
            this.emitter.emit('listInvitations', friend);
        } catch (_) {
            client.send('failure', {eventType: 'inviteFriendToRoom'});
        }
    }

    protected async acceptInvitation(client: Client, invitation_id: string) {
        try {
            const invitation = await this.app.invitationService.getInvitationById(invitation_id);
            if (!invitation) {
                throw new Error('no_invitation');
            }
            const room_id = await this.app.invitationService.acceptInvite(invitation_id);
            if (!room_id) {
                throw new Error('invitation_couldnt_accepted');
            }
            client.send('onInvitationAccepted', {room_id});
            this.emitter.emit('listInvitations', client);
        } catch (_) {
            client.send('failure', {eventType: 'acceptInvitation'});
        }
    }

    protected async rejectInvitation(client: Client, invitation_id: string) {
        try {
            const invitation = await this.app.invitationService.getInvitationById(invitation_id);
            if (!invitation) {
                throw new Error('no_invitation');
            }
            await this.app.invitationService.deleteInvite({invitationId: invitation_id});
            this.emitter.emit('listInvitations', client);
        } catch (_) {
            client.send('failure', {eventType: 'rejectInvitation'});
        }
    }

    protected async listChatRooms(client: Client) {
        try {
            const rooms = await this.app.chatRoomService.findRoomsByUserName(client.userData.userName);
            client.send('onListChatRooms', {
                rooms: rooms.map(room => ({
                    roomId: room.roomId,
                    participants: room.participants,
                })),
            });
        } catch (_) {
            client.send('failure', {eventType: 'listChatRooms'});
        }
    }

    protected async createChatRoom(client: Client, target: string) {
        try {
            const friend = this.getClients().find(t => t.userData.userName === target);
            if (!friend) {
                throw new Error('user_not_online');
            }
            const participants = [client.userData.userName, target];
            const room = await this.app.chatRoomService.findRoom(participants);
            client.send('onChatRoom', {roomId: room, participants});
            friend.send('onChatRoom', {roomId: room, participants});
        } catch (_) {
            client.send('failure', {eventType: 'createChatRoom'});
        }
    }
}
