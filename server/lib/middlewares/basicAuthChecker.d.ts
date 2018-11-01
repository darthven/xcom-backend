import 'reflect-metadata';
import { Action } from 'routing-controllers';
export declare const authorizationChecker: (action: Action, roles: string[]) => Promise<boolean>;
