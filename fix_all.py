import os
import glob
import re

files_to_check = glob.glob('src/**/*.ts', recursive=True) + glob.glob('src/**/*.vue', recursive=True)

composables = [
    "ColorConverter",
    "Commands",
    "History",
    "JsonFormatter",
    "LocalStorage",
    "QrCode",
    "Theme",
    "TimestampConverter",
    "TwoWayConverter"
]

for file in files_to_check:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    for name in composables:
        camel = "use" + name
        pascal = "Use" + name
        
        content = re.sub(r'\b' + camel + r'\b', pascal, content)
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed bounds in {file}")
