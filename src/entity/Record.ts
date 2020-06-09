

export default class Record{
    constructor(
        private type     : string,
        private mimeType : string,
        private blob     : Blob,
        private url      : string
    ){

    }
    revokeObjectURL(){
        if(!this.url){
            console.warn('Record::url not found.');
            return;
        }
        window.URL.revokeObjectURL(this.url);
    }

    // TODO add getter and setter
}