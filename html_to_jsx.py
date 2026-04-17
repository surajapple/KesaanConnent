import sys
import re

def html_to_jsx(html):
    # Extract body content if <body> tag exists
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if body_match:
        html = body_match.group(1)
        
    # Replace attributes
    html = re.sub(r'\bclass=', 'className=', html)
    html = re.sub(r'\bfor=', 'htmlFor=', html)
    html = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', html, flags=re.DOTALL)
    
    # SVG attributes to camelCase
    html = html.replace('viewbox=', 'viewBox=')
    html = html.replace('stroke-width=', 'strokeWidth=')
    html = html.replace('stroke-linecap=', 'strokeLinecap=')
    html = html.replace('stroke-linejoin=', 'strokeLinejoin=')
    html = html.replace('fill-rule=', 'fillRule=')
    html = html.replace('clip-rule=', 'clipRule=')

    # Self-closing tags (img, input, br, hr)
    # Match <img ... > and ensure it ends with />
    html = re.sub(r'<(img|input|br|hr)([^>]*?)(?<!/)>', r'<\1\2 />', html)

    return html

if __name__ == "__main__":
    with open(sys.argv[1], 'r') as f:
        html_content = f.read()
    
    jsx_content = html_to_jsx(html_content)
    
    # Get component name from args or default
    comp_name = sys.argv[3] if len(sys.argv) > 3 else 'Component'
    
    out_path = sys.argv[2]
    with open(out_path, 'w') as f:
        f.write("import React from 'react';\n\n")
        f.write(f"export default function {comp_name}() {{\n")
        f.write("  return (\n    <>\n")
        f.write(jsx_content)
        f.write("\n    </>\n  );\n}\n")
