import os
import glob

root = 'lib/features'
fixed = 0
for f in glob.glob(os.path.join(root, '**', '*.dart'), recursive=True):
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if '"' + "'" + "'" in content:
        content = content.replace('"' + "'" + "'", '"')
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        fixed += 1
        print(f'Fixed: {f}')

# Also fix core/theme/app_theme.dart CardTheme -> CardThemeData
theme_file = 'lib/core/theme/app_theme.dart'
with open(theme_file, 'r', encoding='utf-8') as fh:
    content = fh.read()

# Flutter 3.41 uses CardThemeData instead of CardTheme
content = content.replace('CardTheme(', 'CardThemeData(')
with open(theme_file, 'w', encoding='utf-8') as fh:
    fh.write(content)
print(f'Fixed: {theme_file} (CardTheme -> CardThemeData)')

print(f'Total files fixed: {fixed + 1}')
