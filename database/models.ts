import { client, dbname } from ".";


export async function getUser(pk: string) {
    const user = client.db(dbname).collection('user').findOne({pk: pk});
    return user;
}
