import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Utilisateur déjà existant');
    }

    const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
      },
    });

    const token = this.generateToken(user.id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const token = this.generateToken(user.id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async sendOtp(dto: SendOtpDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
      },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    const code = this.generateOtpCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.prisma.otpCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    if (dto.email) {
      console.log(`Envoi OTP par email à ${dto.email}: ${code}`);
    } else if (dto.phone) {
      console.log(`Envoi OTP par SMS à ${dto.phone}: ${code}`);
    }

    return {
      message: 'Code OTP envoyé avec succès',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
      },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    const otpCode = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpCode) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    await this.prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { isUsed: true },
    });

    const token = this.generateToken(user.id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  private generateToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
