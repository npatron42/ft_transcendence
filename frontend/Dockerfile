# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: npatron <npatron@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/24 14:30:21 by npatron           #+#    #+#              #
#    Updated: 2024/12/04 18:47:46 by npatron          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install i18next react-i18next 

RUN npm install react-router-dom

COPY . .

CMD ["npm", "run", "dev"]
# ENTRYPOINT npm run build && npm run preview -- --port 5173