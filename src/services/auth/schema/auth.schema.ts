import {Schema} from 'mongoose';

export interface Auth {
    userId: string;
    expiresAt: Date,
}

const authSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    expiresAt: {type: Schema.Types.Date, required: true},
});

export default authSchema;
