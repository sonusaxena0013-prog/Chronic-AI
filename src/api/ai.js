import {
  askOpenRouter,
  streamOpenRouter,
} from "../services/openrouter";

export async function getAIResponse(
  messages,
  imageBase64 = null
) {
  return askOpenRouter(
    messages,
    imageBase64
  );
}

export async function getStreamingResponse(
  messages,
  onChunk,
  signal,
  imageBase64 = null
) {
  return streamOpenRouter(
    messages,
    onChunk,
    signal,
    imageBase64
  );
}