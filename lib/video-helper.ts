export interface VideoEmbedInfo {
  isDirectVideo: boolean;
  embedUrl: string | null;
  rawUrl: string;
}

export function parseVideoUrl(url: string): VideoEmbedInfo {
  if (!url || typeof url !== "string") {
    return { isDirectVideo: false, embedUrl: null, rawUrl: "" };
  }

  const trimmed = url.trim();

  // 1. Direct video formats
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { isDirectVideo: true, embedUrl: trimmed, rawUrl: trimmed };
  }

  // 2. YouTube full URL: youtube.com/watch?v=ID or youtube.com/embed/ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      isDirectVideo: false,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      rawUrl: trimmed,
    };
  }

  // 3. YouTube Shorts URL: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]+)/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      isDirectVideo: false,
      embedUrl: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`,
      rawUrl: trimmed,
    };
  }

  // 4. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      isDirectVideo: false,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      rawUrl: trimmed,
    };
  }

  // 5. Loom
  const loomMatch = trimmed.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      isDirectVideo: false,
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      rawUrl: trimmed,
    };
  }

  // Fallback: If it's already an embed URL or standard https link
  return {
    isDirectVideo: false,
    embedUrl: trimmed,
    rawUrl: trimmed,
  };
}

