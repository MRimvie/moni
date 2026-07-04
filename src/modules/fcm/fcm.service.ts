import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  constructor(private prisma: PrismaService) {
    // Initialiser Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async registerToken(userId: string, token: string) {
    // Vérifier si le token existe déjà
    const existingToken = await this.prisma.fcmToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      // Mettre à jour l'utilisateur si différent
      if (existingToken.userId !== userId) {
        return this.prisma.fcmToken.update({
          where: { token },
          data: { userId },
        });
      }
      return existingToken;
    }

    // Créer un nouveau token
    return this.prisma.fcmToken.create({
      data: {
        token,
        userId,
      },
    });
  }

  async unregisterToken(token: string) {
    return this.prisma.fcmToken.delete({
      where: { token },
    });
  }

  async getUserTokens(userId: string) {
    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId },
    });
    return tokens.map((t) => t.token);
  }

  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const tokens = await this.getUserTokens(userId);

    if (tokens.length === 0) {
      console.log(`Aucun token FCM pour l'utilisateur ${userId}`);
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`✅ ${response.successCount} notifications envoyées`);
      
      // Supprimer les tokens invalides
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        // Supprimer les tokens invalides de la base de données
        await this.prisma.fcmToken.deleteMany({
          where: { token: { in: failedTokens } },
        });
        console.log(`🗑️ ${failedTokens.length} tokens invalides supprimés`);
      }

      return response;
    } catch (error) {
      console.error('❌ Erreur envoi notification FCM:', error);
      throw error;
    }
  }

  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`✅ Notification envoyée au topic ${topic}:`, response);
      return response;
    } catch (error) {
      console.error('❌ Erreur envoi notification au topic:', error);
      throw error;
    }
  }
}
