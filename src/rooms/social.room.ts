import {Room, Client} from 'colyseus';
import {SocialColyseusApp} from '../../index';
import {User} from '../services/user/schema/user.schema';
import authenticate from '../services/auth/authenticate';
import {SocialRoomEvents} from '../events/social.room.events';

export class SocialRoom extends Room {
    protected app: SocialColyseusApp;
    protected events: SocialRoomEvents;
    autoDispose = false;

    onCreate(options: any): void | Promise<any> {
        if (!options.secret || (options.secret && options.secret !== process.env.APP_SECRET)) {
            return Promise.reject();
        }
        if (!options.app) {
            return Promise.reject();
        }
        this.app = options.app;
        this.events = new SocialRoomEvents(this.app);
        this.events.getClients = () => this.clients;

        this.onMessage('getMe', (client) => this.events.emitter.emit('getMe', client));
        this.onMessage('addFriend', (client, message) => this.events.emitter.emit('addFriend', client, message.friend_id));
        this.onMessage('approveFriendship', (client, message) => this.events.emitter.emit('approveFriendship', client, message.friend_id));
        this.onMessage('rejectFriendship', (client, message) => this.events.emitter.emit('rejectFriendship', client, message.friend_id));
        this.onMessage('removeFriend', (client, message) => this.events.emitter.emit('removeFriend', client, message.friend_id));
        this.onMessage('listFriends', (client) => this.events.emitter.emit('listFriends', client));
        this.onMessage('listOnlineFriends', (client) => this.events.emitter.emit('listOnlineFriends', client));
        this.onMessage('inviteFriendToRoom', (client, message) => this.events.emitter.emit('inviteFriendToRoom', client, message.friend_id, message.room_id));
        this.onMessage('acceptInvitation', (client, message) => this.events.emitter.emit('acceptInvitation', client, message.invitation_id));
        this.onMessage('rejectInvitation', (client, message) => this.events.emitter.emit('rejectInvitation', client, message.invitation_id));

    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        this.events.emitter.emit('onPlayerJoin', [client]);
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        this.events.emitter.emit('onPlayerLeave', [client]);
    }

    async onAuth(client: Client, options: { token: string }): Promise<User> {
        const user = await authenticate(this.app, options);
        client.userData = user;
        await this.events.emitter.emit('getMe', client);
        await this.events.emitter.emit('listFriends', client);
        await this.events.emitter.emit('listOnlineFriends', client);
        return user;
    }
}
