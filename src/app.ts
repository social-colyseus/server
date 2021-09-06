import {Mongoose} from 'mongoose';
import mongoose from 'mongoose';
import {HttpHandler} from './http/http.handler';
import {Room, Server} from 'colyseus';
import {SocialRoom} from './rooms/social.room';
import {matchMaker} from 'colyseus';
import {UserService} from './services/user/user.service';
import {AuthService} from './services/auth/auth.service';
import {FriendshipService} from './services/friendship/friendship.service';
import {Type} from '@colyseus/core/build/types';
import {InvitationService} from './services/invitation/invitation.service';
import {ChatRoomService} from './services/chat-room/chat-room.service';
import {ChatRoom} from './rooms/chat.room';

export interface DatabaseOptions {
    host: string;
    port: string;
    user: string;
    pass: string;
    name: string;
}

export interface AppOptions {
    database: DatabaseOptions;
}

export class SocialColyseusApp {
    public userService: UserService;
    public authService: AuthService;
    public friendshipService: FriendshipService;
    public invitationService: InvitationService;
    public chatRoomService: ChatRoomService;

    protected db: Mongoose;

    constructor(
        public server: Server,
        protected options: AppOptions,
    ) {
        this.connectDatabase().then(database => {
            this.db = database;
            this.prepareServices();
            this.server.define('social', SocialRoom);
            this.server.define('chatRoom', ChatRoom, {app: this, participants: []});
            matchMaker.createRoom('social', {
                secret: process.env.APP_SECRET,
                app: this,
            }).finally();
        }).catch(err => console.error({err}));
    }

    public defineRoom<T extends Type<Room>>(name: string, handler: T) {
        return this.server.define(name, handler, {
            app: this,
        });
    }

    public httpHandler(optionalGuestPaths?: string[]) {
        return HttpHandler(this, optionalGuestPaths);
    }

    protected connectDatabase() {
        const {host, port, name, user, pass} = this.options.database;
        return new Promise<Mongoose>((resolve, reject) => {
            const connectionString = `mongodb://${host}:${port}/${name}`;
            mongoose.connect(connectionString, {
                user,
                pass,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }).then(database => {
                resolve(database);
            }).catch(err => {
                reject(err);
            });
        });
    }

    protected prepareServices() {
        this.userService = new UserService(this.db);
        this.authService = new AuthService(this.db);
        this.friendshipService = new FriendshipService(this.db);
        this.invitationService = new InvitationService(this.db);
        this.chatRoomService = new ChatRoomService(this.db, this.userService);
    }
}
