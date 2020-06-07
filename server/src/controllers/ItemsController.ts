import knex from '../database/connection';
import { Request, Response } from 'express';


export default class ItemsController {
    async listItems(request: Request, response: Response) {
        const items = await knex('items').select('*');
        //serialized items
        await items.map(item => {
            item.image = `http://192.168.10.10:3333/uploads/${item.image}`;
            return item;
        })
        return response.json(items);
    }
}