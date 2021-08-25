import {EventEmitter} from 'events';
import {Client} from 'colyseus';
import {SocialColyseusApp} from '../../index';
import {User} from '../services/user/schema/user.schema';
import {Document} from 'mongoose';
import {Friendship} from '../services/friendship/schema/friendship.schema';

export class SocialRoomEvents {
    public getClients: () => Client[] = () => [];
    public readonly emitter = new EventEmitter();

    constructor(protected app: SocialColyseusApp) {
        this.emitter.addListener('getMe', this.getMe);

        this.emitter.addListener('onPlayerJoin', this.onPlayerJoin);
        this.emitter.addListener('onPlayerLeave', this.onPlayerLeave);

        this.emitter.addListener('listOnlineFriends', this.listOnlineFriends);
        this.emitter.addListener('onFriendConnected', this.onFriendConnected);
        this.emitter.addListener('onFriendDisconnected', this.onFriendDisconnected);

        this.emitter.addListener('addFriend', this.addFriend);
        this.emitter.addListener('onFriendshipRequestSent', this.onFriendshipRequestSent);

        this.emitter.addListener('approveFriendship', this.approveFriendship);
        this.emitter.addListener('rejectFriendship', this.rejectFriendship);

        this.emitter.addListener('onFriendshipRequestAccepted', this.onFriendshipRequestAccepted);
        this.emitter.addListener('onFriendshipRequestRejected', this.onFriendshipRequestRejected);

        this.emitter.addListener('removeFriend', this.removeFriend);
        this.emitter.addListener('onFriendRemoved', this.onFriendRemoved);

        this.emitter.addListener('listFriends', this.listFriends);
        this.emitter.addListener('listFriendshipRequests', this.listFriendshipRequests);

        this.emitter.addListener('inviteFriendToRoom', this.inviteFriendToRoom);
        this.emitter.addListener('invitationCreated', this.invitationCreated);
        this.emitter.addListener('invitationAccepted', this.invitationAccepted);
        this.emitter.addListener('invitationRejected', this.invitationRejected);
        this.emitter.addListener('invitationExpired', this.invitationExpired);
    }

    protected async getMe(client: Client) {
        client.send('me', {...client.userData.toObject(), password: undefined});
    }

    protected async onPlayerJoin(client: Client) {
    }

    protected async onPlayerLeave(client: Client) {
    }

    protected async listOnlineFriends(client: Client) {
    }

    protected async onFriendConnected(friend: User, client: Client) {
    }

    protected async onFriendDisconnected(friend: User, client: Client) {
    }

    protected async addFriend(client: Client, friend_id: string) {
    }

    protected async onFriendshipRequestSent(request: Document<any, any, Friendship>) {
    }

    protected async approveFriendship(client: Client, friend_id: string) {
    }

    protected async rejectFriendship(client: Client, friend_id: string) {
    }

    protected async onFriendshipRequestAccepted(request: Document<any, any, Friendship>) {
    }

    protected async onFriendshipRequestRejected(request: Document<any, any, Friendship>) {
    }

    protected async removeFriend(client: Client, friend_id: string) {
    }

    protected async onFriendRemoved(client: Client, friend_id: string) {
    }

    protected async listFriends(client: Client) {
    }

    protected async listFriendshipRequests(client: Client) {
    }

    protected async inviteFriendToRoom(client: Client, friend_id: string, roomId: string) {
    }

    protected async invitationCreated(client: Client, friend_id: string) {
    }

    protected async invitationAccepted(acceptedClient: Client, creator_id: string) {
    }

    protected async invitationRejected(rejectedClient: Client, creator_id: string) {
    }

    protected async invitationExpired(client: Client) {
    }
}
