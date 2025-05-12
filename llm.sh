#!/bin/bash

# Create or clear the output file
output_file="llm.md"
echo "# TypeScript Files Collection" > "$output_file"

# Find all TypeScript files in packages/*/src/*.ts
find packages -path "packages/*/src/*.ts" | sort | while read -r file; do
    # Extract the file name for the heading
    filename=$(basename "$file")
    relative_path=$(echo "$file" | sed 's|packages/||')
    
    # Add file heading with path
    echo -e "\n## File: $relative_path\n" >> "$output_file"
    
    # Add the code with proper fencing
    echo '```typescript' >> "$output_file"
    cat "$file" >> "$output_file"
    echo '```' >> "$output_file"
    
    # Add a separator
    echo -e "\n---\n" >> "$output_file"
done

echo "Collection complete. Output written to $output_file"