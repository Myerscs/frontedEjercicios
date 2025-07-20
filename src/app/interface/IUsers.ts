export interface IUserLogin {
    user: any;
    dataUser: DataUser;
    token:    string;
}

export interface DataUser {
    id:           number;
    name:         string;
    email:        string;
    typeusers_id: number;
}