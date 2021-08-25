import {Model, Mongoose} from 'mongoose';
import invitationSchema, {Invitation} from './schema/invitation.schema';
import {CreateInvitationModel} from './models/create.invitation.model';
import {DeleteInvitationModel} from './models/delete.invitation.model';

export class InvitationService {
    protected model: Model<Invitation>;

    constructor(protected db: Mongoose) {
        this.model = this.db.model<Invitation>('Invitation', invitationSchema);
    }

    public async getInvitationById(id: string) {
        const invitation = await this.model.findOne({_id: id});

        return {...invitation.toObject()};
    }

    public async getInvitationsByInvitedId(id: string) {
        const invitationList = await this.model.find({invitedId: id});

        return invitationList.map(item => {
            return {...item.toObject(), roomId: undefined};
        });
    }

    public async getInvitationsByInviterId(id: string) {
        const invitationList = await this.model.find({inviterId: id});

        return invitationList.map(item => {
            return {...item.toObject()};
        });
    }

    public async invite(model: CreateInvitationModel) {
        const alreadyInvited = await this.model.findOne({...model});
        if (alreadyInvited) {
            return alreadyInvited;
        }
        const now = new Date();
        const expiresAt = new Date(now.setMinutes(now.getMinutes() + (+process.env.INVITATION_LENGTH)));

        return this.model.create({...model, expiresAt});
    }

    public async deleteInvite(model: DeleteInvitationModel) {
        return this.model.deleteOne({_id: model.invitationId});
    }

    public async acceptInvite(id: string) {
        const invitation = await this.getInvitationById(id);
        await this.deleteInvite({invitationId: id});

        return invitation.roomId;
    }
}
