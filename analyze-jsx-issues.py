#!/usr/bin/env python3
import os
import re

issues = []

# Get all page.tsx files in app/all-tools
for root, dirs, files in os.walk("app/all-tools"):
    if "page.tsx" in files:
        filepath = os.path.join(root, "page.tsx")
        rel_path = filepath.replace(os.sep, "/")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
        except:
            continue
        
        # Check for duplicate </main> tags
        main_count = content.count('</main>')
        if main_count > 1:
            # Find all line numbers
            main_lines = []
            for i, line in enumerate(lines, 1):
                if '</main>' in line:
                    main_lines.append(i)
            issues.append({
                'file': rel_path,
                'line': main_lines[0],
                'issue': f'duplicate </main> tags ({main_count} found, lines: {", ".join(map(str, main_lines))})',
                'type': 'duplicate_main'
            })
        
        # Check for code appearing AFTER closing JSX and closing brace
        # Pattern: </> or </main> followed by } then code like "const", "function", etc.
        closing_bracket_pattern = re.compile(r'^\s*}\s*$')
        
        for i, line in enumerate(lines):
            if closing_bracket_pattern.match(line):
                # Check next 5 lines for code
                for j in range(i+1, min(i+6, len(lines))):
                    if lines[j].strip() and not lines[j].strip().startswith('//'):
                        # Check if it's actual code
                        if re.match(r'^\s*(const|function|interface|let|var|return|class|type)', lines[j]):
                            issues.append({
                                'file': rel_path,
                                'line': i + 1,  # Report the closing brace line
                                'issue': f'code appearing after closing brace (line {j+1}: {lines[j][:50]}...)',
                                'type': 'code_after_close'
                            })
                            break
                        elif lines[j].strip():
                            # Non-code found, stop checking
                            break

# Sort issues by file and line number
issues.sort(key=lambda x: (x['file'], x['line']))

# Print results
print(f"\n{'='*80}")
print(f"STRUCTURAL ISSUES FOUND: {len(issues)}")
print(f"{'='*80}\n")

for issue in issues:
    print(f"- {issue['file']}")
    print(f"  Line {issue['line']}: {issue['issue']}")
    print()

if not issues:
    print("No critical structural issues found.\n")
