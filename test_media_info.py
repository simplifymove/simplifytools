import sys
sys.path.insert(0, r'i:\Raghava\Copilot-works\simplifyconvertapp\python\utils')
from ffmpeg_utils import get_media_info

try:
    info = get_media_info(r'i:\Raghava\Copilot-works\simplifyconvertapp\test_video.mp4')
    print(f'Video duration: {info.get("duration")}')
    print(f'Video codec: {info.get("codec")}')
    print('SUCCESS: get_media_info works')
except Exception as e:
    print(f'ERROR: {e}')
