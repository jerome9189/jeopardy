import { MediaClipData } from "../types";
import "./MediaClip.css";

export function mediaLabel(clip: MediaClipData): string {
  return [
    clip.image ? "IMAGE CLUE" : null,
    clip.audio ? "AUDIO CLUE" : null,
    clip.video ? "VIDEO CLUE" : null,
  ]
    .filter((label) => label !== null)
    .join(" \u00B7 ");
}

function MediaClip(props: MediaClipData) {
  const { image, audio, video } = props;
  if (image === undefined && audio === undefined && video === undefined) {
    return null;
  }
  return (
    <div className="media-clip">
      <div className="media-clip-label">{mediaLabel(props)}</div>
      {image !== undefined && (
        <img src={image} alt="" className="media-image" />
      )}
      {audio !== undefined && (
        <audio src={audio} controls className="media-audio" />
      )}
      {video !== undefined && (
        <video src={video} controls className="media-video" />
      )}
    </div>
  );
}

export default MediaClip;
