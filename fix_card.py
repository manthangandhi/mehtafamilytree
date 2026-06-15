import re

with open("app/globals.css", "r") as f:
    content = f.read()

content = content.replace("@apply bg-surface-container-lowest organic-card border border-outline-variant/30 organic-glow;", 
"""background-color: var(--color-surface-container-lowest);
  border-radius: 2rem 0.5rem 2rem 0.5rem;
  border: 1px solid rgba(216, 195, 180, 0.3);
  box-shadow: 0 10px 40px -15px rgba(141, 79, 17, 0.1);""")

content = content.replace(".organic-glow { box-shadow: 0 10px 40px -15px rgba(141, 79, 17, 0.1); }", "")
content = content.replace(".organic-card { border-radius: 2rem 0.5rem 2rem 0.5rem; }", "")

with open("app/globals.css", "w") as f:
    f.write(content)
