import re

with open("app/globals.css", "r") as f:
    content = f.read()

# Fix .btn
content = content.replace("@apply inline-flex items-center justify-center px-6 py-3 font-label-lg rounded-full transition-all;", 
"""@apply inline-flex items-center justify-center px-6 py-3 rounded-full transition-all;
  font-family: var(--font-label-lg);""")

# Any other custom utilities in apply?
# bg-primary, text-on-primary are from @theme so they ARE utilities!
# bg-surface-container-high is from @theme.
# text-on-surface-variant is from @theme.
# border-outline-variant is from @theme.

with open("app/globals.css", "w") as f:
    f.write(content)
