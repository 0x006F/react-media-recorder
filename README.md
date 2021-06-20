# react-media-recorder :o2: :video_camera: :microphone: :computer:

`react-media-recorder` is a fully typed react component with render prop, or a react hook, that can be used to:

- Record audio/video
- Record screen

using [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).

## Installation

```
npm i react-media-recorder
```

or

```
yarn add react-media-recorder
```

## Usage

```javascript
import { ReactMediaRecorder } from "react-media-recorder";

const RecordView = () => (
  <div>
    <ReactMediaRecorder
      video
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
          <video src={mediaBlobUrl} controls autoPlay loop />
        </div>
      )}
    />
  </div>
);
```

Since `react-media-recording` uses render prop, you can define what to render in the view. Just don't forget to wire the `startRecording`, `stopRecording` and `mediaBlobUrl` to your component.

## Usage with react hooks

```javascript
import { useReactMediaRecorder } from "react-media-recorder";

const RecordView = () => {
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ video: true });

  return (
    <div>
      <p>{status}</p>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <video src={mediaBlobUrl} controls autoPlay loop />
    </div>
  );
};
```

The hook receives an object as argument with the same ReactMediaRecorder options / props (except the `render` function).

### Options / Props

#### audio

Can be either a boolean value or a [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints) object.

type: `boolean` or `object`  
default: `true`

#### blobPropertyBag

[From MDN](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob):  
An optional `BlobPropertyBag` dictionary which may specify the following two attributes (for the `mediaBlob`):

- `type`, that represents the MIME type of the content of the array that will be put in the blob.
- `endings`, with a default value of "transparent", that specifies how strings containing the line ending character \n are to be written out. It is one of the two values: "native", meaning that line ending characters are changed to match host OS filesystem convention, or "transparent", meaning that endings are stored in the blob without change

type: `object`  
default:  
if `video` is enabled,

```
{
   type: "video/mp4"
}
```

if there's only `audio` is enabled,

```
{
  type: "audio/wav"
}
```

#### mediaRecorderOptions

An optional options object that will be passed to `MediaRecorder`. Please note that if you specify the MIME type via either `audio` or `video` prop _and_ through this `mediaRecorderOptions`, the `mediaRecorderOptions` have higher precedence.

type: `object`  
default: `{}`

#### onStop

A `function` that would get invoked when the MediaRecorder stops. It'll provide the blob and the blob url as its params.

type: `function(blobUrl: string, blob: Blob)`  
default: `() => null`

#### render

A `function` which accepts an object containing fields: `status`, `startRecording`, `stopRecording` and`mediaBlob`. This function would return a react element/component.

type: `function`  
default: `() => null`

#### screen

A `boolean` value. Lets you to record your current screen. Not all browsers would support this. Please [check here](https://caniuse.com/#search=getDisplayMedia) for the availability. Please note that at the moment, the MediaRecorder won't record two alike streams at a time, if you provide both `screen` and `video` prop, the **screen capturing will take precedence** than the video capturing. But, you can provide the `video` prop (_as the MediaTrackConstraints_) which will then utilized by screen capture (for example, `height`, `width` etc..)

#### video

Can be either a boolean value or a [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints) object.

type: `boolean` or `object`  
default: `false`

### Props available in the `render` function

#### error

A string enum. Possible values:

- `media_aborted`
- `permission_denied`
- `no_specified_media_found`
- `media_in_use`
- `invalid_media_constraints`
- `no_constraints`
- `recorder_error`

#### status

A string `enum`. Possible values:

- `media_aborted`
- `permission_denied`
- `no_specified_media_found`
- `media_in_use`
- `invalid_media_constraints`
- `no_constraints`
- `recorder_error`
- `idle`
- `acquiring_media`
- `recording`
- `stopping`
- `stopped`

#### startRecording

A `function`, which starts recording when invoked.

#### pauseRecording

A `function`, which pauses the recording when invoked.

#### resumeRecording

A `function`, which resumes the recording when invoked.

#### stopRecording

A `function`, which stops recording when invoked.

#### muteAudio

A `function`, which mutes the audio tracks when invoked.

#### unmuteAudio

A `function` which unmutes the audio tracks when invoked.

#### mediaBlobUrl

A `blob` url that can be wired to an `<audio />`, `<video />` or an `<a />` element.

#### clearBlobUrl

A `function` which clears the existing generated blob url (if any)

#### isMuted

A boolean prop that tells whether the audio is muted or not.

#### previewStream

If you want to create a live-preview of the video to the user, you can use this _stream_ and attach it to a `<video />` element. Please note that this is a **muted stream**. This is by design to get rid of internal microphone feedbacks on machines like laptop.

For example:

```tsx
const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (!stream) {
    return null;
  }
  return <video ref={videoRef} width={500} height={500} autoPlay controls />;
};

const App = () => (
  <ReactMediaRecorder
    video
    render={({ previewStream }) => {
      return <VideoPreview stream={previewStream} />;
    }}
  />
);
```

#### previewAudioStream

If you want access to the live audio stream for use in sound visualisations, you can use this _stream_ as your audio source and extract data from it using the [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) and [AnalyzerNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) features of the Web Audio API. Some javascript examples of how to do this can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API).

## Contributing

Feel free to submit a PR if you found a bug (I might've missed many! :grinning:) or if you want to enhance it further.

Thanks!. Happy Recording!
