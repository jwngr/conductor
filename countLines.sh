#! /bin/bash

for dir in packages/*; do
    echo "Directory: $dir"
    npx cloc $(git ls-files $dir)
done
