import {IDatabase, IS3} from '../src/database/interfaces';
import { IConfig } from './config';

declare global {
    var db: IDatabase;
    var s3: IS3;
    var config: IConfig;
};