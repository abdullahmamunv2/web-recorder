import IRecorder from "../IRecorder";
import { Record } from "../entity/index";

export interface RecordOptions {
    audio : boolean;
    video : boolean;
    stream? : MediaStream;
    constraints? : MediaStreamConstraints
}

const MimeTypes = ['video/webm;codecs=vp9,opus',
                  'video/webm;codecs=vp8,opus',
                  'video/webm'
                ]

export   class  WebRecorder implements IRecorder{
    private isRecording: boolean;
    private options : RecordOptions;
    private recorder? : MediaRecorder;
    private recordedBlobs : Blob[] =  [];
    public onerror? : ((event: MediaRecorderErrorEvent) => void);
    public onstop?  : ((record : Record)=>void)
    constructor(options : RecordOptions){
        this.isRecording = false;
        this.options = this._validateOptions(options);
    }
    

    private _validateOptions(options : RecordOptions){
        let defaultOptions = this._getDefaultOptions();
        if(options && 'audio' in options)
            defaultOptions.audio = options.audio;
        if(options && 'video' in options)
            defaultOptions.video = options.video;
        if(options && 'stream' in options)
            defaultOptions.stream = options.stream;
        if(options && 'constraints' in options)
            defaultOptions.constraints = options.constraints;
        
        return defaultOptions;
    }
    private _getDefaultOptions() : RecordOptions{
        return {
            audio : true,
            video : true,
            constraints : {
                audio: {
                    echoCancellation: {exact: true}
                },
                video: {
                    width: 1280, height: 720
                }
            }
        }
    }
    isRecordingSupported(): boolean {
        throw new Error("Method not implemented.");
    }
    getSupportedMimeTypes(): string[] {
        return this._getSupportedMimeType();
    }
    async start(): Promise<MediaStream | undefined> {
        if(this._isRecordingInProgress()){
            throw new Error('ERR_RECORDING_IN_PROGRESS');
        }
        if(!this.isStreamAvailable()){
            this.options.stream = await this._getUserMedia();
        }
        let supportedMimeTypes = this._getSupportedMimeType();
        if(supportedMimeTypes.length==0)
            throw new Error('ERR_MIMETYPE_NOT_SUPPORTED');
        
        let mimeType = supportedMimeTypes[0];
        this.initAndStart(mimeType);

        return Promise.resolve(this.options.stream);
        
    }

    _isRecordingInProgress(){
        return this.isRecording;
    }

    stop(): void {
        console.log(this.recorder);
        if(this.recorder && this.recorder.state === 'recording'){
            this.recorder.stop();
        }
        else{
            console.warn('Recording not started yet.');
        }
        
    }

    private initAndStart(mimeType  :string){
        if(this.options.stream){
            this.recorder = new MediaRecorder(this.options.stream,{mimeType : mimeType});
            this.recorder.ondataavailable = this.handleDataAvailableEvent.bind(this);
            this.recorder.onresume        = this.handleResumeEvent.bind(this);
            this.recorder.onpause         = this.handlePauseEvent.bind(this);
            this.recorder.onerror         = this.handleErrorEvent.bind(this);
            this.recorder.onstop          = this.handleStopEvent.bind(this);
            this.recorder.start();
            this.isRecording = true;
        }
    }

    private handleErrorEvent(event:MediaRecorderErrorEvent){
        if(this.onerror)
            this.onerror(event);
        this.cleanup();
    }

    private handleStopEvent(event : Event){
        if(this.recorder){
            let blob  = new Blob(this.recordedBlobs, {type: 'video/webm'});

           let record =  new Record(
                'video/webm',
                this.recorder.mimeType,
                blob,
                window.URL.createObjectURL(blob)
            );

            if(this.onstop)
                this.onstop(record);
        }
        this.cleanup();
        
    }

    private cleanup(){
        this.isRecording = false;
        this.recordedBlobs = [];
        this.recorder = undefined;
    }

    private handlePauseEvent(event: Event){

    }

    private handleResumeEvent(event:Event){

    }

    private handleDataAvailableEvent(event:BlobEvent){
        console.log(event);
        if (event.data && event.data.size > 0) {
            this.recordedBlobs.push(event.data);
        }
    }

    private isStreamAvailable(){
        return this.options.stream != undefined || this.options.stream!=null;
    }
    getSupportedMimeType(): string[] {
        return this._getSupportedMimeType();
    }

    _getSupportedMimeType(){
        return MimeTypes.filter((mimeType)=>{
            return this._isMimeTypeSupported(mimeType)

        })
    }

    _isMimeTypeSupported(mimeType:string){
        return MediaRecorder.isTypeSupported(mimeType);
    }

    private async _getUserMedia(){
        return  navigator.mediaDevices.getUserMedia(this.options.constraints);
    }

}