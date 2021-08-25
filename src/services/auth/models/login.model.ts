import {body} from 'express-validator';

export type LoginModel = {
    userName: string;
    password: string;
}

export const LoginValidator = () => [
    body('userName')
        .exists().bail(),
    body('password')
        .exists().bail(),
];
