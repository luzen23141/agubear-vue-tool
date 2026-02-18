#!/usr/bin/env python3
import json, re, glob, os

# Simple emoji regex - match common emoji ranges + variation selectors + ZWJ
emoji_re = re.compile(
    '[\U0001F300-\U0001F9FF'   # Emoticons, symbols, etc
    '\U0001FA00-\U0001FAFF'    # Extended
    '\U00002600-\U000027BF'    # Misc symbols, dingbats 
    '\U0000FE0F'               # Variation selector
    '\U0000200D'               # ZWJ
    '\U00002B05-\U00002B07'    # Arrows
    '\U00002B1B-\U00002B1C'    # Squares
    '\U00002B50'               # Star
    '\U0000231A-\U0000231B'    # Watch/Hourglass
    '\U000023E9-\U000023FA'    # Various media
    '\U000025AA-\U000025FE'    # Geometric
    '\U00003030\U0000303D'     # Wavy dash
    '\U00003297\U00003299'     # CJK
    ']+'
)

locale_dir = '/Users/alex/Code/front/timestamp-converter/src/locales'
total = 0

for fp in sorted(glob.glob(os.path.join(locale_dir, '*.json'))):
    with open(fp, 'r') as f:
        text = f.read()
    
    new_text = emoji_re.sub('', text)
    # Clean up leftover leading spaces from "emoji space text" -> " text"
    # Fix double spaces
    new_text = re.sub(r'": " ', '": "', new_text)
    new_text = re.sub(r'  +', ' ', new_text)
    
    if new_text != text:
        count = len(emoji_re.findall(text))
        total += count
        with open(fp, 'w') as f:
            f.write(new_text)
        print(f'{os.path.basename(fp)}: {count} emoji removed')

print(f'\nTotal: {total} emoji removed')
