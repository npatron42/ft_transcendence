#!/bin/bash

# Récupérer la première partie du hostname
new_host=$(hostname | cut -d'.' -f1)

# Fichiers .env à modifier
env_files=(".env" "./frontend/.env" "./backend/.env")

for file in "${env_files[@]}"; do
    if [[ -f "$file" ]]; then
        if [[ "$file" == "./frontend/.env" ]]; then
            # Remplacez la ligne VITE_HOST par la nouvelle valeur
            if grep -q "^VITE_HOST=" "$file"; then
                sed -i.bak "s/^VITE_HOST=.*/VITE_HOST=$new_host/" "$file"
            else
                echo "VITE_HOST=$new_host" >> "$file"
            fi
            echo "Mis à jour : $file avec VITE_HOST=$new_host"
        else
            # Remplacez la ligne HOST par la nouvelle valeur
            if grep -q "^HOST=" "$file"; then
                sed -i.bak "s/^HOST=.*/HOST=$new_host/" "$file"
            else
                echo "HOST=$new_host" >> "$file"
            fi
            echo "Mis à jour : $file avec HOST=$new_host"
        fi
    else
        echo "Fichier non trouvé : $file"
    fi
done