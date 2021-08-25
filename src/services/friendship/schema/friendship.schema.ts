import {Schema} from 'mongoose';

export interface Friendship {
    sender: string;
    receiver: string;
    isApproved: boolean;
}

const friendshipSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, required: true},
    receiver: {type: Schema.Types.ObjectId, required: true},
    isApproved: {type: Schema.Types.Boolean, required: true, default: false},
});

export default friendshipSchema;
