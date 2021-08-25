import {body} from 'express-validator';
import {SocialColyseusApp} from '../../../index';

export type RegisterModel = {
    userName: string;
    password: string;
    email: string;
}

export const RegisterValidator = (app: SocialColyseusApp) => [
    body('email')
        .exists().bail()
        .isEmail().bail()
        .custom(async (input) => {
            const user = await app.userModel.findOne({email: input});
            if (user !== null) {
                return Promise.reject();
            }
        }).bail(),
    body('userName')
        .exists().bail()
        .isLength({min: 3, max: 32}).bail()
        .custom(async (input) => {
            const user = await app.userModel.findOne({userName: input});
            if (user !== null) {
                return Promise.reject();
            }
        }),
    body('password')
        .exists().bail()
        .isLength({min: 3, max: 32}).bail(),
];
