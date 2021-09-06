import {Client, Room} from 'colyseus';
import {SocialColyseusApp} from '../app';
import {User} from '../services/user/schema/user.schema';
import authenticate from '../services/auth/authenticate';
import {Schema, type} from '@colyseus/schema';

class LastMessageState extends Schema {
    @type('string') userName: string;
    @type('string') date: string;
}

class State extends Schema {
    @type([LastMessageState]) lastMessages: LastMessageState[];
}

interface Options {
    app: SocialColyseusApp;
    participants: string[];
}

export class ChatRoom extends Room<State> {
    protected app: SocialColyseusApp;
    protected participants: string[] = [];
    autoDispose = true;

    onCreate(options: Options): void | Promise<any> {
        if (!options.app || (options.app && !(options.app instanceof SocialColyseusApp))) {
            throw new Error('app_not_found');
        }
        this.app = options.app;
        this.participants = options.participants;
        const state = new State();
        state.lastMessages = [];
        this.setState(state);
        this.onMessage('sendMessage', (client, payload) => this.onChatMessage(client, payload));
    }

    onChatMessage(client: Client, payload: { message: string }) {
        const threshold = +process.env.CHAT_THRESHOLD;
        const userDate = this.state.lastMessages.find(t => t.userName === client.userData.userName)?.date ?? new Date().toJSON();
        let nextDate = new Date(userDate);
        nextDate.setSeconds(nextDate.getSeconds() + threshold);
        if (nextDate > new Date()) return;

        let message = payload.message;
        message = message.trim();
        if (message.length < 2) return;

        this.broadcast('onChatMessage', {
            sender: client.userData.userName,
            sent_at: new Date().toJSON(),
            message,
        });

        this.putLastMessage(client.userData.userName);
    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        this.putLastMessage(client.userData.userName);
    }

    protected putLastMessage(userName: string) {
        const lastMessage = new LastMessageState();
        lastMessage.userName = userName;
        lastMessage.date = new Date().toJSON();
        this.state.lastMessages = [...this.state.lastMessages.filter(t => t.userName !== userName), lastMessage];
    }

    async onAuth(client: Client, options: { token: string }): Promise<User> {
        const user = await authenticate(this.app, options);
        const chatRoom = await this.app.chatRoomService.findRoomByRoomId(this.roomId);
        if (!chatRoom) {
            throw new Error('not_authorized');
        }
        client.userData = user;
        this.participants = chatRoom.participants;
        if (!this.participants.includes(user.userName)) {
            throw new Error('not_authorized');
        }

        return user;
    }
}
