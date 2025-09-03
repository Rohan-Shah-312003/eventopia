import { Request, Response } from 'express';
import { prisma } from '../app';

export const createClub = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Create club and make the creator an admin
    const club = await prisma.club.create({
      data: {
        name,
        description,
        admins: {
          connect: { id: userId },
        },
        members: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        club,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClubs = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query;
    const where: any = {};

    if (memberId) {
      where.members = {
        some: { id: memberId as string },
      };
    }

    const clubs = await prisma.club.findMany({
      where,
      include: {
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: clubs.length,
      data: {
        clubs,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        club,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Check if user is an admin of the club
    const isAdmin = await prisma.club.findFirst({
      where: {
        id,
        admins: {
          some: { id: userId },
        },
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this club' });
    }

    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        club: updatedClub,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is an admin of the club
    const isAdmin = await prisma.club.findFirst({
      where: {
        id,
        admins: {
          some: { id: userId },
        },
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this club' });
    }

    await prisma.club.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { clubId, userId } = req.params;
    const currentUserId = req.user.id;

    // Check if current user is an admin of the club
    const isAdmin = await prisma.club.findFirst({
      where: {
        id: clubId,
        admins: {
          some: { id: currentUserId },
        },
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    // Add user to club members
    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        club,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { clubId, userId } = req.params;
    const currentUserId = req.user.id;

    // Check if current user is an admin of the club
    const isAdmin = await prisma.club.findFirst({
      where: {
        id: clubId,
        admins: {
          some: { id: currentUserId },
        },
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    // Remove user from club members
    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
      include: {
        members: true,
      },
    });

    // Also remove from admins if they were an admin
    await prisma.club.update({
      where: { id: clubId },
      data: {
        admins: {
          disconnect: { id: userId },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        club,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
