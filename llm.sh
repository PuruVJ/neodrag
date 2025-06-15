#!/bin/bash

# Create or clear the output file
output_file="llm.md"
echo "# TypeScript Files Collection" > "$output_file"

# Function to add a file to the collection
add_file_to_collection() {
    local file="$1"
    local base_path="$2"
    
    # Extract relative path
    if [ -n "$base_path" ]; then
        relative_path=$(echo "$file" | sed "s|^$base_path/||")
    else
        relative_path="$file"
    fi
    
    # Add file heading with path
    echo -e "\n## File: $relative_path\n" >> "$output_file"
    
    # Add the code with proper fencing
    echo '```typescript' >> "$output_file"
    cat "$file" >> "$output_file"
    echo '```' >> "$output_file"
    
    # Add a separator
    echo -e "\n---\n" >> "$output_file"
}

# Find all TypeScript files in packages/*/src/*.ts, excluding .svelte-kit directories
echo "Collecting TypeScript files from packages/*/src/..."
find packages -path "packages/*/src/*.ts" -not -path "*/.svelte-kit/*" | sort | while read -r file; do
    add_file_to_collection "$file" "packages"
done

# Find all .mdx files recursively in docs/src/content
if [ -d "docs/src/content" ]; then
    echo "Collecting .mdx files from docs/src/content/..."
    find docs/src/content -name "*.mdx" -type f | sort | while read -r file; do
        # Extract relative path
        relative_path=$(echo "$file" | sed 's|^docs/src/content/||')
        
        # Add file heading with path
        echo -e "\n## File: docs/src/content/$relative_path\n" >> "$output_file"
        
        # Add the code with markdown syntax highlighting
        echo '```markdown' >> "$output_file"
        cat "$file" >> "$output_file"
        echo '```' >> "$output_file"
        
        # Add a separator
        echo -e "\n---\n" >> "$output_file"
    done
fi

echo "Collection complete. Output written to $output_file"
echo "Summary:"
echo "- Collected TypeScript files from packages/*/src/ (excluding .svelte-kit)"
echo "- Collected .mdx files recursively from docs/src/content/"