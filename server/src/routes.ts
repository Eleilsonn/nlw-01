import express, { request, response } from 'express';
import {Joi, celebrate} from 'celebrate';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';
import multer from 'multer';
import multerConfig from './config/multer';

const upload = multer(multerConfig);
const itemsController = new ItemsController();
const pointsController = new PointsController();
const routes = express.Router();

routes.get('/',(request, response)=>{
    return response.json();
})

routes.get('/items',itemsController.listItems);

routes.get('/points',pointsController.index);
routes.get('/points/:id',pointsController.show);


routes.post('/points',
upload.single('image'),
celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        items: Joi.string().required()
    })
},{abortEarly: false}),
pointsController.create);

export default routes;

