# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: isouaidi <isouaidi@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/24 14:30:21 by npatron           #+#    #+#              #
#    Updated: 2024/08/30 16:57:44 by isouaidi         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
