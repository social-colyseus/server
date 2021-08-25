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
        this.onMessage('getMe', (client) => this.events.emitter.emit('getMe', [client]));
        this.onMessage('listFriends', (client) => this.events.emitter.emit('listFriends', [client]));
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
        return user;
    }
}
