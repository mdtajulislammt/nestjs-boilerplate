import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import appConfig from '../../../config/app.config';
import { UserRepository } from '../../../common/repository/user/user.repository';
import { Role } from '../../../common/guard/role/role.enum';
import { TimeAgeHelper } from 'src/common/helper/getTimeAge.helper';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(user_id: string) {
    try {
      const where_condition = {};
      const userDetails = await UserRepository.getUserDetails(user_id);
  
      if (userDetails.type == Role.ADMIN) {
        where_condition['OR'] = [
          { receiver_id: { equals: user_id } },
          { receiver_id: { equals: null } },
        ];
      } else {
        where_condition['receiver_id'] = user_id;
      }
  
      const notifications = await this.prisma.notification.findMany({
        where: {
          ...where_condition,
          deleted_at: null,
        },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          sender_id: true,
          receiver_id: true,
          entity_id: true,
          created_at: true,
          read_at: true,
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          notification_event: {
            select: {
              id: true,
              type: true,
              text: true,
            },
          },
        },
      });
  
      // Add avatar URL
      notifications.forEach((notification) => {
        if (notification.sender?.avatar) {
          notification.sender['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + notification.sender.avatar,
          );
        }
        if (notification.receiver?.avatar) {
          notification.receiver['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + notification.receiver.avatar,
          );
        }
      });
  
      // Group notifications
      const grouped = { today: [], yesterday: [], older: [] };
      const now = new Date();
      const todayStr = now.toDateString();
      const yesterdayStr = new Date(now.setDate(now.getDate() - 1)).toDateString();
  
      notifications.forEach((n) => {
        const notifDate = new Date(n.created_at).toDateString();
  
        const notifData = {
          id: n.id,
          title: n.notification_event?.type || 'Notification',
          message: n.notification_event?.text || '',
          time_ago: TimeAgeHelper.getTimeAgo(n.created_at),
          read: !!n.read_at,
          sender: n.sender,
          receiver: n.receiver,
        };
  
        if (notifDate === todayStr) grouped.today.push(notifData);
        else if (notifDate === yesterdayStr) grouped.yesterday.push(notifData);
        else grouped.older.push(notifData);
      });
  
      return {
        success: true,
        data: grouped,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
  

  

  async remove(id: string, user_id: string) {
    try {
      // check if notification exists
      const notification = await this.prisma.notification.findUnique({
        where: {
          id: id,
          // receiver_id: user_id,
        },
      });

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found',
        };
      }

      await this.prisma.notification.delete({
        where: {
          id: id,
        },
      });

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async removeAll(user_id: string) {
    try {
      // check if notification exists
      const notifications = await this.prisma.notification.findMany({
        where: {
          OR: [{ receiver_id: user_id }, { receiver_id: null }],
        },
      });

      if (notifications.length == 0) {
        return {
          success: false,
          message: 'Notification not found',
        };
      }

      await this.prisma.notification.deleteMany({
        where: {
          OR: [{ receiver_id: user_id }, { receiver_id: null }],
        },
      });

      return {
        success: true,
        message: 'All notifications deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // update notification settings
  async updateNotificationSettingsById(
    userId: string,
    settings: {
      push_notifications?: boolean;
      email_notifications?: boolean;
      voting_notifications?: boolean;
      general_alerts?: boolean;
    },
  ) {
    try {
      
      const updateData: any = {};

      if (settings.push_notifications !== undefined) {
        updateData.push_notifications = settings.push_notifications;
      }
      if (settings.email_notifications !== undefined) {
        updateData.email_notifications = settings.email_notifications;
      }
      if (settings.voting_notifications !== undefined) {
        updateData.voting_notifications = settings.voting_notifications;
      }
      if (settings.general_alerts !== undefined) {
        updateData.general_alerts = settings.general_alerts;
      }

      
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData, 
      });

      return {
        success: true,
        message: 'Notification settings updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update notification settings',
      };
    }
  }

  
}
