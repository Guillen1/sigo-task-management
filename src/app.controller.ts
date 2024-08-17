import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('')
export class MainController {
    @Get()
    @ApiExcludeEndpoint()
    getRoot(): string {
      return 'Welcome to the Sigo Task Management API!';
    }
}
