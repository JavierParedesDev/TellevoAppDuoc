export interface Viajes {
    id:number;
    destino: string;
    capacidad: number;
    costo: number;
    horaSalida: string;
    lat?: number;
    lng?: number;
}
