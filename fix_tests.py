import os
import glob
import re

test_files = glob.glob('src/tests/**/*.test.ts', recursive=True)
test_files += glob.glob('src/composables/**/*.ts', recursive=True)

for file in test_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Fix import paths
    content = re.sub(r"['\"]@/composables/useHistory['\"]", "'@/composables/use-history'", content)
    content = re.sub(r"['\"]../../composables/useHistory['\"]", "'@/composables/use-history'", content)
    content = re.sub(r"['\"]\.\./composables/useHistory['\"]", "'@/composables/use-history'", content)
    
    # Fix named exports
    content = content.replace("import { useHistory }", "import { UseHistory }")
    content = content.replace(" useHistory(", " UseHistory(")
    content = content.replace(" useHistory)", " UseHistory)")
    content = content.replace("{ useHistory }", "{ UseHistory }")
    content = content.replace("useHistory: () =>", "UseHistory: () =>")
    
    # Fix mock ref issue
    if "UseHistory: () => ({" in content and "history: mockHistory" in content:
        if "import { ref }" not in content:
            content = content.replace("import { mount }", "import { mount }\nimport { ref }")
        content = content.replace("history: mockHistory", "history: ref(mockHistory)")
        
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file}")
