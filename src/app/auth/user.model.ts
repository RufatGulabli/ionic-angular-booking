export class User {
    constructor(
        public id: string,
        public email: string,
        public _token: string,
        public expireDate: Date
    ) { }

    get Token() {
        if (!this.expireDate || this.expireDate <= new Date()) {
            return null;
        }
        return this._token;
    }

    get TokenDuration() {
        if (!this.Token) {
            return 0;
        }
        return this.expireDate.getTime() - new Date().getTime();
    }

}
