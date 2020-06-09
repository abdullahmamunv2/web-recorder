import {Record}  from './entity/index'

export default interface IRecorder{
    start() : Promise<MediaStream | undefined>;
    stop()  : void;
    isRecordingSupported() : boolean;
    getSupportedMimeTypes() : string[];
    onerror?: ((event: MediaRecorderErrorEvent) => void);
    onstop?  : ((record : Record)=>void);

}