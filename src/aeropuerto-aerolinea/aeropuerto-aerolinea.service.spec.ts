import { Test, TestingModule } from '@nestjs/testing';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { Repository } from 'typeorm';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AeropuertoAerolineaService } from './aeropuerto-aerolinea.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('AeropuertoAerolineaService', () => {
  let service: AeropuertoAerolineaService;
  let aeropuertoRepository: Repository<AeropuertoEntity>;
  let aerolineaRepository: Repository<AerolineaEntity>;
  let aeropuerto: AeropuertoEntity;
  let aerolineasList : AerolineaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoAerolineaService],
    }).compile();

    service = module.get<AeropuertoAerolineaService>(AeropuertoAerolineaService);
    aeropuertoRepository = module.get<Repository<AeropuertoEntity>>(getRepositoryToken(AeropuertoEntity));
    aerolineaRepository = module.get<Repository<AerolineaEntity>>(getRepositoryToken(AerolineaEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    aerolineaRepository.clear();
    aeropuertoRepository.clear();

    aerolineasList = [];
    for(let i = 0; i < 5; i++){
        const aerolinea: AerolineaEntity = await aerolineaRepository.save({
          nombre: faker.company.name(),
          descripcion: faker.lorem.sentence(),
          fechaFundacion: faker.date.past(),
          paginaWeb: faker.internet.url()
        })
        aerolineasList.push(aerolinea);
    }

    aeropuerto = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city(),
      aerolineas: aerolineasList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addAirportToAirline should add an airport to an airline', async () => {
    const newAerolinea: AerolineaEntity = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.past(),
      paginaWeb: faker.internet.url()
    });

    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city()
    })

    const result: AerolineaEntity = await service.addAirportToAirline(newAerolinea.id, newAeropuerto.id);
    
    expect(result.aeropuertos.length).toBe(1);
    expect(result.aeropuertos[0]).not.toBeNull();
    expect(result.aeropuertos[0].nombre).toBe(newAeropuerto.nombre)
    expect(result.aeropuertos[0].codigo).toBe(newAeropuerto.codigo)
    expect(result.aeropuertos[0].pais).toBe(newAeropuerto.pais)
    expect(result.aeropuertos[0].ciudad).toBe(newAeropuerto.ciudad)
  });

  it('addAirportToAirline should throw an exception for an invalid airport', async () => {
    const newAerolinea: AerolineaEntity = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.past(),
      paginaWeb: faker.internet.url()
    })

    await expect(() => service.addAirportToAirline(newAerolinea.id, "0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado");
  });

  it('addAirportToAirline should throw an exception for an invalid airline', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city()
    });

    await expect(() => service.addAirportToAirline("0", newAeropuerto.id)).rejects.toHaveProperty("message", "La aerolínea con el id dado no fue encontrada");
  });

  it('findAirportsFromAirline should return airports by airline', async () => {
    const airports: AeropuertoEntity[] = await service.findAirportsFromAirline(aerolineasList[0].id);
    expect(airports.length).toBe(1)
  });

  it('findAirportsFromAirline should throw an exception for an invalid airline', async () => {
    await expect(()=> service.findAirportsFromAirline("0")).rejects.toHaveProperty("message", "La aerolínea con el id dado no fue encontrada"); 
  });

  it('findAirportFromAirline should return airport by airline', async () => {
    const storedAeropuerto: AeropuertoEntity = await service.findAirportFromAirline(aerolineasList[0].id, aeropuerto.id)
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toBe(aeropuerto.nombre);
    expect(storedAeropuerto.codigo).toBe(aeropuerto.codigo);
    expect(storedAeropuerto.pais).toBe(aeropuerto.pais);
    expect(storedAeropuerto.ciudad).toBe(aeropuerto.ciudad);
  });

  it('findAirportFromAirline should throw an exception for an invalid airport', async () => {
    await expect(()=> service.findAirportFromAirline(aerolineasList[0].id, "0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado"); 
  });

  it('findAirportFromAirline should throw an exception for an invalid airline', async () => {
    await expect(()=> service.findAirportFromAirline("0", aeropuerto.id)).rejects.toHaveProperty("message", "La aerolínea con el id dado no fue encontrada"); 
  });

  it('findAirportFromAirline should throw an exception for an airport not associated to the airline', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city()
    });

    await expect(()=> service.findAirportFromAirline(aerolineasList[0].id, newAeropuerto.id)).rejects.toHaveProperty("message", "El aeropuerto con el id dado no está asociado a la aerolínea"); 
  });

  it('updateAirportsFromAirline should update airports list for an airline', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city()
    });

    const updatedAerolinea: AerolineaEntity = await service.updateAirportsFromAirline(aerolineasList[0].id, [newAeropuerto]);
    expect(updatedAerolinea.aeropuertos.length).toBe(1);

    expect(updatedAerolinea.aeropuertos[0].nombre).toBe(newAeropuerto.nombre);
    expect(updatedAerolinea.aeropuertos[0].codigo).toBe(newAeropuerto.codigo);
    expect(updatedAerolinea.aeropuertos[0].pais).toBe(newAeropuerto.pais);
    expect(updatedAerolinea.aeropuertos[0].ciudad).toBe(newAeropuerto.ciudad);
  });

  it('updateAirportsFromAirline should throw an exception for an invalid airline', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city()
    });

    await expect(()=> service.updateAirportsFromAirline("0", [newAeropuerto])).rejects.toHaveProperty("message", "La aerolínea con el id dado no fue encontrada"); 
  });

  it('updateAirportsFromAirline should throw an exception for an invalid airport', async () => {
    const newAeropuerto: AeropuertoEntity = aeropuerto;
    newAeropuerto.id = "0";

    await expect(()=> service.updateAirportsFromAirline(aerolineasList[0].id, [newAeropuerto])).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado"); 
  });

  it('deleteAirportFromAirline should remove an airport from an airline', async () => {
    await service.deleteAirportFromAirline(aerolineasList[0].id, aeropuerto.id);

    const storedAerolinea: AerolineaEntity = await aerolineaRepository.findOne({where: {id: aerolineasList[0].id}, relations: ["aeropuertos"]});
    const deletedAeropuerto: AeropuertoEntity = storedAerolinea.aeropuertos.find(a => a.id === aeropuerto.id);

    expect(deletedAeropuerto).toBeUndefined();
  });

  it('deleteAirportFromAirline should throw an exception for an invalid airport', async () => {
    await expect(()=> service.deleteAirportFromAirline(aerolineasList[0].id, "0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado"); 
  });

  it('deleteAirportFromAirline should throw an exception for an invalid airline', async () => {
    await expect(()=> service.deleteAirportFromAirline("0", aeropuerto.id)).rejects.toHaveProperty("message", "La aerolínea con el id dado no fue encontrada"); 
  });

  it('deleteAirportFromAirline should throw an exception for a non-associated airport', async () => {
    const newAeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alphanumeric(3).toUpperCase(),
      pais: faker.location.country(),
      ciudad: faker.location.city()
    });

    await expect(()=> service.deleteAirportFromAirline(aerolineasList[0].id, newAeropuerto.id)).rejects.toHaveProperty("message", "El aeropuerto con el id dado no está asociado a la aerolínea"); 
  }); 
});