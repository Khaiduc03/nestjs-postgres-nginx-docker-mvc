

##state build
FROM node:18.18.0-alpine as builder

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build
## stage 2
FROM node:18.18.0-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/services-account.json  /app/dist dist/

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/public ./public

COPY .env.production /app/.env

EXPOSE 8000


CMD ["node", "dist/main"]



#################################
#  #node version
# FROM node:18.16.0-alpine

# # set working directory
# WORKDIR /app

# # copy package.json
# COPY . ./

# # install dependencies
# RUN yarn cache clean --force
# RUN yarn

# # expose port
# EXPOSE 8000

# # start app

# CMD ["yarn", "dev"]
