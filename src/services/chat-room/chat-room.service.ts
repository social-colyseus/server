import {Model, Mongoose} from 'mongoose';
import chatRoomSchema, {ChatRoom} from './schema/chat-room.schema';
import {matchMaker} from 'colyseus';
import {UserService} from '../user/user.service';

export class ChatRoomService {
    protected model: Model<ChatRoom>;

    constructor(protected db: Mongoose, protected userService: UserService) {
        this.model = this.db.model<ChatRoom>('ChatRoom', chatRoomSchema);
        this.db.connection.collections.chatrooms.deleteMany({}).finally();
    }

    public async findRoom(participants: string[]): Promise<string> {
        const users = await this.userService.findUsersByUserNameList(participants);
        if (users.length !== participants.length) return;
        let room = await this.model.findOne({participants: {$all: participants, $size: participants.length}});
        if (!room) {
            const chatRoom = await matchMaker.createRoom('chatRoom', {participants});
            room = await this.model.create({roomId: chatRoom.roomId, participants});
        }

        return room.roomId;
    }

    public async findRoomsByUserName(userName: string) {
        return this.model.find({participants: {$all: [userName]}});
    }

    public async findRoomByRoomId(id: string) {
        return this.model.findOne({roomId: id});
    }
}
