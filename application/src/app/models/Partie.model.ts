import { User } from './User.model';

export class Partie {
  public id: string;
  public admin: User;
  public users: User[];
  public messages: any[];
  public limit: number;
  public etat: number;
  public created_at: Date;
  public updated_at: Date;
  constructor() { }
}