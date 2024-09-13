import { IsNotEmpty, IsString, IsUrl, IsDate } from "class-validator";

export class AerolineaDto {
   @IsString()
   @IsNotEmpty()
   readonly nombre: string;

   @IsString()
   @IsNotEmpty()
   readonly descripcion: string;

   @IsDate()
   @IsNotEmpty()
   readonly fechaFundacion: Date;

   @IsUrl()
   @IsNotEmpty()
   readonly paginaWeb: string;
}