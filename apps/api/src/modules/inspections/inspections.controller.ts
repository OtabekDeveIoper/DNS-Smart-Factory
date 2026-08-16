import { Controller, Get, Param } from '@nestjs/common';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get('targets')
  public findTargets() {
    return this.inspectionsService.findTargets();
  }

  @Get('unit/:serialNo')
  public findUnitHistory(@Param('serialNo') serialNo: string) {
    return this.inspectionsService.findUnitHistory(serialNo);
  }
}
