import { Vehiculo } from "./vehiculo";

export interface Usuario {
    idUser: string;
    id: string;
    nombre:string;
    email: string;
    contrasena:string;
    vehiculo?: Vehiculo;
}
