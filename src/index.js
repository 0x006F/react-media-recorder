import React from "react";
import PropTypes from "prop-types";

export default class ReactMediaRecorder extends React.Component {
  state = {
    status: "idle"
  };
  chunks = [];

  static propTypes = {
    audio: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    video: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    muted: ({ muted, audio, video }) => {
      if (typeof muted !== "boolean") {
        return new Error(
          `Invalid prop: muted should be a boolan value. Please check your react-media-recorder component declaration`
        );
      }
      if (muted && (audio && !video)) {
        return new Error(
          `It looks like you tried to mute as well as record audio. Please check your react-media-recorder component declaration`
        );
      }
    },
    render: PropTypes.func.isRequired,
    blobPropertyBag: PropTypes.object
  };

  static defaultProps = {
    audio: true,
    muted: false,
    render: () => null
  };

  constructor(props) {
    super(props);
    if (!window.MediaRecorder) {
      throw new Error("React Media Recorder: Unsupported browser");
    }
    let {
      audio,
      video,
      muted,
      blobPropertyBag = video ? { type: "video/mp4" } : { type: "audio/wav" }
    } = props;

    // We can blindly set audio != muted. But then the getMediaStream() won't work (no audio/video) and will throw an error.
    // So we simply ignore the mute all the time except video is enabled.
    // The PropType will throw an error just in case if audio and muted are both enabled.
    if (video && muted) {
      audio = false;
    }
    this.requiredMedia = {
      audio: typeof audio === "boolean" ? !!audio : audio,
      video: typeof video === "boolean" ? !!video : video
    };
    this.blobPropertyBag = blobPropertyBag;
  }

  componentDidMount = async () => {
    const stream = await this.getMediaStream();
    if (stream) {
      this.stream = stream;
    } else {
      this.setState({ status: "permission_denied" });
    }
  };

  getMediaStream = async () => {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia(
        this.requiredMedia
      );
      return stream;
    } catch (error) {
      return false;
    }
  };

  onRecordingStop = () => {
    const blob = new Blob(this.chunks, this.blobPropertyBag);
    const url = URL.createObjectURL(blob);
    this.setState({ mediaBlob: url });
  };

  onRecordingActive = ({ data }) => {
    this.chunks.push(data);
  };

  initMediaRecorder = stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = this.onRecordingActive;
    mediaRecorder.onstop = this.onRecordingStop;
    mediaRecorder.onerror = () => this.setState({ status: "recorder_error" });
    return mediaRecorder;
  };

  startRecording = async () => {
    if (!this.stream || (this.stream && !this.stream.active)) {
      const stream = await this.getMediaStream();
      if (stream) {
        this.stream = stream;
      } else {
        this.setState({ status: "permission_denied" });
        return;
      }
    }
    this.mediaRecorder = this.initMediaRecorder(this.stream);
    this.chunks = [];
    this.setState({ mediaBlob: null });
    this.mediaRecorder.start();
    this.setState({ status: "recording" });
  };

  pauseRecording = () => {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.setState({ status: "paused" });
      this.mediaRecorder.pause();
    }
  };

  resumeRecording = () => {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.setState({ status: "recording" });
      this.mediaRecorder.resume();
    }
  };

  stopRecording = () => {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
      this.setState({ status: "stopped" });
    }
  };

  render = () =>
    this.props.render({
      status: this.state.status,
      startRecording: this.startRecording,
      stopRecording: this.stopRecording,
      pauseRecording: this.pauseRecording,
      resumeRecording: this.resumeRecording,
      mediaBlob: this.state.mediaBlob
    });
}
