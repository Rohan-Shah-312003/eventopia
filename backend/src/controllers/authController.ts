import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, reg_no, password, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { reg_no }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        reg_no,
        password: hashedPassword,
        role: role || 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        reg_no: true,
        role: true
      }
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      name: user.name,
      reg_no: user.reg_no,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { reg_no, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { reg_no }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      name: user.name,
      reg_no: user.reg_no,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        reg_no: user.reg_no,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};