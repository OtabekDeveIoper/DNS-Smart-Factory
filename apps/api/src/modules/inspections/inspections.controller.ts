import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyzeInspectionDto } from './dto/analyze-inspection.dto';
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

  @Post('analyze')
  public analyze(@Body() dto: AnalyzeInspectionDto) {
    return this.inspectionsService.analyze(dto);
  }
}
