
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class AerolineaService {
   constructor(
       @InjectRepository(AerolineaEntity)
       private readonly aerolineaRepository: Repository<AerolineaEntity>
   ){}

   async findAll(): Promise<AerolineaEntity[]> {
       return await this.aerolineaRepository.find({ relations: ["aeropuertos"] });
   }

   async findOne(id: string): Promise<AerolineaEntity> {
       const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id}, relations: ["aeropuertos"] });
       if (!aerolinea)
         throw new BusinessLogicException("La aerolínea con el id dado no fue encontrada", BusinessError.NOT_FOUND);
       return aerolinea;
   }
  
   async create(aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
       if (new Date(aerolinea.fechaFundacion) > new Date())
         throw new BusinessLogicException("La fecha de fundación debe ser en el pasado", BusinessError.PRECONDITION_FAILED);
       return await this.aerolineaRepository.save(aerolinea);
   }

   async update(id: string, aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
       const persistedAerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where:{id}});
       if (!persistedAerolinea)
         throw new BusinessLogicException("La aerolínea con el id dado no fue encontrada", BusinessError.NOT_FOUND);
       if (new Date(aerolinea.fechaFundacion) > new Date())
         throw new BusinessLogicException("La fecha de fundación debe ser en el pasado", BusinessError.PRECONDITION_FAILED);
       aerolinea.id = id; 
       return await this.aerolineaRepository.save(aerolinea);
   }

   async delete(id: string) {
       const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where:{id}});
       if (!aerolinea)
         throw new BusinessLogicException("La aerolínea con el id dado no fue encontrada", BusinessError.NOT_FOUND);
       await this.aerolineaRepository.remove(aerolinea);
   }
}