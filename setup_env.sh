#!/bin/bash

# Récupère le hostname actuel
HOSTNAME=$(hostname)

# Utilise une expression régulière pour extraire la partie souhaitée du hostname (avant le premier point)
if [[ $HOSTNAME =~ ^([^.]+) ]]; then
    HOST_PART="${BASH_REMATCH[1]}"
else
    echo "Erreur: Impossible de récupérer la partie souhaitée du hostname."
    exit 1
fi

# Définition du chemin vers les fichiers .env du projet
ENV_FILE=".env"
FRONTEND_ENV="frontend/.env"
BACKEND_ENV="backend/.env"

# Ajouter la variable d'environnement dans le fichier principal .env
echo "HOST_PART=$HOST_PART" > $ENV_FILE

# Propager la variable dans les fichiers .env du frontend et du backend
echo "REACT_APP_HOST_PART=$HOST_PART" > $FRONTEND_ENV
echo "HOST_PART=$HOST_PART" > $BACKEND_ENV

# Remplace `localhost` par la variable dans tous les fichiers .env, .js, .ts, .py, .yml, etc.
# Types de fichiers où faire le remplacement
# BASE_DIR="."  # Répertoire de base du projet
# for file in $(find "$BASE_DIR" -type f \( -name "*.env" -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.yml" \)); do
#     sed -i "s/localhost/\$HOST_PART/g" "$file"
#     echo "Remplacement de localhost par \$HOST_PART dans $file"
# done

# echo "Configuration terminée avec succès. HOST_PART=$HOST_PART ajouté dans tous les fichiers nécessaires."
