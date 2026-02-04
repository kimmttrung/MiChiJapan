import re

def extract_lat_lng(map_url: str):
    """
    Hỗ trợ link Google Maps dạng:
    https://www.google.com/maps?q=21.028511,105.804817
    https://www.google.com/maps/place/.../@21.028511,105.804817,17z
    """

    pattern = r"@(-?\d+\.\d+),(-?\d+\.\d+)"
    match = re.search(pattern, map_url)

    if match:
        return float(match.group(1)), float(match.group(2))

    pattern_q = r"q=(-?\d+\.\d+),(-?\d+\.\d+)"
    match_q = re.search(pattern_q, map_url)

    if match_q:
        return float(match_q.group(1)), float(match_q.group(2))

    return None, None
