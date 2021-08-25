import {Schema} from 'mongoose';

export interface User {
    _id?: string;
    userName: string;
    password: string;
    email: string;
    meta?: {
        avatarUrl?: string;
        fullName?: string;
    }
}

const userSchema = new Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    meta: {
        required: false,
        type: {
            avatarUrl: {type: String, required: false},
            fullName: {type: String, required: false},
        },
        default: null,
    },
});

export default userSchema;
