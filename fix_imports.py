import os
import glob
import re

files_to_check = glob.glob('src/**/*.ts', recursive=True) + glob.glob('src/**/*.vue', recursive=True)

replacements = [
    (r"useColorConverter", "use-color-converter"),
    (r"useCommands", "use-commands"),
    (r"useHistory", "use-history"),
    (r"useJsonFormatter", "use-json-formatter"),
    (r"useLocalStorage", "use-local-storage"),
    (r"useQrCode", "use-qr-code"),
    (r"useTheme", "use-theme"),
    (r"useTimestampConverter", "use-timestamp-converter"),
    (r"useTwoWayConverter", "use-two-way-converter"),
    (r"UseTimestampConverter", "use-timestamp-converter")
]

for file in files_to_check:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    for camel, kebab in replacements:
        # replace in paths
        content = re.sub(rf"(['\"](?:./|../)+composables/){camel}(['\"])", rf"\1{kebab}\2", content)
        content = re.sub(rf"(['\"]@/composables/){camel}(['\"])", rf"\1{kebab}\2", content)
        content = re.sub(rf"(['\"]\./){camel}(['\"])", rf"\1{kebab}\2", content)
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")
