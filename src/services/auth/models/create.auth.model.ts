import {Schema} from 'mongoose';

export type CreateAuthModel = {
    userId: Schema.Types.ObjectId;
    expiresAt: Date | number;
}
