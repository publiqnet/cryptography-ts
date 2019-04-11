export class UrlObject {

    id: string;
    route: string;
    link: string;

    constructor(id: string, route: string) {
        this.id = id;
        this.route = route + id;
        /*this.link = `<a class="underline-none" routerLink="${route + id}"> ${id} </a>`*/
    }
}
