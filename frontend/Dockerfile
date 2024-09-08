# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: isouaidi <isouaidi@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/24 14:30:21 by npatron           #+#    #+#              #
#    Updated: 2024/09/05 19:05:45 by isouaidi         ###   ########.fr        #
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
