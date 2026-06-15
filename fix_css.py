import re

with open("app/globals.css", "r") as f:
    content = f.read()

# Replace single-line @utility definitions with class definitions
content = re.sub(r'@utility\s+([a-zA-Z0-9_-]+)\s*\{\s*(.*?)\s*\}', r'.\1 { \2 }', content)

with open("app/globals.css", "w") as f:
    f.write(content)
