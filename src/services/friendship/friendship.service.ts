import {Model, Mongoose} from 'mongoose';
import friendshipSchema, {Friendship} from './schema/friendship.schema';
import {CreateFriendshipModel} from './models/create.friendship.model';
import {ApproveFriendshipModel} from './models/approve.friendship.model';
import {DeleteFriendshipModel} from './models/delete.friendship.model';

export class FriendshipService {
    protected model: Model<Friendship>;

    constructor(protected db: Mongoose) {
        this.model = this.db.model<Friendship>('Friendship', friendshipSchema);
    }

    public async findBySenderOrReceiver(sender: string, receiver: string) {
        return this.model.findOne({
            $or: [
                {sender},
                {receiver},
            ],
        });
    }

    public async getFriendsIdListOfUser(id: string) {
        const friendshipList = await this.model.find({
            isApproved: true,
            $or: [
                {sender: id},
                {receiver: id},
            ],
        });

        return friendshipList.reduce((acc, item) => {
            if (item.sender.toString() !== id) {
                acc.push(item.sender.toString());
            }
            if (item.receiver.toString() !== id) {
                acc.push(item.receiver.toString());
            }
            return acc;
        }, []);
    }

    public async getFriendsRequestsIdListOfUser(receiver: string) {
        const requestsList = await this.model.find({
            receiver,
            isApproved: false,
        });

        return requestsList.reduce((acc, item) => {
            if (item.sender.toString() !== receiver) {
                acc.push(item.sender.toString());
            }
            if (item.receiver.toString() !== receiver) {
                acc.push(item.receiver.toString());
            }
            return acc;
        }, []);
    }

    public async createFriendship(model: CreateFriendshipModel) {
        return this.model.create({...model, isApproved: false});
    }

    public async approveFriendship(model: ApproveFriendshipModel) {
        return this.model.updateOne({
            sender: model.sender,
            receiver: model.receiver,
        }, {$set: {isApproved: true}});
    }

    public async deleteFriendship(model: DeleteFriendshipModel) {
        const {sender, receiver} = model;

        return this.model.deleteOne({
            $or: [
                {
                    $and: [
                        {sender: sender},
                        {receiver: receiver},
                    ],
                },
                {
                    $and: [
                        {sender: receiver},
                        {receiver: sender},
                    ],
                },
            ],
        });
    }

    public async isUserFriendWith(user: string, friend: string) {
        const list = await this.getFriendsIdListOfUser(user);

        return list.includes(friend);
    }
}
