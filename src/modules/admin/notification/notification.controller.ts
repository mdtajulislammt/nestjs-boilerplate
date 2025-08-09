import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiBearerAuth()
@ApiTags('Notification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get all notifications' })
  @Get()
  async findAll(@Req() req: Request) {
    try {
      const user_id = req.user.userId;

      const notification = await this.notificationService.findAll(user_id);

      return notification;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Delete notification' })
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    try {
      const user_id = req.user.userId;
      const notification = await this.notificationService.remove(id, user_id);

      return notification;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Delete all notifications' })
  @Delete()
  async removeAll(@Req() req: Request) {
    try {
      const user_id = req.user.userId;
      const notification = await this.notificationService.removeAll(user_id);

      return notification;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // update notification settings
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('update-notifications')
  @ApiOperation({
    summary: 'Update notification settings for a specific user by ID',
  })
  async updateNotifications(
    @Body()
    data: {
      user_id: string;
      push_notifications?: boolean;
      email_notifications?: boolean;
      voting_notifications?: boolean;
      general_alerts?: boolean;
    },
  ) {
    const { user_id, ...settings } = data;
  
    
    const response =
      await this.notificationService.updateNotificationSettingsById(
        user_id,
        settings,
      );
  
    if (response.success) {
      
      const {
        push_notifications,
        email_notifications,
        voting_notifications,
        general_alerts,
      } = response.data;
  
      return {
        success: true,
        message: response.message,
        data: {
        push_notifications,
        email_notifications,
        voting_notifications,
        general_alerts,
        },
      };
    } else {
      return { success: false, message: response.message };
    }
  }
  
}
