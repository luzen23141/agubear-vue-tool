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
        
        content = content.replace(f"import {{ {camel} }}", f"import {{ {pascal} }}")
        content = content.replace(f"import {{ {camel} as", f"import {{ {pascal} as")
        content = content.replace(f" {camel}(", f" {pascal}(")
        content = content.replace(f" {camel})", f" {pascal})")
        content = content.replace(f"({camel}(", f"({pascal}(")
        content = content.replace(f"{{ {camel} }}", f"{{ {pascal} }}")
        content = content.replace(f"{camel}: () =>", f"{pascal}: () =>")
        content = content.replace(f"const {camel} =", f"const {pascal} =")
        # Also fix any vi.mock where the export name is defined
        content = content.replace(f"{camel}: vi.fn", f"{pascal}: vi.fn")
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed PascalCase in {file}")
