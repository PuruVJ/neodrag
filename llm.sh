#!/bin/bash

# Parse command line arguments
input_dir="${1:-.}"  # Default to current directory if not provided
output_file="${2:-llm.md}"  # Default to llm.md if not provided

# Convert to absolute paths
input_dir=$(realpath "$input_dir")
output_file=$(realpath "$output_file")

# Create or clear the output file
echo "# TypeScript Files Collection" > "$output_file"

# Function to add a file to the collection
add_file_to_collection() {
    local file="$1"
    local base_path="$2"
    
    # Extract relative path
    if [ -n "$base_path" ] && [ "$base_path" != "." ]; then
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

# Change to the input directory
cd "$input_dir" || { echo "Error: Cannot access directory '$input_dir'"; exit 1; }

# Find all TypeScript files in packages/*/src/*.ts, excluding .svelte-kit, .turbo, and .astro directories
if [ -d "packages" ]; then
    echo "Collecting TypeScript files from packages/*/src/..."
    find packages -path "packages/*/src/*.ts" -not -path "*/.svelte-kit/*" -not -path "*/.turbo/*" -not -path "*/.astro/*" | sort | while read -r file; do
        add_file_to_collection "$file" "packages"
    done
fi

# Find all Svelte files, excluding .svelte-kit, .turbo, .astro, coverage, and node_modules directories
echo "Collecting Svelte files..."
find . -name "*.svelte" -not -path "*/.svelte-kit/*" -not -path "*/.turbo/*" -not -path "*/.astro/*" -not -path "*/coverage/*" -not -path "*/node_modules/*" | sort | while read -r file; do
    # Extract relative path
    relative_path=$(echo "$file" | sed 's|^\./||')
    
    # Add file heading with path
    echo -e "\n## File: $relative_path\n" >> "$output_file"
    
    # Add the code with svelte syntax highlighting
    echo '```svelte' >> "$output_file"
    cat "$file" >> "$output_file"
    echo '```' >> "$output_file"
    
    # Add a separator
    echo -e "\n---\n" >> "$output_file"
done

# Find all JSON files, excluding .svelte-kit, .turbo, .astro, coverage, sizes.json, and node_modules directories
echo "Collecting JSON files..."
find . -name "*.json" -not -path "*/.svelte-kit/*" -not -path "*/.turbo/*" -not -path "*/.astro/*" -not -path "*/coverage/*" -not -path "*/node_modules/*" -not -name "sizes.json" | sort | while read -r file; do
    # Extract relative path
    relative_path=$(echo "$file" | sed 's|^\./||')
    
    # Add file heading with path
    echo -e "\n## File: $relative_path\n" >> "$output_file"
    
    # Add the code with json syntax highlighting
    echo '```json' >> "$output_file"
    cat "$file" >> "$output_file"
    echo '```' >> "$output_file"
    
    # Add a separator
    echo -e "\n---\n" >> "$output_file"
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
        echo '```md' >> "$output_file"
        cat "$file" >> "$output_file"
        echo '```' >> "$output_file"
        
        # Add a separator
        echo -e "\n---\n" >> "$output_file"
    done
fi

echo "Collection complete. Output written to $output_file"
echo "Summary:"
echo "- Input directory: $input_dir"
echo "- Output file: $output_file"
echo "- Collected TypeScript files from packages/*/src/ (excluding .svelte-kit, .turbo, .astro)"
echo "- Collected Svelte files (excluding .svelte-kit, .turbo, .astro, coverage, and node_modules)"
echo "- Collected JSON files (excluding .svelte-kit, .turbo, .astro, coverage, sizes.json, and node_modules)"
echo "- Collected .mdx files recursively from docs/src/content/"