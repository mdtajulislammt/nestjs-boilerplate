import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Response } from 'express';


@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({ description: 'Create a user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiResponse({ description: 'Get all users' })
  @Get()
  async findAll(
    @Query() query: { q?: string; type?: string; approved?: string },
  ) {
    try {
      const q = query.q;
      const type = query.type;
      const approved = query.approved;

      const users = await this.userService.findAll({ q, type, approved });
      return users;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // approve user
  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Approve a user' })
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    try {
      const user = await this.userService.approve(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // reject user
  @Roles(Role.ADMIN)
  @ApiResponse({ description: 'Reject a user' })
  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    try {
      const user = await this.userService.reject(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // @Roles(Role.ADMIN, Role.MANAGER)
  @ApiResponse({ description: 'Get a user by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.userService.remove(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('disable/:id')  // User ID passed as a URL parameter
  async disableAccount(@Param('id') userId: string, @Res() res: Response) { 
    try {
      // Call the service function
      const response = await this.userService.disableAccount(userId); 
  
      // Check if the response is a success
      if (response.success) {
        // Send the successful response
        return res.status(200).json(response); 
      } else {
        // Handle failure if account could not be disabled
        return res.status(400).json({
          success: false,
          message: response.message || 'Account could not be disabled.',
        });
      }
    } catch (error) {
      // Handle any internal errors
      return res.status(500).json({ 
        success: false,
        message: 'An error occurred while disabling the account.',
      });
    }
  }
  



}
