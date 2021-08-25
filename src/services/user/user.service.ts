import {Model, Mongoose} from 'mongoose';
import userSchema, {User} from './schema/user.schema';
import {UserCreateModel} from './models/user.create.model';
import bcrypt from 'bcrypt';

export class UserService {
    protected model: Model<User>;

    constructor(protected db: Mongoose) {
        this.model = this.db.model<User>('User', userSchema);
    }

    public async findUserById(id: string) {
        const user = await this.model.findById(id);

        return {...user.toObject(), password: undefined};
    }

    public async findByCredentials(credentials: string) {
        return this.model.findOne({$or: [{email: credentials}, {userName: credentials}]});
    }

    public async findUsersByIdList(list: string[]) {
        const users = await this.model.find({_id: {$in: list}});

        return users.map(user => ({...user.toObject(), password: undefined}));
    }

    public async createUser(model: UserCreateModel) {
        const salt = await bcrypt.genSalt(10);
        model.password = await bcrypt.hash(model.password, salt);
        return this.model.create(model);
    }
}
