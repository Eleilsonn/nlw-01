import knex from '../database/connection';
import { Request, Response } from 'express';


export default class PointsController {
    async show(request: Request, response: Response) {

        const { id } = request.params;

        await knex.transaction(async trx => {
            //buscando point
            let point = await trx('points')
                .where('id', id)
                .first();

            //buscando itens de point
            const items = await trx('items')
                .join('point_items', 'items.id', '=', 'point_items.item_id')
                .where('point_items.point_id', id)
                .select('items.title');

            point = { ...point, items };

            return point;
        })
            .then(point => {
                point.image = `http://192.168.10.10:3333/uploads/${point.image}`;
                return response.json(point);
            }).catch(e => {
                return response.status(400).json(e);
            })
    }
    async create(request: Request, response: Response) {

        try {
            const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;
            const point = { image: request.file.filename, name, email, whatsapp, latitude, longitude, city, uf };
            
            const trx = await knex.transaction();

            const [point_id] = await trx('points')
                .insert(point);

            const pointItems = await items.split(',').map((item: number) => {
                return {
                    item_id: item,
                    point_id
                }
            })

            await trx('point_items')
                .insert(pointItems)

            await trx.commit();

            point.image = `http://192.168.10.10:3333/uploads/${point.image}`;
            return response.json(point);
        } catch (error) {
            return response.status(400).json(error);
        }

    }

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        await points.map(point => {
            point.image = `http://192.168.10.10:3333/uploads/${point.image}`;
            return point;
        })
        return response.json(points);
    }
}