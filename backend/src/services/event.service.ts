import { PrismaClient } from "@prisma/client";
import { IEvent } from "../interfaces/IEvent";

const prisma = new PrismaClient();

export const createEvent = async (eventData: IEvent, userId: string) => {
	return await prisma.event.create({
		data: { ...eventData, ownerId: userId, status: "pending" },
	});
};

export const getAllEvents = async () => {
	return await prisma.event.findMany({
		where: { status: "approved" },
		include: { ownerClub: true },
	});
};
