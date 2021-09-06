import {Schema} from 'mongoose';

export interface ChatRoom {
    _id?: string;
    roomId: string;
    participants: string[];
}

const chatRoomSchema = new Schema({
    roomId: {type: Schema.Types.String, required: true},
    participants: {type: Schema.Types.Array, subtype: Schema.Types.String, required: true},
});

export default chatRoomSchema;
