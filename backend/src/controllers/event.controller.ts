import { Request, Response } from "express";
import * as eventService from "../services/event.service";

export const createEvent = async (req: Request, res: Response) => {
	const event = await eventService.createEvent(req.body, req.user.id);
	res.json({ success: true, data: event });
};

export const getEvents = async (_: Request, res: Response) => {
	const events = await eventService.getAllEvents();
	res.json({ success: true, data: events });
};
