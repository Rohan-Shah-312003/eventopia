import { Request, Response } from "express";
import prisma from "../config/database";
import { Prisma } from "@prisma/client";

type EventWithParticipants = Prisma.EventGetPayload<{
	include: {
		participants_list: true;
	};
}>;

export const createEvent = async (req: Request, res: Response) => {
	try {
		const {
			name,
			type,
			event_owner_id,
			venue,
			description,
			date,
			time,
			equipments,
		} = req.body;

		const event = await prisma.event.create({
			data: {
				name,
				type,
				event_owner_id,
				venue,
				description,
				date: new Date(date),
				time,
				equipments,
				creator_id: req.user!.id,
			},
			include: {
				event_owner: {
					select: { name: true },
				},
				creator: {
					select: { name: true },
				},
			},
		});

		res.status(201).json({
			message: "Event created successfully",
			event,
		});
	} catch (error) {
		console.error("Event creation error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getEvents = async (req: Request, res: Response) => {
	try {
		const events = await prisma.event.findMany({
			include: {
				event_owner: {
					select: { name: true },
				},
				creator: {
					select: { name: true },
				},
			},
			orderBy: { date: "desc" },
		});

		res.json({ events });
	} catch (error) {
		console.error("Get events error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getEventById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const event = await prisma.event.findUnique({
			where: { id },
			include: {
				event_owner: {
					select: { name: true, type: true },
				},
				creator: {
					select: { name: true },
				},
				participants_list: {
					select: { id: true, name: true, reg_no: true },
				},
				volunteers_list: {
					select: { id: true, name: true, reg_no: true },
				},
			},
		});

		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}

		res.json({ event });
	} catch (error) {
		console.error("Get event error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const registerForEvent = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user!.id;

		// Check if event exists
		const event = await prisma.event.findUnique({
			where: { id },
			include: { participants_list: true },
		});

		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}

		// Check if already registered
		const alreadyRegistered = event.participants_list.some(
			(p) => p.id === userId
		);

  
		if (alreadyRegistered) {
			return res
				.status(400)
				.json({ error: "Already registered for this event" });
		}

		// Register user for event
		await prisma.event.update({
			where: { id },
			data: {
				participants_list: {
					connect: { id: userId },
				},
			},
		});

		res.json({ message: "Successfully registered for event" });
	} catch (error) {
		console.error("Event registration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
