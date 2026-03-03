import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Organizacion, { IOrganizacionModel } from '../models/Organizacion';

const createOrganizacion = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    const organizacion: IOrganizacionModel = new Organizacion({
        _id: new mongoose.Types.ObjectId(),
        name
    });

    try {
        const savedOrganizacion: IOrganizacionModel = await organizacion.save();
        return res.status(201).json(savedOrganizacion);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readOrganizacion = async (req: Request, res: Response, next: NextFunction) => {
    const organizacionId = req.params.organizacionId;

    try {
        const organizacion: IOrganizacionModel | null = await Organizacion.findById(organizacionId);
        return organizacion ? res.status(200).json(organizacion) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizaciones: IOrganizacionModel[] = await Organizacion.find().populate('usuarios');
        return res.status(200).json(organizaciones);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateOrganizacion = async (req: Request, res: Response, next: NextFunction) => {
    const organizacionId = req.params.organizacionId;

    try {
        const organizacion: IOrganizacionModel | null = await Organizacion.findById(organizacionId);
        if (organizacion) {
            organizacion.set(req.body);
            const savedOrganizacion: IOrganizacionModel = await organizacion.save();
            return res.status(201).json(savedOrganizacion);
        } else {
            return res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteOrganizacion = async (req: Request, res: Response, next: NextFunction) => {
    const organizacionId = req.params.organizacionId;

    try {
        const organizacion: IOrganizacionModel | null = await Organizacion.findByIdAndDelete(organizacionId);
        return organizacion ? res.status(201).json(organizacion) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default { createOrganizacion, readOrganizacion, readAll, updateOrganizacion, deleteOrganizacion };
