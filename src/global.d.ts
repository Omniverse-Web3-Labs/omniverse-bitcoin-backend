import {IDatabase, IS3} from '../src/database/interfaces';

declare global {
    var db: IDatabase;
    var s3: IS3;
};