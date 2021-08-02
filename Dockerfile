FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY . /usr/src/app/FUXA/
WORKDIR /usr/src/app/FUXA

# Install server
WORKDIR /usr/src/app/FUXA/server
RUN npm install

WORKDIR /usr/src/app/FUXA/server
EXPOSE 1881
CMD [ "npm", "start" ]