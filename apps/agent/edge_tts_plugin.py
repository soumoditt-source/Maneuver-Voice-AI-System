import asyncio
import io
import edge_tts
import miniaudio
from livekit import rtc
from livekit.agents import tts
from livekit.agents.tts import SynthesizedAudio, TTSCapabilities
import logging

logger = logging.getLogger("edge_tts")

class EdgeTTS(tts.TTS):
    def __init__(self, voice: str = "en-US-JennyNeural"):
        super().__init__(capabilities=TTSCapabilities(streaming=False), sample_rate=24000, num_channels=1)
        self._voice = voice
    
    def synthesize(self, text: str, **kwargs) -> tts.ChunkedStream:
        return EdgeChunkedStream(text, self._voice, tts=self, input_text=text)

class EdgeChunkedStream(tts.ChunkedStream):
    def __init__(self, text: str, voice: str, *, tts, input_text):
        super().__init__(tts=tts, input_text=input_text)
        self._text = text
        self._voice = voice
        
    async def _run(self):
        try:
            logger.info(f"EdgeTTS synthesizing text: {self._text}")
            communicate = edge_tts.Communicate(self._text, self._voice)
            audio_data = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.extend(chunk["data"])
                    
            if len(audio_data) > 0:
                # Convert MP3 to PCM
                decoded = miniaudio.decode(bytes(audio_data), nchannels=1, sample_rate=24000)
                
                # Create AudioFrame
                audio_frame = rtc.AudioFrame(
                    data=decoded.samples.tobytes(),
                    sample_rate=24000,
                    num_channels=1,
                    samples_per_channel=len(decoded.samples) // 2  # 16-bit audio
                )
                
                # Send frame
                self._event_ch.send_nowait(
                    tts.SynthesizedAudio(
                        request_id=self._request_id if hasattr(self, '_request_id') else "",
                        frame=audio_frame,
                    )
                )
        except Exception as e:
            logger.error(f"EdgeTTS error: {e}")
