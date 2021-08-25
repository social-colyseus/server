import {Document, Model, Mongoose} from 'mongoose';
import authSchema, {Auth} from './schema/auth.schema';
import {CreateAuthModel} from './models/create.auth.model';
import jwt from 'jsonwebtoken';

export class AuthService {
    protected model: Model<Auth>;

    constructor(protected db: Mongoose) {
        this.model = this.db.model<Auth>('Auth', authSchema);
    }

    public async createAuth(model: CreateAuthModel) {
        return this.model.create(model);
    }

    public createToken(session: Document<any, any, Auth>) {
        return jwt.sign(session.toObject(), process.env.APP_SECRET, {algorithm: 'HS256'});
    }
}
