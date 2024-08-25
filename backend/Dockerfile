# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: npatron <npatron@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/19 20:25:37 by npatron           #+#    #+#              #
#    Updated: 2024/08/25 13:04:55 by npatron          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM python:3.12-alpine

WORKDIR /backend

COPY . /backend
COPY requirements.txt /backend

RUN apk add gcc musl-dev postgresql-client
RUN pip install --no-cache-dir -r /backend/requirements.txt

EXPOSE 8000

CMD ["sh", "migrate.sh"]
