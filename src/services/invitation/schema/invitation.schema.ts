import {Schema} from 'mongoose';

export interface Invitation {
    _id?: string;
    inviterId: string;
    invitedId: string;
    inviterUserName: string;
    invitedUserName: string;
    roomId: string;
    expiresAt: Date | number;
}

const invitationSchema = new Schema({
    inviterId: {type: Schema.Types.ObjectId, required: true},
    invitedId: {type: Schema.Types.ObjectId, required: true},
    inviterUserName: {type: Schema.Types.String, required: true},
    invitedUserName: {type: Schema.Types.String, required: true},
    roomId: {type: Schema.Types.String, required: true},
    expiresAt: {type: Schema.Types.Date, required: true},
});

export default invitationSchema;
