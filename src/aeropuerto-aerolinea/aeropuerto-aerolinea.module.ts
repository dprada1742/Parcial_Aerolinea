import { Module } from '@nestjs/common';
import { AeropuertoAerolineaService } from './aeropuerto-aerolinea.service';
import { AeropuertoAerolineaController } from './aeropuerto-aerolinea.controller';

@Module({
  providers: [AeropuertoAerolineaService],
  controllers: [AeropuertoAerolineaController]
})
export class AeropuertoAerolineaModule {}
