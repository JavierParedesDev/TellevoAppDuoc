import { Vehiculo } from "./vehiculo";

export interface Usuario {
    id: number;
    nombre:string;
    email: string;
    contrasena:string;
    vehiculo?: Vehiculo;
}
